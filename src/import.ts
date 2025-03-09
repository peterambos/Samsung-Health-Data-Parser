// module imports
const { parse } = require('csv');
const fileReadStream = require('filestream/read');

// local imports
import { Record } from "./records.ts";

export function readCSV(file: File): void {
    var newRecord: Record;
    var columnPrefix: string;
    firstLine(file, (firstLine: string) => {
        for (const [key, value] of Record.TypeSignifierMap) {
            if (firstLine.includes(key)) {
                newRecord = new Record(value[0]);
                columnPrefix = value[1];
            }
        }
        if (newRecord == undefined) { throw new Error("Not a valid SH data CSV!"); }

        new fileReadStream(file).pipe(parse({ from_line: 2, columns: true, ignore_last_delimiters: true }))
            .on('data', (row: { [key: string]: string }) => {
                newRecord.addEntry(new Date(row[columnPrefix + ".update_time"].replace(" ", "T")), parseFloat(row[columnPrefix + ".heart_rate"]));
            })
            .on('end', () => {
                console.log("Finished reading file: " + file.name + " with " + newRecord.numEntries + " entries.");
                console.dir(newRecord, { depth: null });
                console.log(JSON.stringify(newRecord));
            });
    });
};


function firstLine(file: File, callback: (firstLine: string) => void): void {
    const reader = new FileReader();
    let partialChunk = "";

    reader.onload = function (event) {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) { // Check if result is an ArrayBuffer
            const text = new TextDecoder().decode(result);
            const newlineIndex = text.indexOf('\n');
            if (newlineIndex !== -1) {
                callback(text.substring(0, newlineIndex).trim());
            } else {
                callback(text.trim());
            }
        } else {
            console.error("FileReader onload result is not an ArrayBuffer");
        }
    };

    reader.onprogress = function (event) {
        const result = reader.result;
        if (result instanceof ArrayBuffer) { // Check if result is an ArrayBuffer
            const chunk = new TextDecoder().decode(result);
            partialChunk += chunk;
            const newlineIndex = partialChunk.indexOf('\n');
            if (newlineIndex !== -1) {
                reader.abort();
                callback(partialChunk.substring(0, newlineIndex).trim());
            }
        }
    };

    reader.readAsArrayBuffer(file);
}