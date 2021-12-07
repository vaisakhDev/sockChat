import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio-visualizer',
  templateUrl: './audio-visualizer.component.html',
  styleUrls: ['./audio-visualizer.component.scss'],
})
export class AudioVisualizerComponent implements OnInit, AfterViewInit {
  @Input() mediaStream: MediaStream;
  @ViewChild('canvas') canvas: ElementRef;
  analyser: AnalyserNode;
  frequencyData: Uint8Array;
  ctx: CanvasRenderingContext2D | null;
  canvasWidth = 500;
  canvasHeight = 500;

  constructor() {}

  ngAfterViewInit(): void {
    this.ctx = (this.canvas.nativeElement as HTMLCanvasElement).getContext(
      '2d'
    );
  }

  ngOnInit(): void {
    const audioCtx = new window.AudioContext();
    const src = audioCtx.createMediaStreamSource(this.mediaStream);

    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 64;
    src.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.loopingFunction();
    // setInterval(() => {
    //   this.analyser.getByteFrequencyData(this.frequencyData);
    //   console.log(this.frequencyData);
    // }, 10);
  }
  loopingFunction() {
    requestAnimationFrame(() => this.loopingFunction());
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.draw(this.frequencyData);
  }

  public draw(frequencyData: Uint8Array) {
    const data = [...frequencyData];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      let space = this.canvasWidth / data.length;
      data.forEach((value, i) => {
        if (this.ctx) {
          this.ctx.beginPath();
          this.ctx.moveTo(space * i, this.canvasHeight); //x,y
          this.ctx.lineTo(space * i, this.canvasHeight - value); //x,y
          this.ctx.stroke();
        }
      });
    }
  }
}
