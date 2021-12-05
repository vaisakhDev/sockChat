import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ChatService } from '../../services/chat.service';
import adapter from 'webrtc-adapter';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  // The polite peer uses rollback to avoid collision with an incoming offer.
  // The impolite peer ignores an incoming offer when this would collide with its own.
  @Input() isPolitePeer: boolean;
  public socketId: string = '';
  public userName: string = '';
  public showLobby = false;
  configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun.services.mozilla.com',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  public connection: RTCPeerConnection;
  public channel: RTCDataChannel;
  public logs: Array<{ msg: string; id: number }> = [];
  public msg = '';
  public gatheredCandidates: Array<RTCIceCandidate> = [];

  // keep track of some negotiation state to prevent races and errors
  private makingOffer = false;
  private ignoreOffer = false;

  constructor(
    private chatService: ChatService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log(adapter.browserDetails.browser);
    this.chatService.socketSubject.subscribe(
      (socketId) => (this.socketId = socketId)
    );
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStrem) => {
        for (const track of mediaStrem.getTracks()) {
          this.connection.addTrack(track);
        }
      });

    this.connection = new RTCPeerConnection(this.configuration);

    // Listen for local ICE candidates on the local RTCPeerConnection
    this.connection.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate) {
        console.log(this.gatheredCandidates);
        this.gatheredCandidates.push(candidate);
      }
      if (candidate && candidate.candidate) {
        console.log('Remote sdp', this.connection.remoteDescription);
        console.log('local sdp', this.connection.localDescription);
        this.addLog(
          `Sending ice candidate to remote : ${JSON.stringify(
            candidate.candidate
          )}`
        );
        console.log('ICE send', candidate);
        this.chatService.sendICE(candidate);
      }
    });

    // let the "negotiationneeded" event trigger offer generation
    this.connection.onnegotiationneeded = async () => {
      try {
        this.createDataChannel();
        this.makingOffer = true;
        console.log('Sending ofer');
        const offerDescription = await this.connection.createOffer();
        await this.connection.setLocalDescription(offerDescription);
        this.chatService.sendDescription(this.connection.localDescription);
      } catch (err) {
        console.error(err);
      } finally {
        this.makingOffer = false;
      }
    };

    // Listen for connectionstatechange on the local RTCPeerConnection
    this.connection.addEventListener('connectionstatechange', (event) => {
      this.addLog(
        `Connection state changed : ${this.connection.connectionState}`
      );

      // if (this.connection.connectionState === 'failed') {
      //   this.connection
      //     .createOffer({ iceRestart: true })
      //     .then((offerDescription) => {
      //       this.connection
      //         .setLocalDescription(offerDescription)
      //         .then(() => this.chatService.sendOfffer(offerDescription));
      //     });
      // }

      if (this.connection.connectionState === 'connected') {
        this.addLog('Peers connected');
      }
    });

    this.connection.oniceconnectionstatechange = () => {
      this.addLog(
        `Ice connection state change: ${this.connection.iceConnectionState}`
      );

      // if (this.connection.iceConnectionState === 'failed') {
      //   this.addLog('ICE connection ailed...restarting ICE...');
      //   /* possibly reconfigure the connection in some way here */
      //   /* then request ICE restart */
      //   // this.connection.restartIce();
      // }
    };
    this.connection.onicegatheringstatechange = (e) =>
      this.addLog(
        `Ice gathering state change: ${this.connection.iceGatheringState}`
      );

    this.connection.ondatachannel = (event) => {
      console.log('Data channel is created!');
      this.channel = event.channel;
      this.channel.onopen = () => {
        console.log('Data channel is open and ready to be used.');
      };

      this.channel.onmessage = (msg) =>
        this.handleDataChannelMessageReceived(msg);
    };

    this.chatService.getDescription().subscribe(async ({ description }) => {
      // if we receive a description(sdp) we prepare to respond with an answer or offer
      // first we check wether we are in a state in which we can accept an offer (i.e signalling state)
      /* If the connection's signaling state isn't stable or 
      if our end of the connection has started the process of making its own offer, then we need to look out for offer collision. */
      const cannotAcceptOffer =
        this.makingOffer || this.connection.signalingState != 'stable';
      const offerCollision = description.type === 'offer' && cannotAcceptOffer;

      /* If we're the impolite peer, and we're receiving a colliding offer,
       we return without setting the description,
        and instead set ignoreOffer to true to ensure we also ignore all candidates the other side may
         be sending us on the signaling channel belonging to this offer. 
         Doing so avoids error noise since we never informed our side about this offer. */

      if (!this.isPolitePeer && offerCollision) {
        return;
      }
      this.ignoreOffer = !this.isPolitePeer && offerCollision;

      // if the description is either offer or answer , anyway we will set the remote description
      await this.connection.setRemoteDescription(description);
      // but if the description is an offer we will have to send an answer to the caller
      if (description.type == 'offer') {
        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);
        this.chatService.sendDescription(answer);
      }
    });

    // this.chatService.getOffer().subscribe(async (message) => {
    //   this.addLog(
    //     'Recevived offer from caller...setting remote session description'
    //   );
    //   this.connection.setRemoteDescription(
    //     new RTCSessionDescription(message.offer)
    //   );
    //   this.addLog(
    //     'Setting local session description...sending answer to caller'
    //   );
    //   const answer = await this.connection.createAnswer();
    //   await this.connection.setLocalDescription(answer);
    //   this.chatService.sendAnswer(answer);
    // });

    // this.chatService.getAnswer().subscribe(async (message) => {
    //   this.addLog('Received answer from remote...');
    //   this.addLog('Setting remote session description...');
    //   const remoteDesc = new RTCSessionDescription(message.answer);
    //   await this.connection.setRemoteDescription(remoteDesc);
    // });

    this.chatService.getICE().subscribe((message) => {
      console.log('ICE rcv: ', message);

      this.addLog(
        `Receiving ice candidate from caller: ${JSON.stringify(
          message.candidate
        )}`
      );
      if (message && message.candidate) {
        this.connection.addIceCandidate(message);
      }
    });
  }

  private addLog(msg: string) {
    const logs = [...this.logs];
    logs.push({
      id: this.logs.length,
      msg: msg,
    });
    this.logs = [...logs];
    this.ref.detectChanges();
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
      var xH = chatWindow.scrollHeight;
      chatWindow.scrollTo(0, xH);
    }
  }

  private handleDataChannelMessageReceived(msg: any) {
    console.log(msg.data);
    this.addLog(`Remote : ${msg.data}`);
  }

  private createDataChannel() {
    this.channel = this.connection.createDataChannel('chat', {});
    this.channel.binaryType = 'arraybuffer';
    this.channel.onmessage = (msg) =>
      this.handleDataChannelMessageReceived(msg);
  }

  private async _initConnection() {
    this.createDataChannel();
    this.addLog(
      'Setting local session description and sending offer to remote'
    );
    const offerDescription = await this.connection.createOffer();
    await this.connection.setLocalDescription(offerDescription);
    // this.chatService.sendOfffer(offerDescription);
  }

  public enterLobby(userName: string) {
    this.userName = userName;
    this.showLobby = true;
    this.chatService.sendNotification(
      `${this.userName} just entered the lobby !!`
    );
  }

  public async callRemote() {
    //this._initConnection();
  }
  public sendMsg() {
    this.channel.send(this.msg);
    this.addLog(`You : ${this.msg}`);
  }

  public gettimeStamp(): string {
    return new Date().toISOString();
  }
}
