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

  @ViewChild('frame') frame: ElementRef;
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

  /**
   * Update the size of the canvas when the window changes.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateSize(this.frame.nativeElement as HTMLCanvasElement);
  }

  /**
   * Reset the events render information.
   */
  reset() {
    this.events = [];
  }

  /**
   * Add the event to renders it.
   */
  add(event: EventRenderInfo) {
    this.events.push(event);
  }

  /**
   * Renders the information of the events.
   */
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
      const eventPoint = this.calculateEventPoint({ x: x, y: y}, nameRadius, nameAngle);
      this.context.save();

      this.printName(eventPoint, event.name);
      this.printTag(eventPoint, event.tag);
      this.printInfo(eventPoint, event.info);
      this.printColor(eventPoint, event.color);

      this.context.restore();

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

  private calculateEventPoint(origin: Point, radius: number, angle: number): Point {
    angle = (angle * -Math.PI) / 180;
    return {
      x: origin.x + (radius * Math.cos(angle)),
      y: origin.y + (radius * Math.sin(angle))
    }
  }

  private printName(point: Point, name: string) {
    this.context.font = '25px Arial';
    this.context.fillStyle = "black";
    this.context.fillText(name, point.x, point.y);
  }

  private printTag(point: Point, tag: string) {
    this.context.font = "15px Arial";
    this.context.fillStyle = "gray";
    this.context.fillText(tag, point.x, point.y - 25);
  }

  private printInfo(point: Point, info: string) {
    this.context.font = '20px Arial';
    this.context.fillStyle = "gray";
    this.context.fillText(info, point.x, point.y + 25);
  }

  private printColor(point: Point, color: string) {
    this.context.fillStyle = color;
    this.context.fillRect(point.x - 15, point.y - 30, 5, 50);
  }

  /**
   * Update the size of the canvas.
   */
  private updateSize(nativeElement: HTMLCanvasElement) {
    nativeElement.width = window.innerWidth;
    nativeElement.height = window.innerHeight;
  }
}
