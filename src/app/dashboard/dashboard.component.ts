import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as Moment from 'moment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  time = '00:00:00 PM';
  updater: Subject<void>;

  constructor() { }

  ngOnInit() {
    this.updater = new Subject<void>();
    interval(100).pipe(takeUntil(this.updater)).subscribe(() => {
      this.update();
    });
    this.update();
  }

  ngOnDestroy() {
    this.updater.next();
    this.updater.complete();
  }

  update() {
    this.time = Moment().format('HH:mm:ss A');
  }

}
