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
  @Input() title: string;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('canvasWrapper') canvasWrapper: ElementRef;
  analyser: AnalyserNode;
  frequencyData: Uint8Array;
  ctx: CanvasRenderingContext2D | null;
  dataArray: Uint8Array;
  canvasElement: HTMLCanvasElement;

  constructor() {}

  ngAfterViewInit(): void {
    this.ctx = (this.canvas.nativeElement as HTMLCanvasElement).getContext(
      '2d'
    );

    this.canvasElement = this.canvas.nativeElement as HTMLCanvasElement;
  }

  ngOnInit(): void {
    const audioCtx = new window.AudioContext();
    const src = audioCtx.createMediaStreamSource(this.mediaStream);

    this.analyser = audioCtx.createAnalyser();
    // this.analyser.fftSize = 2048;
    this.analyser.fftSize = 512;
    src.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.dataArray = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.drawWaveForm();
    // this.loopingFunction();
    // setInterval(() => {
    //   this.analyser.getByteFrequencyData(this.frequencyData);
    //   console.log(this.frequencyData);
    // }, 10);
  }

  // loopingFunction() {
  //   requestAnimationFrame(() => this.loopingFunction());
  //   this.analyser.getByteFrequencyData(this.frequencyData);
  //   this.draw(this.frequencyData);
  // }

  // public draw(frequencyData: Uint8Array) {
  //   const data = [...frequencyData];
  //   if (this.ctx) {
  //     this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  //     let space = this.canvasWidth / data.length;
  //     data.forEach((value, i) => {
  //       if (this.ctx) {
  //         this.ctx.beginPath();
  //         this.ctx.moveTo(space * i, this.canvasHeight); //x,y
  //         this.ctx.lineTo(space * i, this.canvasHeight - value); //x,y
  //         this.ctx.stroke();
  //       }
  //     });
  //   }
  // }

  // private computeCanvasDimensions(ev: any) {
  //   if (this.canvasWrapper && this.canvasWrapper.nativeElement) {
  //     this.ctx?.clearRect(0, 0, 1000, 1000);
  //     const canvasEl = this.canvasWrapper.nativeElement as HTMLCanvasElement;
  //     console.log(canvasEl.clientWidth, canvasEl.clientHeight);
  //     // this.canvasWidth = canvasEl.clientWidth;
  //     // this.canvasHeight = canvasEl.clientHeight;
  //   }
  // }

  // draw an oscilloscope of the current audio source from waveform
  public drawWaveForm() {
    requestAnimationFrame(() => this.drawWaveForm());
    this.analyser.getByteTimeDomainData(this.dataArray);
    if (this.ctx && this.canvasElement) {
      const width = this.canvasElement.width;
      const height = this.canvasElement.height;
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.fillStyle = '#000f08';
      this.ctx.fillRect(0, 0, width, height);

      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#33ff00';

      const sliceWidth = (width * 1.0) / this.analyser.fftSize;
      let x = 0;

      this.ctx.beginPath();
      for (var i = 0; i < this.analyser.fftSize; i++) {
        const v = this.dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);

        x += sliceWidth;
      }

      // draw frequency visualization

      this.ctx.lineTo(width, height / 2);
      this.ctx.stroke();
      this.analyser.getByteFrequencyData(this.frequencyData);

      const freqData = [...this.frequencyData];
      let space = width / freqData.length;
      freqData.forEach((value, i) => {
        this.ctx?.beginPath();
        this.ctx?.moveTo(space * i, height); //x,y
        this.ctx?.lineTo(space * i, width - value); //x,y
        this.ctx?.stroke();
      });
    }
  }
}
