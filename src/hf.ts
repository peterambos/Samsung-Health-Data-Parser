/**
 * Heart frequency parser * 
 */


// module imports
const { parse } = require('csv');
const fileReadStream = require('filestream/read');

export function readCSV(file: File): void {
    console.log("Reading file: " + file);
    new fileReadStream(file).pipe(parse({ from_line: 2, columns: true, ignore_last_delimiters: true }))
    .on('data', (row: { [key: string]: string }) => {
        new HFRecord(row["com.samsung.health.heart_rate.update_time"], parseFloat(row["com.samsung.health.heart_rate.heart_rate"]));
      })
    .on('end', () => {
      console.log("Finished reading file: " + file.name + " with " + HFRecords.length + " records.");
        calculateHeartRateAverages();
        printResults();
    });
};

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

    yearData.forEach((value) => {
        value[2] = Math.round(value[1] / value[0]);
    });

    monthData.forEach((value) => {
        value[2] = Math.round(value[1] / value[0]);
    });

    dayData.forEach((value) => {
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
