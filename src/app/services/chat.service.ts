import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public socketSubject: Subject<string>;
  constructor(private socket: Socket) {
    this.socketSubject = new Subject();
    this.socket.on('connect', () => {
      this.socketSubject.next(this.socket.ioSocket.id);
    });
  }

  public sendMessage(msg: { message: string; fromUserName: string }) {
    this.socket.emit('message', JSON.stringify(msg));
  }

  public sendNotification(msg: string) {
    this.socket.emit('notification', msg);
  }

  public getNotifications(): Observable<string> {
    return this.socket.fromEvent('notification');
  }

  public getMessage(): Observable<{ message: string; fromUserName: string }> {
    return this.socket
      .fromEvent('message')
      .pipe(map((data) => JSON.parse(<string>data)));
  }
}
