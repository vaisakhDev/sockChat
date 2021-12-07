import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { LogsComponent } from './components/logs/logs.component';
import { MainComponent } from './components/main/main.component';
import { AudioVideoComponent } from './components/audio-video/audio-video.component';
import { AudioVisualizerComponent } from './components/audio-visualizer/audio-visualizer.component';

const socketConfig: SocketIoConfig = {
  url: 'https://sock-chat-api.herokuapp.com',
  // url: 'http://localhost:8080',
  options: {},
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatRoomComponent,
    LogsComponent,
    MainComponent,
    AudioVideoComponent,
    AudioVisualizerComponent,
  ],
  imports: [BrowserModule, SocketIoModule.forRoot(socketConfig), FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
