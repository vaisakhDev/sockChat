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
  @Input() mediaStream: MediaStream;
  @Input() title: string;
  @ViewChild('videoEl') videoEl!: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.mediaStream) {
      (this.videoEl.nativeElement as HTMLVideoElement).srcObject =
        this.mediaStream;
    }
  }
}
