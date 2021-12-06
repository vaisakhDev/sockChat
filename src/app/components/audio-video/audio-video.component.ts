import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio-video',
  templateUrl: './audio-video.component.html',
  styleUrls: ['./audio-video.component.scss'],
})
export class AudioVideoComponent implements OnInit, AfterViewInit {
  @Input() localStream: MediaStream;
  @Input() remoteStream: MediaStream;
  @ViewChild('localStream') localStreamEl!: ElementRef;
  @ViewChild('remoteStream') remoteStreamEl!: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.localStreamEl && this.localStream) {
      console.log(this.localStream);

      (this.localStreamEl.nativeElement as HTMLVideoElement).srcObject =
        this.localStream;
    }
    if (this.remoteStreamEl && this.remoteStream) {
      console.log('Remote Stream', this.remoteStream);

      (this.remoteStreamEl.nativeElement as HTMLVideoElement).srcObject =
        this.remoteStream;
    }
  }
}
