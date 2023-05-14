import type uPlot from "uplot"
import { drawPoints, guardedRange } from "./chartfuncs"
import type { ParseStepResult, Parser } from "papaparse";
import uPlotA from 'uplot'
import { parseCSV } from './parse'

const synckey = uPlotA.sync("synckey")

export class Chart {
    options: uPlot.Options;
    data: uPlot.AlignedData;
    chart!: uPlot;
    type: string;
    constructor(options: uPlot.Options, data: uPlot.AlignedData, type: string = "normal") {
        this.options = options;
        this.data = data;
        this.type = type;
    }
    resetData() {
        this.data = [[],[]];
        if (this.type == "map") {
            // initiate map data structure
            let xy = this.data[1] as (number[] | null | undefined)[];
            xy.push([],[]);
        }
    }
}
export const charts: Record<string, Chart> = {}

let line = 0;
// data format
// [[timestamp, timestamp], [x, x], [y, y]]
// sail data format: timestamp, x, y, ...
export function chartstep(results: ParseStepResult<Record<string, unknown>>, parser: Parser) {
    let row = results.data;
    let timestamp = row[0];

    // process map data:
    let xy = charts["map"].data[1] as (number[] | null | undefined)[];
    xy[0]?.push(row[1] as number);
    xy[1]?.push(row[2] as number);
    // update map
    // boom
    let d = charts["boom"].data as number[][];
    d[0].push(timestamp as number);
    d[1].push(row[7] as number * 180 / Math.PI);
    // boom
    d = charts["rudder"].data as number[][];
    d[0].push(timestamp as number);
    d[1].push(row[16] as number * 180 / Math.PI);
}

export function loadCSV(file: File, onloadcomplete: ()=>void) {
    for (const c of Object.values(charts)) {
        c.resetData();
    }
    parseCSV(file, chartstep, onloadcomplete);
}



charts["map"] = new Chart(
    { // options
        width: 400, height: 400,
        series: [
            {},
            {
                stroke: "blue",
                fill: "rgba(0,0,255,0.1)",
                paths: drawPoints,
            },
        ],
        legend: {
            live: false,
        },
        scales: {
            x: {
                time: false,
                // auto: false,
            	// range: [-500, 500],
                // remove any scale padding, use raw data limits
                range: guardedRange,
            },
            y: {
                // auto: false,
            	// range: [-500, 500],
                // remove any scale padding, use raw data limits
                range: guardedRange,
            },
        },
    },
    [[],[]], // data
    "map" // map type
)

const commonopts = {
    width: 600, height: 300,
    legend: {
        live: true,
    },
    scales: {x: {time: false}},
    cursor: {
        sync: {
            key: synckey.key,
            filters: { }
        },
    }
}

charts["boom"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Boom Angle', stroke: 'blue'},
        ],
    },
    [[],[]], // data
)
charts["rudder"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Rudder Angle', stroke: 'blue'},
        ],
    },
    [[],[]], // data
)