import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TimelineManager {
    events: Event[];

    private renderFrame: () => void;

    public init(render: () => void): void {
        this.renderFrame = render;
        this.render();
    }

    private render() {
        this.renderFrame();
    }

}
