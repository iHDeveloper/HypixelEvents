import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { TimelineManager } from './timeline';
import { RendererManager, EventRenderInfo, Point } from './render';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, RendererManager {
  title = 'frontend';
  events: EventRenderInfo[];

  @ViewChild('frame', { static: false }) frame: ElementRef;
  context: CanvasRenderingContext2D;

  constructor(
    private timelineManager: TimelineManager
  ) { }

  ngAfterViewInit() {
    const nativeElement = this.frame.nativeElement as HTMLCanvasElement;
    this.context = nativeElement.getContext('2d');
    this.timelineManager.init(this);
    this.updateSize(nativeElement);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateSize(this.frame.nativeElement as HTMLCanvasElement);
  }

  reset() {
    this.events = [];
  }

  add(event: EventRenderInfo) {
    this.events.push(event);
  }

  render() {
    const nativeElement = this.frame.nativeElement as HTMLCanvasElement;
    const width = nativeElement.width;
    const height = nativeElement.height;
    const thick = 4;
    const radius = width / 2;
    const origin: Point = { x: width / 2, y: height + height / 2 };
    // Clear the canvas
    this.context.clearRect(0, 0, width, height);

    // Draw the half circle
    this.context.beginPath();
    this.context.arc(origin.x, origin.y, radius, Math.PI, 0);
    this.context.fill();

    // Save the context state
    this.context.save();

    // Clear the half inside circle
    this.context.beginPath();
    this.context.arc(origin.x, origin.y, radius - thick, Math.PI, 0);
    this.context.clip();
    this.context.clearRect(0, 0, width, height);

    // Restore the context state
    this.context.restore();

    // Render the line that represents the now time
    const renderNowLine = (angle = 90, length = 10) => {
      angle = (angle * -Math.PI) / 180;
      const x = origin.x + ((radius - thick / 2) * Math.cos(angle));
      const y = origin.y + ((radius - thick / 2) * Math.sin(angle));
      this.context.beginPath();
      this.context.moveTo(x, y + length);
      this.context.lineTo(x, y - length);
      this.context.stroke();
    };
    renderNowLine();

    for (const event of this.events) {

      // Render the point
      let angle: number = event.angle;
      if (angle < 0 || angle > 180) {
        console.error('Failed to render point: Out of bounds');
        continue;
      }
      angle = (angle * -Math.PI) / 180;
      const x = origin.x + ((radius - thick / 2) * Math.cos(angle));
      const y = origin.y + ((radius - thick / 2) * Math.sin(angle));
      const pointRadius = 7;
      this.context.beginPath();
      this.context.arc(x, y, pointRadius, 0, 2 * Math.PI);
      this.context.fill();

      // Render the text
      const nameRadius = pointRadius + ((120 * event.angle) / 180);
      const nameAngle = event.angle;
      this.renderEventInfoName(this.context, event.name, event.info, nameRadius, nameAngle, { x: x, y: y });

      // Clear the fill rect and continue
      if (!event.fill) {
        const pointThick = 1;
        this.context.save();
        this.context.beginPath();
        this.context.arc(x, y, pointRadius - pointThick, 0, 2 * Math.PI);
        this.context.clip();
        this.context.clearRect(x - 100, y - 100, x + 100, y + 100);
        this.context.restore();
      }

      // Draw rect in the middle of the event circle
      const middlePointRadius = 2;
      this.context.save();
      if (event.fill) {
        this.context.fillStyle = '#ffffff';
      } else {
        this.context.fillStyle = '#000000';
      }
      this.context.beginPath();
      this.context.arc(x, y, middlePointRadius, 0, 2 * Math.PI);
      this.context.fill();
      this.context.restore();
    }

  }

  private renderEventInfoName(context: CanvasRenderingContext2D, name: string, info: string, radius: number, angle: number, origin: Point) {
    angle = (angle * -Math.PI) / 180;
    const x = origin.x + (radius * Math.cos(angle));
    const y = origin.y + (radius * Math.sin(angle));
    this.context.save();
    this.context.font = '25px Arial';
    this.context.fillText(name, x, y);
    this.context.font = '20px Arial';
    this.context.fillText(info, x, y + 25);
    this.context.restore();
  }

  private updateSize(nativeElement: HTMLCanvasElement) {
    nativeElement.width = window.innerWidth;
    nativeElement.height = window.innerHeight;
  }
}
