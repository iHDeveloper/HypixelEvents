import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RendererManager } from './render';

@Injectable({
    providedIn: 'root'
})
export class TimelineManager {
    events: Event[];
    updater: Subject<void>;
    angle = 0;

    private rendererManager: RendererManager;

    public init(rendererManager: RendererManager): void {
        this.rendererManager = rendererManager;
        if (this.updater !== undefined) {
            this.updater.next();
            this.updater.complete();
        }
        this.updater = new Subject<void>();
        interval(100).pipe(takeUntil(this.updater)).subscribe(() => this.render());
        this.rendererManager.reset();
        this.render();
    }

    private render() {
        this.rendererManager.render();
    }

}
