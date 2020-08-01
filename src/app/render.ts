export interface RendererManager {
    add(event: EventRenderInfo): void;
    addDuration(duration: EventRenderDuration): void;
    reset(): void;
    render(): void;
}

export interface Point {
    x: number;
    y: number;
}

export interface EventRenderInfo {
    // Event information
    name: string;
    tag: string;
    color: string;

    // Render information
    angle: number;
    info: string;
    fill: boolean;
}

export interface EventRenderDuration {
    name: string;
    tag: string;
    color: string;
    info: string;
}
