export interface Event {
    name: string;
    tag: string;
    color: string;
    date: Date;
}

export enum ComplexEventType {
    DURATION = 0
}

export interface ComplexEvent {
    type: ComplexEventType;
    name: string;
    tag: string;
    color: string;
}

export interface DurationEvent extends ComplexEvent {
    startDate: Date;
    endDate: Date;
}
