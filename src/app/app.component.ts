import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'frontend';

  @ViewChild('frame', { static: false }) frame: ElementRef;
  context: CanvasRenderingContext2D;

  ngAfterViewInit() {
    this.context = (this.frame.nativeElement as HTMLCanvasElement).getContext('2d');
    this.render();
  }

  render() {
    const nativeElement = this.frame.nativeElement as HTMLCanvasElement;
    const width = nativeElement.width;
    const height = nativeElement.height;
    const thick = 3;

    // Clear the canvas
    this.context.clearRect(0, 0, width, height);

    // Draw the half circle
    this.context.beginPath();
    this.context.arc(width / 2, height + height / 2, width / 2, Math.PI, 0);
    this.context.fill();
    // Clear the half inside circle
    this.context.beginPath();
    this.context.arc(width / 2, height + height / 2, width / 2 - thick, Math.PI, 0);
    this.context.clip();
    this.context.clearRect(0, 0, width, height);
  }
}
