import { DurationEvent, Event } from '../event';
import { MonthType } from './month.type';

export interface Calendar {
    real: {
        SECONDS_PER_YEAR: number;
        SECONDS_PER_MONTH: number;
        SECONDS_PER_DAY: number;
        SECONDS_PER_HOUR: number;
        SECONDS_PER_MINUTE: number;
    };
    months: {[key: number]: MonthType};
    events: Event[];
    durations: DurationEvent[];
}
