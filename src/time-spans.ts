export {
    TimeSpan,
    Year,
    Month,
    Day,
    Hour
}

class TimeSpan {
    id: number;
    average: number;
    numValues: number;
    values: TimeSpan[] | number[];
    parentSpan: TimeSpan | null;

    constructor(startingValue: Date, parentSpan: TimeSpan | null = null) {
        this.id = 0;
        this.average = 0;
        this.numValues = 0;
        this.values = [];
        this.parentSpan = parentSpan;
    }

    private existsInValues(datetime: Date) {
        if (this.constructor == Hour) {
            throw new TypeError("Hour takes all values, no need to check");
        }
        if (this.values.length != 0) {
            var dateCheckValue: number;
            switch (this.constructor) {
                case Year:
                    dateCheckValue = datetime.getMonth();
                    break;
                case Month:
                    dateCheckValue = datetime.getDate();
                    break;
                case Day:
                    dateCheckValue = datetime.getHours();
                    break;
                default:
                    return [null];
            }

            var matches = (this.values as TimeSpan[]).filter(value => value.id == dateCheckValue);
            if (matches.length > 0) {
                return matches;
            }
        }

        return [null];
    }

    addValue(datetime: Date, value: number) {
        if (this.constructor == Hour) {
            (this as Hour).values.push(value);
            (this as Hour).numValues ++;
            (this as Hour).average = (((this as Hour).average * ((this as Hour).numValues - 1)) + value) / (this as Hour).numValues;
            return;
        }

        var existingValues: null[] | TimeSpan[] = this.existsInValues(datetime);
        if (existingValues[0] != null) {
            existingValues[0].addValue(datetime, value);
        } else {
            var newValueType;
            switch (this.constructor) {
                case Year:
                    newValueType = Month;
                    break;
                case Month:
                    newValueType = Day;
                    break;
                case Day:
                    newValueType = Hour;
                    break;
                default:
                    return;
            }
            var newValue : TimeSpan = new newValueType(datetime, this);
            newValue.addValue(datetime, value);
            (this.values as TimeSpan[]).push(newValue);
        }
        this.numValues ++;
        this.average = ((this.average * (this.numValues - 1)) + value) / this.numValues;
    }

    toJSON() {
        const copy: any = { ...this }; // Create a shallow copy
        if (copy.parentSpan) {
            copy.parentSpan = { id: copy.parentSpan.id, type: copy.parentSpan.constructor.name};
        }
        if (Array.isArray(copy.values)){
            copy.values = copy.values.map((value: any) => {
                if(value instanceof TimeSpan){
                    return value.toJSON();
                } else {
                    return value;
                }
            });
        }
        return copy;
    }
}

class Year extends TimeSpan {
    isLeap: boolean;

    constructor(dateTime: Date, parentSpan: TimeSpan | null = null) {
        super(dateTime, parentSpan);
        this.id = dateTime.getFullYear();
        this.isLeap = this.isLeapYear(this.id);
    }

    private isLeapYear(year: number) {
        return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    }
}

class Month extends TimeSpan {
    name: string;
    numDays: number;

    constructor(dateTime: Date, parentSpan: TimeSpan) {
        super(dateTime, parentSpan);
        this.id = dateTime.getMonth();
        this.name = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][this.id];
        this.numDays = new Date(dateTime.getFullYear(), this.id + 1, 0).getDate();
    }
}

class Day extends TimeSpan {
    weekday: string;

    constructor(dateTime: Date, parentSpan: TimeSpan) {
        super(dateTime, parentSpan);
        this.id = dateTime.getDate();
        this.weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.id];
    }
}

class Hour extends TimeSpan {
    values: number[];

    constructor(dateTime: Date, parentSpan: TimeSpan) {
        super(dateTime, parentSpan);
        this.id = dateTime.getHours();
        this.values = [];
    }

    addValue(datetime: Date, value: number) {
        if (Array.isArray(this.values)) {
            this.values.push(value);
        }
    }
}
