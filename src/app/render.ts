export interface RendererManager {
    add(point: EventRenderInfo): void;
    reset(): void;
    render(): void;
}

export interface EventRenderInfo {
    angle: number;
    title: string;
    tag: string;
    info: string;
    fill: boolean;
}

export interface Point {
    x: number;
    y: number;
}
