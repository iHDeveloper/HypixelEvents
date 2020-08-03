import bent from 'bent';
import moment from 'moment';
import { info, debug } from 'console';

const VERSION = "0.1.3"

export namespace HypixelAPI {

    const BASE_URL = "https://hypixel-api.inventivetalent.org/api/";
    const MONTHS_PER_YEAR = 12;
    const DAYS_IN_MONTH = 31;

    export enum MonthType {
        EARLY_SPRING = "early_spring",
        SPRING = "spring",
        LATE_SPRING = "late_spring",
        EARLY_SUMMER = "early_summer",
        SUMMER = "summer",
        LATE_SUMMER = "late_summer",
        EARLY_AUTUMN = "early_autumn",
        AUTUMN = "autumn",
        LATE_AUTUMN = "late_autumn",
        EARLY_WINTER = "early_winter",
        WINTER = "winter",
        LATE_WINTER = "late_winter"
    }

    namespace Raw {

        export interface Calendar {
            lastLog: {
                year: number;
                month: number;
                month_name: string;
                day: number;
                hour: number;
                minute: number;
                time: number;
            },
            real: {
                MINUTES_PER_MONTH: number,
                MINUTES_PER_DAY: number,
                SECONDS_PER_DAY: number,
                SECONDS_PER_HOUR: number,
                SECONDS_PER_MINUTE: number,
                SECONDS_PER_MONTH: number,
                SECONDS_PER_TEN_MINUTES: number
            },
            months: {[key: number]: MonthType},
            reverseMonths: {[key: string]: number},
            events: {
                yearly: [{
                    key: string,
                    name: string,
                    url: string,
                    when: [{
                        start: {
                            month: string;
                            day: number;
                        },
                        end: {
                            month: string;
                            day: number;
                        }
                    }]
                }]
            }
        }
    }

    interface Event {
        name: string;
        tag: string;
        color: string;
        date: Date;
    }

    interface DurationEvent {
        type: 0;
        name: string;
        tag: string;
        color: string;
        startDate: Date;
        endDate: Date;
    }

    const SECONDS_PER_MINUTE = 0.8333333333333334;
    const SECONDS_PER_HOUR = 50;
    const SECONDS_PER_DAY = 1200;
    const SECONDS_PER_MONTH = 37200;
    const SECONDS_PER_YEAR = 446400;

