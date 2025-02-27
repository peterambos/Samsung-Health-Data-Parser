/**
 * Heart frequency parser * 
 */


// module imports
const { parse } = require('csv-parse');
const fs = require('fs');

const filename: string = 'heart_rate_measurements.csv'
var HFRecords: HFRecord[] = [];


// initializing date data storage variables
var yearData: Map<number, number[]> = new Map<number, number[]>();

var monthData: Map<string, number[]> = new Map<string, number[]>([
    ["January", [0, 0, 0]],
    ["February", [0, 0, 0]],
    ["March", [0, 0, 0]],
    ["April", [0, 0, 0]],
    ["May", [0, 0, 0]],
    ["June", [0, 0, 0]],
    ["July", [0, 0, 0]],
    ["August", [0, 0, 0]],
    ["September", [0, 0, 0]],
    ["October", [0, 0, 0]],
    ["November", [0, 0, 0]],
    ["December", [0, 0, 0]]
]);

var dayData: Map<string, number[]> = new Map<string, number[]>([
    ["Monday", [0, 0, 0]],
    ["Tuesday", [0, 0, 0]],
    ["Wednesday", [0, 0, 0]],
    ["Thursday", [0, 0, 0]],
    ["Friday", [0, 0, 0]],
    ["Saturday", [0, 0, 0]],
    ["Sunday", [0, 0, 0]]
]);

var hourData: number[][] = [];

for (let i = 0; i < 24; i++) {
    hourData[i] = [0, 0, 0];
}

/** Class representing a single heart rate record */
class HFRecord {

    private static months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    public hour: number;
    public weekday: string;
    public month: string;
    public year: number;
    public bpm: number;

    /**
     * Creates a new HFRecord
     * @param datetime the date and time of the record, in the format "YYYY-MM-DD HH:MM:SS.sss"
     * @param bpm the heart rate measured at the given time
     */
    constructor(datetime: string, bpm: number) {
        const date = new Date(datetime.replace(" ", "T"));
        this.hour = date.getHours();
        this.weekday = HFRecord.getDayOfWeek(datetime);
        this.month = HFRecord.months[date.getMonth()];
        this.year = date.getFullYear();
        this.bpm = bpm;
        HFRecords.push(this);
    }

    /**
     * Given a date string, returns the day of the week as a short string ("Mon", "Tue", etc.)
     * @param dateString a date string in a format that can be parsed by the Date constructor
     * @returns the day of the week as a short string
     */
    private static getDayOfWeek(dateString: string): string {
        const date = new Date(dateString);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[date.getDay()];
    }
}

/** Reads the heart rate data from the csv file	into heart rate records */
fs.createReadStream('./data/' + filename, 'utf-8')
    .pipe(parse({ from_line: 2, columns: true, ignore_last_delimiters: true }))
    .on('data', (row: { [key: string]: string }) => {
        new HFRecord(row["com.samsung.health.heart_rate.update_time"], parseFloat(row["com.samsung.health.heart_rate.heart_rate"]));
    })
    .on('end', () => {
        calculateHeartRateAverages();
        printResults();
    });



/**
 * Calculates average heart rates and updates data structures with the results.
 * 
 * Processes each heart rate record in HFRecords to update yearData, monthData, dayData, 
 * and hourData with the total count, accumulated heart rate, and computes the average 
 * heart rate for each year, month, weekday, and hour.
 * 
 * yearData, monthData, and dayData are Maps where the keys are the year, month, and 
 * weekday respectively, and the values are arrays where:
 *   - index 0 stores the count of records
 *   - index 1 stores the accumulated heart rate
 *   - index 2 stores the calculated average heart rate
 * 
 * hourData is an array of arrays where each subarray corresponds to an hour of the day 
 * (0-23) with the same structure as the values in the Maps.
 */
function calculateHeartRateAverages() {
    HFRecords.forEach(record => {
        if (yearData.has(record.year)) {
            // @ts-ignore
            yearData.get(record.year)[0]++;
            // @ts-ignore
            yearData.get(record.year)[1] += record.bpm;
        } else {
            yearData.set(record.year, [1, record.bpm, 0]);
        }

        yearData = new Map([...yearData.entries()].sort());
        // @ts-ignore
        monthData.get(record.month)[0]++;
        // @ts-ignore
        monthData.get(record.month)[1] += record.bpm;

        // @ts-ignore
        dayData.get(record.weekday)[0]++;
        // @ts-ignore
        dayData.get(record.weekday)[1] += record.bpm;

        hourData[record.hour][0]++;
        hourData[record.hour][1] += record.bpm;
    });

    yearData.forEach((value, key) => {
        value[2] = Math.round(value[1] / value[0]);
    });

    monthData.forEach((value, key) => {
        value[2] = Math.round(value[1] / value[0]);
    });

    dayData.forEach((value, key) => {
        value[2] = Math.round(value[1] / value[0]);
    });

    for (let i = 0; i < 24; i++) {
        hourData[i][2] = Math.round(hourData[i][1] / hourData[i][0]);
    }
}


/**
 * Prints the results of the heart rate calculations to the console.
 * 
 * Prints the average heart rates per year, month, weekday, and hour.
 */
function printResults() {

    console.log("Average heart rate per year:");
    yearData.forEach((value, key) => {
        console.log(`${key}: ${value[2]}`);
    });

    console.log("Average heart rate per month:");
    monthData.forEach((value, key) => {
        console.log(`${key}: ${value[2]}`);
    });

    console.log("Average heart rate per weekday:");
    dayData.forEach((value, key) => {
        console.log(`${key}: ${value[2]}`);
    });

    console.log("Average heart rate per hour:");
    for (let i = 0; i < 24; i++) {
        console.log(`${i}: ${hourData[i][2]}`);
    }
}
