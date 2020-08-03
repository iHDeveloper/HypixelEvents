import { Injectable } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RendererManager } from './render';
import { Event, DurationEvent } from './event';
import * as moment from 'moment';
import { CalendarService } from './calendar.service';
import { AngularFireAnalytics } from '@angular/fire/analytics';

/**
 * Manages the render process and information of the events.
 */
@Injectable({
    providedIn: 'root'
})
export class TimelineManager {

    // Range View of the timeline ( in hours )
    public range = 2;

    // Render updater
    private updater: Subject<void>;

    // Calendar subscriptions
    private eventsSubscription: Subscription;
    private durationEventsSubscription: Subscription;

    private events: Event[];
    private durations: DurationEvent[];

    constructor(
        private analytics: AngularFireAnalytics,
        private calendar: CalendarService
    ) {
        this.events = [];
        this.durations = [];

        const _range = localStorage.getItem('range');
        if (_range !== null) {
            this.range = parseInt(_range);
        }
        this.analytics.logEvent('settings', { "range": this.range } );
    }

    private rendererManager: RendererManager;

    /**
     * Initialize the render updater and the manager.
     */
    public init(rendererManager: RendererManager): void {
        this.rendererManager = rendererManager;
        if (this.updater !== undefined) {
            this.updater.next();
            this.updater.complete();
        }
        this.updater = new Subject<void>();
        interval(1000 / 60).pipe(takeUntil(this.updater)).subscribe(() => this.render());
        this.rendererManager.reset();

        this.calendar.start();
        this.eventsSubscription = this.calendar.events.subscribe(e => this.eventsUpdate(e));
        this.durationEventsSubscription = this.calendar.durations.subscribe(e => this.durationsUpdate(e));

        this.render();
    }

    public dispose() {
        this.rendererManager.reset();
        this.rendererManager.render();
        this.rendererManager = undefined;

        this.eventsSubscription.unsubscribe();
        this.durationEventsSubscription.unsubscribe();
        this.calendar.stop();
    }

    /**
     * Passing information to the render manager before renders it.
     */
    private render() {
        const TIME_DIFF = this.range * (60 * 60 * 1000);
        this.rendererManager.reset();
        const now = moment();
        const from = moment().subtract(this.range, 'hours');
        const to = moment().add(this.range, 'hours');

        // Render durations
        for (const duration of this.durations) {
            const startDate = moment(duration.startDate);
            const endDate = moment(duration.endDate);

            if (now.isBetween(startDate, endDate)) {
                this.rendererManager.addDuration({
                    name: duration.name,
                    tag: duration.tag,
                    color: duration.color,
                    info: `T - ${this.countdownFormat(moment.duration(endDate.diff(now)))}`
                });
            }

            if (startDate.isBetween(from, to)) {
                if (startDate.isBetween(now, to)) {
                    const toDiff = to.valueOf() - startDate.valueOf();
                    this.rendererManager.add({
                        name: `[Start] ${duration.name}`,
                        tag: duration.tag,
                        color: "green",
                        angle: (90 * toDiff) / TIME_DIFF,
                        info: `T - ${this.countdownFormat(moment.duration(startDate.diff(now)))}`,
                        fill: false
                    });
                } else {
                    const nowDiff = now.valueOf() - startDate.valueOf();
                    this.rendererManager.add({
                        name: `[Start] ${duration.name}`,
                        tag: duration.tag,
                        color: "green",
                        angle: 90 + ((90 * nowDiff) / TIME_DIFF),
                        info: `T + ${this.countdownFormat(moment.duration(now.diff(startDate)))}`,
                        fill: true
                    });
                }
            }

            if (endDate.isBetween(from, to)) {
                if (endDate.isBetween(now, to)) {
                    const toDiff = to.valueOf() - endDate.valueOf();
                    this.rendererManager.add({
                        name: `[End] ${duration.name}`,
                        tag: duration.tag,
                        color: "red",
                        angle: (90 * toDiff) / TIME_DIFF,
                        info: `T - ${this.countdownFormat(moment.duration(endDate.diff(now)))}`,
                        fill: false
                    });
                } else {
                    const nowDiff = now.valueOf() - endDate.valueOf();
                    this.rendererManager.add({
                        name: `[End] ${duration.name}`,
                        tag: duration.tag,
                        color: "red",
                        angle: 90 + ((90 * nowDiff) / TIME_DIFF),
                        info: `T + ${this.countdownFormat(moment.duration(now.diff(endDate)))}`,
                        fill: true
                    });
                }
            }
        }

        // Render events
        for (const event of this.events) {
            const date = moment(event.date);
            if (!date.isBetween(from, to)) {
                continue;
            }
            if (date.isBetween(now, to)) {
                const toDiff = to.valueOf() - date.valueOf();
                this.rendererManager.add({
                    name: event.name,
                    tag: event.tag,
                    color: event.color,
                    angle: (90 * toDiff) / TIME_DIFF,
                    info: `T - ${this.countdownFormat(moment.duration(date.diff(now)))}`,
                    fill: false
                });
                continue;
            }
            const nowDiff = now.valueOf() - date.valueOf();
            this.rendererManager.add({
                name: event.name,
                tag: event.tag,
                color: event.color,
                angle: 90 + ((90 * nowDiff) / TIME_DIFF),
                info: `T + ${this.countdownFormat(moment.duration(now.diff(date)))}`,
                fill: true
            });
        }
        this.rendererManager.render();
    }

    /**
     * Gets the format of countdown by passing duration.
     *
     * @param duration Duration of the difference
     */
    private countdownFormat(duration: moment.Duration) {
        const h = duration.hours();
        const m = duration.minutes();
        const s = duration.seconds();
        return `${h <= 9 ? '0' + h : h}:${m <= 9 ? '0' + m : m}:${s <= 9 ? '0' + s : s}`;
    }

    private addDurationEvent(event: DurationEvent) {
        this.durations.push(event);
    }

    private eventsUpdate(event: Event | undefined) {
        if (event === undefined) {
            this.events = [];
            return;
        }
        this.events.push(event);
    }

    private durationsUpdate(duration: DurationEvent | undefined) {
        if (duration === undefined) {
            this.durations = [];
            return;
        }
        this.addDurationEvent(duration);
    }

}