    class SkyblockDate {
        static now(base: number): SkyblockDate {
            const result = new SkyblockDate(base);
            let secondsSinceLastLog = Math.floor(Date.now() / 1000) - base;
            { // Year
                const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_YEAR);
                secondsSinceLastLog -= diff * SECONDS_PER_YEAR;
                result.year += diff;
            }
            { // Month
                const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_MONTH) % 13;
                secondsSinceLastLog -= diff * SECONDS_PER_MONTH;
                result.month += diff;
                result.month %= 13;
            }
            { // Day
                const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_DAY) % 32;
                secondsSinceLastLog -= diff * SECONDS_PER_DAY;
                result.day += diff;
                result.day %= 32;
            }
            { // Hours
                const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_HOUR) % 24;
                secondsSinceLastLog -= diff * SECONDS_PER_HOUR;
                result.hour += diff;
                result.hour %= 24;

                if (result.hour < 6) {
                    if (result.day < 31) {
                        result.day++;
                    } else {
                        result.day = 1;
                        result.month++;
                    }
                }
            }
            { // Minutes
                const diff = Math.floor(secondsSinceLastLog / SECONDS_PER_MINUTE) % 60;
                secondsSinceLastLog -= diff * SECONDS_PER_MINUTE;
                result.minute += diff;
                result.minute %= 60;
            }
            return result;
        }

        public year: number = 1;
        public month: number = 1;
        public day: number = 1;
        public hour: number = 6;
        public minute: number = 0;

        constructor(
            private base?: number
        ) {
        }

        public get time(): number {
            let result = 0;
            if (this.base) {
                result = this.base;
            }

            let diff = 0;
            diff += (this.year - 1) * SECONDS_PER_YEAR;
            diff += (this.month - 1) * SECONDS_PER_MONTH;
            diff += (this.day - 1) * SECONDS_PER_DAY;
            diff += (this.hour - 6) * SECONDS_PER_HOUR;
            diff += Math.floor(this.minute * SECONDS_PER_MINUTE);

            result += diff;
            return result;
        }

        public clone(): SkyblockDate {
            const result = new SkyblockDate(this.base);
            result.year = this.year;
            result.month = this.month;
            result.day = this.day;
            result.hour = this.hour;
            result.minute = this.minute;
            return result;
        }

        toDate(): Date {
            return moment(this.time * 1000).toDate();
        }
    }

    export interface Calendar {
        real: {
            SECONDS_PER_YEAR: number,
            SECONDS_PER_MONTH: number,
            SECONDS_PER_DAY: number,
            SECONDS_PER_HOUR: number,
            SECONDS_PER_MINUTE: number
        },
        lastLog: {
            year: number;
            month: number;
            day: number;
            hour: number;
            minute: number;
            time: number;
        },
        months: {[key: string]: MonthType},
        events: Event[],
        durations: DurationEvent[]
    }

    export async function calendar(): Promise<Calendar> {
        const rawCalendar = await fetch<Raw.Calendar>('skyblock/calendar');
        info("Loading...");
        const sbDate = SkyblockDate.now(rawCalendar.lastLog.time);

        // Calculate the difference from the first log to now
        
        debug(`SkyblockDate: ${rawCalendar.months[sbDate.month]} ${sbDate.day} Year ${sbDate.year} - ${sbDate.hour}:${sbDate.minute}`);
        debug(`SkyblockDate(asNativeDate): ${sbDate.toDate()}`);

        const events: Event[] = [];
        const durations: DurationEvent[] = [];

        // Implement daily events
        {
            const date = sbDate.clone();
            date.hour = 1;
            date.minute = 0;
            const name = rawCalendar.months[date.month];
            for (let day = 2; day <= DAYS_IN_MONTH; day++) {
                date.day = day;

                // Ignore for yearly events
                if ((day >= 29 && day <= 31) && name === MonthType.AUTUMN) {
                    continue; // Ignore for Spooky Event
                } else if ((day >= 1 && day <= 3) && name === MonthType.EARLY_SUMMER) {
                    continue; // Ignore for Travelling Zoo event
                } else if (day === 1 && (name === MonthType.LATE_WINTER || name === MonthType.EARLY_SPRING)) {
                    continue; // Ignore for Jerry's workshop event
                } else if ((day >= 24 && day <= 26) && name === MonthType.LATE_WINTER) {
                    continue; // Ignore for Season of Jerry event
                } else if ((day >= 29 && day <= 31) && name === MonthType.LATE_WINTER) {
                    continue; // Ignore for New Year celebration event
                }

                const nativeDate = date.toDate();
                events.push({
                    name: `${formatMonth(name)} - ${formatDay(day)}`,
                    tag: 'Skyblock',
                    color: '#ffa64d',
                    date: nativeDate
                });
                debug(`Add day(${day}) of ${name} at ${nativeDate}`);
            }
        }
        
        // Add start of each month as event
        {
            const date = sbDate.clone();
            date.day = 1;
            date.hour = 4;
            date.minute = 0;
            for (let month = 1; month <= MONTHS_PER_YEAR; month++) {
                date.month = month;
                const name = rawCalendar.months[month];

                const startDate = date.toDate();
                date.day = 31;
                date.hour = 12;
                date.minute = 0;
                const endDate = date.toDate();
                durations.push({
                    type: 0,
                    name: `${formatMonth(name)}`,
                    tag: 'Skyblock',
                    color: 'gold',
                    startDate: startDate,
                    endDate: endDate
                });
                const f = 'MMM Do HH:mm:SS A';
                debug(`Add duration of (${name}) at ${moment(startDate).format(f)} till ${moment(endDate).format(f)}`);

                // Bank interest event
                date.day = 1;
                date.hour = 6;
                const nativeDate = date.toDate();
                events.push({
                    name: `Bank Interest - ${formatMonth(name)}`,
                    tag: 'Skyblock',
                    color: '#994d00',
                    date: nativeDate
                });
            }
        }

        // Add yearly events as duration events
        {
            const date = sbDate.clone();
            date.hour = 1;
            date.minute = 0;
            for (const rawEvent of rawCalendar.events.yearly) {
                const start = rawEvent.when[0].start;
                const end = rawEvent.when[0].end;
                
                const startDate = date.clone();
                startDate.month = rawCalendar.reverseMonths[start.month];
                if (startDate.month < sbDate.month)
                    startDate.year++;
                startDate.day = start.day;

                const endDate = date.clone();
                endDate.month = rawCalendar.reverseMonths[end.month];
                if (endDate.month < sbDate.month)
                    endDate.year++;
                endDate.day = end.day;

                durations.push({
                    type: 0,
                    name: rawEvent.name,
                    tag: 'Skyblock',
                    color: 'black',
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate()
                });
                const f = 'MMM Do HH:mm:SS A';
                debug(`Add (${rawEvent.key}) at ${moment(startDate.toDate()).format(f)} till ${moment(endDate.toDate()).format(f)}`);
            }
        }

        return {
            lastLog: rawCalendar.lastLog,
            real: {
                SECONDS_PER_YEAR: SECONDS_PER_YEAR,
                SECONDS_PER_MONTH: rawCalendar.real.SECONDS_PER_MONTH,
                SECONDS_PER_DAY: rawCalendar.real.SECONDS_PER_DAY,
                SECONDS_PER_HOUR: rawCalendar.real.SECONDS_PER_HOUR,
                SECONDS_PER_MINUTE: rawCalendar.real.SECONDS_PER_MINUTE
            },
            months: rawCalendar.months,
            events: events,
            durations: durations
        };
    }

    async function fetch<T>(path: string): Promise<T> {
        info(`Fetching ${BASE_URL}${path}...`);
        const request = bent(BASE_URL, 'json');
        const headers: {[key: string]: string} = {
            "User-Agent": `HypixelEvents/${VERSION} Updater`
        }
        const response = await request(path, undefined, headers);
        return response as any;
    }

    function formatMonth(type: MonthType): string {
        switch (type) {
            case MonthType.EARLY_SPRING:
                return "Early Spring";
            case MonthType.SPRING:
                return "Spring";
            case MonthType.LATE_SPRING:
                return "Late Spring";
            case MonthType.EARLY_SUMMER:
                return "Early Summer";
            case MonthType.SUMMER:
                return "Summer";
            case MonthType.LATE_SUMMER:
                return "Late Summer";
            case MonthType.EARLY_AUTUMN:
                return "Early Autumn";
            case MonthType.AUTUMN:
                return "Autumn";
            case MonthType.LATE_AUTUMN:
                return "Late Autumn";
            case MonthType.EARLY_WINTER:
                return "Early Winter";
            case MonthType.WINTER:
                return "Winter";
            case MonthType.LATE_WINTER:
                return "Late Winter";
            default:
                return "Unknown";
        }
    }

    function formatDay(day: number): string {
        if (day === 1)
            return "1st";
        else if (day === 2)
            return "2nd";
        else if (day === 3)
            return "3rd";
        else
            return `${day}th`;
    }

}
