import { Injectable } from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WindowResizeService {
  public onWindowResize: Observable<any>;

  constructor() {
    this.onWindowResize = fromEvent(window, 'resize');
  }
}
