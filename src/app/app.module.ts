import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';

const socketConfig: SocketIoConfig = {
  url: 'https://sock-chat-api.herokuapp.com',
  options: {},
};

@NgModule({
  declarations: [AppComponent, LoginComponent, ChatRoomComponent],
  imports: [BrowserModule, SocketIoModule.forRoot(socketConfig), FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
