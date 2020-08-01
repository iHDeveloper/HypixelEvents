export interface RendererManager {
    add(point: EventRenderInfo): void;
    reset(): void;
    render(): void;
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

export interface Point {
    x: number;
    y: number;
}
