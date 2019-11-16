import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TimelineManager {
    events: Event[];
    updater: Subject<void>;

    private renderFrame: () => void;

    public init(render: () => void): void {
        this.renderFrame = render;
        if (this.updater !== undefined) {
            this.updater.next();
            this.updater.complete();
        }
        this.updater = new Subject<void>();
        interval(100).pipe(takeUntil(this.updater)).subscribe(() => this.render());
        this.render();
    }

    private render() {
        this.renderFrame();
    }

}
