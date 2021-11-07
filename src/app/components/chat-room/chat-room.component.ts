import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {
  @Input() userName: string;
  public msg = '';
  public messages: Array<{
    text: string;
    fromSelf?: boolean;
    type: string;
    fromUserName?: string;
  }> = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getMessage().subscribe((data) => {
      const message = (<{ message: string }>data).message;
      this.messages.push({
        text: message,
        type: 'message',
        fromUserName: data.fromUserName,
      });
    });
    this.chatService.getNotifications().subscribe((notification) => {
      console.log(notification);

      this.messages.push({ text: notification, type: 'notification' });
    });
  }

  public sendMessage(e: Event) {
    e.preventDefault();
    console.log(this.msg);

    this.chatService.sendMessage({
      message: this.msg,
      fromUserName: this.userName,
    });
    this.messages.push({ text: this.msg, fromSelf: true, type: 'message' });
    this.msg = '';
  }
}
