import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RendererManager } from './render';
import { Event } from './event';
import * as moment from 'moment';

/**
 * Manages the render process and information of the events.
 */
@Injectable({
    providedIn: 'root'
})
export class TimelineManager {

    // Range View of the timeline ( in seconds )
    public range = 5 * 60;

    // Render updater
    updater: Subject<void>;
    events: Event[];

    constructor() {
        // Events seed for testing.
        // TODO remove after testing
        this.events = [];
        for (let mins = 1; mins <= 120; mins++) {
            this.events.push({
                date: moment().add(mins, 'minutes').toDate(),
                title: `Event +${mins}m`,
                tag: 'Hypixel'
            });
        }
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
        this.render();
    }

    /**
     * Passing information to the render manager before renders it.
     */
    private render() {
        const TIME_DIFF = this.range * 1000;
        this.rendererManager.reset();
        const now = moment();
        const from = moment().subtract(this.range, 'seconds');
        const to = moment().add(this.range, 'seconds');
        for (const event of this.events) {
            const date = moment(event.date);
            if (!date.isBetween(from, to)) {
                continue;
            }
            if (date.isBetween(now, to)) {
                const toDiff = to.valueOf() - date.valueOf();
                this.rendererManager.add({
                    title: event.title,
                    tag: event.tag,
                    angle: (90 * toDiff) / TIME_DIFF,
                    info: `T - ${this.countdownFormat(moment.duration(date.diff(now)))}`,
                    fill: false
                });
                continue;
            }
            const nowDiff = now.valueOf() - date.valueOf();
            this.rendererManager.add({
                title: event.title,
                tag: event.tag,
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

}
