import { Year } from "./time-spans";

export {
    Record,
}

enum RecordType {
    HeartRate = "HeartRate"
}

class Record {

    public static TypeSignifierMap: Map<string, [RecordType, string]> = new Map<string, [RecordType, string]>([
        [
            "com.samsung.shealth.tracker.heart_rate",
            [RecordType.HeartRate, "com.samsung.health.heart_rate"]
        ]
    ]);

    public static RecordsMap: Map<RecordType, Record> = new Map<RecordType, Record>();

    type: RecordType;
    dataYears: Year[];
    numEntries: number;

    constructor(type: RecordType) {
        this.type = type;
        this.dataYears = [];
        this.numEntries = 0;
        Record.RecordsMap.set(type, this);
    }

    addEntry(datetime: Date, value: number) {

        var yearToAddTo = this.dataYears.find(year => year.id == datetime.getFullYear());
        if (this.dataYears.length == 0 || !yearToAddTo) {
            yearToAddTo = new Year(datetime);
            this.dataYears.push(yearToAddTo);
        }

        (yearToAddTo as Year).addValue(datetime, value);
        this.numEntries++;
    }

}