import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public isPolite = false;
  public showChat = false;

  public start() {
    this.showChat = true;
  }
}
