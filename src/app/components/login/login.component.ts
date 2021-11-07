import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public userName: string = '';
  @Output() enterLobbyEvent: EventEmitter<string> = new EventEmitter();

  constructor() {}

  public enterLobby() {
    if (this.userName) {
      this.enterLobbyEvent.emit(this.userName);
    }
  }
}
