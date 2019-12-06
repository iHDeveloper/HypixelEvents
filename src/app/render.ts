export interface RendererManager {
    add(point: Point): void;
    reset(): void;
    render(): void;
}

export interface Point {
    angle: number;
}
