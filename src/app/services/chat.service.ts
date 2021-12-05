import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public socketSubject: Subject<string>;
  public isPolite = false;
  constructor(private socket: Socket) {
    this.socketSubject = new Subject();
    this.socket.on('connect', () => {
      this.socketSubject.next(this.socket.ioSocket.id);
      this.socket.on('info', (msg: any) => {
        console.log(msg);
        this.isPolite = true;
      });
    });
  }

  public sendMessage(msg: { message: string; fromUserName: string }) {
    this.socket.emit('message', JSON.stringify(msg));
  }

  // public sendOfffer(offer: any) {
  //   this.socket.emit('offer', JSON.stringify({ offer: offer }));
  // }

  // public sendAnswer(answer: any) {
  //   this.socket.emit('answer', JSON.stringify({ answer: answer }));
  // }

  public sendDescription(description: any) {
    this.socket.emit(
      'description',
      JSON.stringify({ description: description })
    );
  }

  public sendNotification(msg: string) {
    this.socket.emit('notification', msg);
  }

  public sendICE(msg: any) {
    this.socket.emit('icecandidate', JSON.stringify(msg));
  }

  public getNotifications(): Observable<string> {
    return this.socket.fromEvent('notification');
  }

  // public getOffer(): Observable<any> {
  //   return this.socket
  //     .fromEvent('offer')
  //     .pipe(map((data) => JSON.parse(<string>data)));
  // }
  // public getAnswer(): Observable<any> {
  //   return this.socket
  //     .fromEvent('answer')
  //     .pipe(map((data) => JSON.parse(<string>data)));
  // }

  public getDescription(): Observable<any> {
    return this.socket
      .fromEvent('description')
      .pipe(map((data) => JSON.parse(<string>data)));
  }

  public getMessage(): Observable<{ message: string; fromUserName: string }> {
    return this.socket
      .fromEvent('message')
      .pipe(map((data) => JSON.parse(<string>data)));
  }
  public getICE(): Observable<any> {
    return this.socket
      .fromEvent('icecandidate')
      .pipe(map((data) => JSON.parse(<string>data)));
  }
}
