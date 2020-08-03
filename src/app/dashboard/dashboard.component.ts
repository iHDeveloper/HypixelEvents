import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { CalendarService } from '../calendar.service';
import { SkyblockDate } from '../api/skyblock.date';
import { MonthType } from '../api/month.type';
import { Calendar } from '../api/calendar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SettingsComponent } from '../settings/settings.component';

type Months = {[key: number]: MonthType};

let SECONDS_PER_YEAR: number;
let SECONDS_PER_MONTH: number;
let SECONDS_PER_DAY: number;
let SECONDS_PER_HOUR: number;
let SECONDS_PER_MINUTE: number;

function formatMonth(type: MonthType): string {
  switch (type) {
      case MonthType.EARLY_SPRING:
          return "Early Spring";
      case MonthType.SPRING:
          return "Spring";
      case MonthType.LATE_SPRING:
          return "Late Spring";
      case MonthType.EARLY_SUMMER:
          return "Early Summer";
      case MonthType.SUMMER:
          return "Summer";
      case MonthType.LATE_SUMMER:
          return "Late Summer";
      case MonthType.EARLY_AUTUMN:
          return "Early Autumn";
      case MonthType.AUTUMN:
          return "Autumn";
      case MonthType.LATE_AUTUMN:
          return "Late Autumn";
      case MonthType.EARLY_WINTER:
          return "Early Winter";
      case MonthType.WINTER:
          return "Winter";
      case MonthType.LATE_WINTER:
          return "Late Winter";
      default:
          return "Unknown";
  }
}

function formatDay(day: number): string {
  if (day === 1)
      return "1st";
  else if (day === 2)
      return "2nd";
  else if (day === 3)
      return "3rd";
  else
      return `${day}th`;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  time = '00:00:00 PM';
  version = environment.version;

  lastUpdated = "Updating...";
  sbMonth = "Early Spring";
  sbDay = "1st";
  sbHour = 1;
  sbMinute = 0;
  sbPM = false;
  sbYear = 82;

  private months: Months;
  private currentDate: SkyblockDate;
  private updater: Subject<void>;
  private sbUpdater: Subject<SkyblockDate>;
  private subscription: Subscription;


  constructor(
    private bottomSheet: MatBottomSheet,
    private service: CalendarService
  ) {
    this.sbUpdater = new Subject();
    this.sbUpdater.subscribe(date => this.sbUpdate(date));
    this.subscription = this.service.calendar.subscribe(calendar => this.sbReset(calendar));
  }

  ngOnInit() {
    this.updater = new Subject<void>();
    interval(100).pipe(takeUntil(this.updater)).subscribe(() => {
      this.update();
    });
    interval(833.333333333).pipe(takeUntil(this.updater)).subscribe(() => this.sbUpdater.next(undefined));
    this.update();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    this.updater.next();
    this.updater.complete();
  }

  onSettings() {
    this.bottomSheet.open(SettingsComponent);
  }

  update() {
    this.time = moment().format('HH:mm:ss A');
  }

  sbUpdate(date?: SkyblockDate) {
    if (date !== undefined) {
      this.currentDate = date;
    }
    if (this.currentDate === undefined) {
      return;
    }
    const sbDate: SkyblockDate | any = {};
    for (const key of Object.keys(this.currentDate)) {
      sbDate[key] = this.currentDate[key];
    }

    {
      const date = sbDate;
      let secondsSinceLastLog = Math.floor(Date.now() / 1000) - date.time;
      { // Year
        const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_YEAR);
        secondsSinceLastLog -= diff * SECONDS_PER_YEAR;
        date.year += diff;
      }
      { // Month
        const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_MONTH) % 13;
        secondsSinceLastLog -= diff * SECONDS_PER_MONTH;
        date.month += diff;
        date.month %= 13;
      }
      { // Day
        const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_DAY) % 32;
        secondsSinceLastLog -= diff * SECONDS_PER_DAY;
        date.day += diff;
        date.day %= 32;
      }
      { // Hours
        const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_HOUR) % 24;
        secondsSinceLastLog -= diff * SECONDS_PER_HOUR;
        date.hour += diff;
        date.hour %= 24;

        if (date.hour < 6) {
            if (date.day < 31) {
              date.day++;
            } else {
              date.day = 1;
              date.month++;
            }
        }
      }
      { // Minutes
        const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_MINUTE) % 60;
        secondsSinceLastLog -= diff * SECONDS_PER_MINUTE;
        date.minute += diff;
        date.minute %= 60;
      }
    }

    // Render the time
    this.sbYear = sbDate.year;
    
    {
      const type = this.months[sbDate.month];
      this.sbMonth = formatMonth(type);
    }
    this.sbDay = formatDay(sbDate.day);

    {
      const min = sbDate.minute;
      let hour = sbDate.hour;
      
      if (hour >= 12) {
        hour %= 12;
        this.sbHour = hour;
        this.sbPM = true;
      } else {
        this.sbHour = hour;
        this.sbPM = false;
      }
      this.sbMinute = min;
    }
  }

  sbReset(calendar: Calendar) {
    // Invoke the update subject with the current date
    SECONDS_PER_MINUTE = calendar.real.SECONDS_PER_MINUTE
    SECONDS_PER_HOUR = calendar.real.SECONDS_PER_HOUR
    SECONDS_PER_DAY = calendar.real.SECONDS_PER_DAY
    SECONDS_PER_MONTH = calendar.real.SECONDS_PER_MONTH
    SECONDS_PER_YEAR = calendar.real.SECONDS_PER_YEAR

    this.months = calendar.months;
    this.lastUpdated = moment().format("MMM Do YYYY - HH:mm:SS A");
    this.sbUpdater.next(calendar.lastLog);
  }

}
