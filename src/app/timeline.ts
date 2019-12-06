import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RendererManager } from './render';
import { Event } from './event';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class TimelineManager {
    events: Event[];
    updater: Subject<void>;
    angle = 0;

    constructor() {
        // Events seed for testing.
        // TODO remove after testing
        this.events = [];
        const add = [1, 2, 3, 5, 7, 10, 12, 15, 17, 25, 30, 45, 60, 75];
        // const add = [30];
        for (const mins of add) {
            this.events.push({
                date: moment().add(mins, 'minutes').toDate(),
                name: `Event +${mins}m`
            });
        }
    }

    private rendererManager: RendererManager;

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

    private render() {
        const TIME_DIFF = 300000;
        this.rendererManager.reset();
        const now = moment();
        const from = moment().subtract(5, 'minutes');
        const to = moment().add(5, 'minutes');
        for (const event of this.events) {
            const date = moment(event.date);
            if (!date.isBetween(from, to)) {
                continue;
            }
            if (date.isBetween(now, to)) {
                const toDiff = to.valueOf() - date.valueOf();
                this.rendererManager.add({
                    name: event.name,
                    angle: (90 * toDiff) / TIME_DIFF
                });
                continue;
            }
            const nowDiff = now.valueOf() - date.valueOf();
            this.rendererManager.add({
                name: event.name,
                angle: 90 + ((90 * nowDiff) / TIME_DIFF)
            });
        }
        this.rendererManager.render();
    }

}
