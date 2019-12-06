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
        this.rendererManager.add({ angle: 0 });
        this.rendererManager.add({ angle: 45 });
        this.rendererManager.add({ angle: 90 });
        this.rendererManager.add({ angle: 180 });
        this.render();
    }

    private render() {
        this.rendererManager.render();
    }

}
