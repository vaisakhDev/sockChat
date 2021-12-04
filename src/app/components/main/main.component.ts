import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
  title = 'socket-chat';
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

  constructor(
    private chatService: ChatService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log(adapter.browserDetails.browser);
    this.chatService.socketSubject.subscribe(
      (socketId) => (this.socketId = socketId)
    );

    this.connection = new RTCPeerConnection(this.configuration);
    // Listen for local ICE candidates on the local RTCPeerConnection
    this.connection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        console.log(this.gatheredCandidates);
        this.gatheredCandidates.push(event.candidate);
      }
      if (event.candidate && event.candidate.candidate) {
        console.log('Remote sdp', this.connection.remoteDescription);
        console.log('local sdp', this.connection.localDescription);
        this.addLog('Sending ice candidate to remote...');
        console.log('ICE send', event.candidate);
        this.chatService.sendICE(event.candidate);
      }
    });
    // Listen for connectionstatechange on the local RTCPeerConnection
    this.connection.addEventListener('connectionstatechange', (event) => {
      this.addLog(
        `Connection state changed : ${this.connection.connectionState}`
      );

      if (this.connection.connectionState === 'connected') {
        this.addLog('Peers connected');
      }
    });

    this.connection.oniceconnectionstatechange = () =>
      this.addLog(
        `Ice connection state change: ${this.connection.iceConnectionState}`
      );
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

    this.chatService.getOffer().subscribe(async (message) => {
      this.addLog(
        'Recevived offer from caller...setting remote session description'
      );
      this.connection.setRemoteDescription(
        new RTCSessionDescription(message.offer)
      );
      this.addLog(
        'Setting local session description...sending answer to caller'
      );
      const answer = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answer);
      this.chatService.sendAnswer(answer);
    });

    this.chatService.getAnswer().subscribe(async (message) => {
      this.addLog('Received answer from remote...');
      this.addLog('Setting remote session description...');
      const remoteDesc = new RTCSessionDescription(message.answer);
      await this.connection.setRemoteDescription(remoteDesc);
    });

    this.chatService.getICE().subscribe((message) => {
      console.log('ICE rcv: ', message);

      this.addLog('Receiving ice candidate from caller...');

      this.connection.addIceCandidate(message);
    });
  }

  private addLog(msg: string) {
    console.log(msg);

    // this.logs = [
    //   ...this.logs,
    //   {
    //     id: this.logs.length,
    //     msg: msg,
    //   },
    // ];
    const logs = [...this.logs];
    logs.push({
      id: this.logs.length,
      msg: msg,
    });
    this.logs = [...logs];
    this.ref.detectChanges();
  }

  private handleDataChannelMessageReceived(msg: any) {
    console.log(msg.data);
    this.addLog(`Remote : ${msg.data}`);
  }

  private createDataChannel() {
    this.channel = this.connection.createDataChannel('chat', {});
    // this.connection.ondatachannel = (ev) =>
    //   this.addLog('Data channel conn. opened...');
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
    this.chatService.sendOfffer(offerDescription);
  }

  public enterLobby(userName: string) {
    this.userName = userName;
    this.showLobby = true;
    this.chatService.sendNotification(
      `${this.userName} just entered the lobby !!`
    );
  }

  public callRemote() {
    this._initConnection();
  }
  public sendMsg() {
    this.channel.send(this.msg);
    this.addLog(`You : ${this.msg}`);
  }
}
