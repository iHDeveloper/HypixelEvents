import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject, Observable, Subscription } from 'rxjs';
import { Event, DurationEvent } from './event';
import { Calendar } from './api/calendar';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private _events: Subject<Event>;
  private _durations: Subject<DurationEvent>;
  private updateSubscrption: Subscription;

  constructor(
    private firestore: AngularFirestore
  ) {
    this._events = new Subject();
    this._durations = new Subject();
  }

  public start() {
    const doc = this.firestore.collection('skyblock').doc<Calendar>('calendar');
    this.updateSubscrption = doc.valueChanges().subscribe(
      calendar => this.update(calendar),
      error => console.error(error)
    );
  }

  public stop() {
    this.updateSubscrption.unsubscribe();

    this._events.complete();
    this._durations.complete();
  }

  public get events(): Observable<Event | undefined> {
    return this._events;
  }

  public get durations(): Observable<DurationEvent | undefined> {
    return this._durations;
  }

  private update(calendar: Calendar) {
    console.log('Updating calendar...');
    
    // Clear the list
    this._events.next(undefined);
    this._durations.next(undefined);

    for (const event of calendar.events) {
      event.date = ((event.date as any) as firestore.Timestamp).toDate();
      this._events.next(event);
    }

    for (const duration of calendar.durations) {
      duration.startDate = ((duration.startDate as any) as firestore.Timestamp).toDate();
      duration.endDate = ((duration.endDate as any) as firestore.Timestamp).toDate();
      this._durations.next(duration);
    }

    console.log('Updated! calendar @', new Date());
  }

}