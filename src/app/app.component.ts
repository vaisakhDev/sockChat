import { Component, OnInit } from '@angular/core';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'socket-chat';
  public socketId: string = '';
  public userName: string = '';
  public showLobby = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.socketSubject.subscribe(
      (socketId) => (this.socketId = socketId)
    );
  }

  public enterLobby(userName: string) {
    this.userName = userName;
    this.showLobby = true;
    this.chatService.sendNotification(
      `${this.userName} just entered the lobby !!`
    );
  }
}
