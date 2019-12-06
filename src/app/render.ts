export interface RendererManager {
    add(point: EventRenderInfo): void;
    reset(): void;
    render(): void;
}

export interface EventRenderInfo {
    angle: number;
    name: string;
}

export interface Point {
    x: number;
    y: number;
}
