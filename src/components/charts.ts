import type uPlot from "uplot"
import { drawPoints, resetMapSize, guardedRangeX, guardedRangeY, FakePlotSync, charstepper, resetMapTime } from "./chartfuncs"
import uPlotA from 'uplot'
import { parseCSV } from './parse'

const synckey = uPlotA.sync("synckey")

const td : uPlot.AlignedData = [[], [], [], []]; // make sure to update resetData() magic array below to this.
function resetMapdata(data: uPlot.AlignedData) {
    for (let tdi = 1; tdi < data.length; tdi++) {
        let txy = data[tdi] as (number[] | null | undefined)[];
        txy.push([],[]);
    }    
}
resetMapdata(td);

export class Chart {
    options: uPlot.Options;
    data: uPlot.AlignedData;
    chart!: uPlot;
    type: string;
    min: Number | null = null;
    max: Number | null = null;
    constructor(options: uPlot.Options, data: uPlot.AlignedData, type: string = "normal") {
        this.options = options;
        this.data = data;
        this.type = type;
    }
    resetData() {
        if (this.type == "map") {
            // initiate map data structure
            this.data = [[], [], [], []];
            resetMapdata(this.data);
            resetMapSize();
            resetMapTime();
        } else {
            this.data = [[], []];
        }
    }
}
export const charts: Record<string, Chart> = {}

export function loadCSV(file: File, onloadcomplete: (success: boolean) => void, updatefunc: ()=>void) {
    for (const c of Object.values(charts)) {
        c.resetData();
    }
    parseCSV(file, charstepper(updatefunc), onloadcomplete);
}

charts["map"] = new Chart(
    { // options
        width: 600, height: 600,
        mode: 2,
        series: [
            {},
            {
                stroke: "blue",
                fill: "rgba(0,0,255,0.4)",
                paths: drawPoints(1),
                label: "Track"
            },
            {
                stroke: "orange",
                fill: "orange",
                paths: drawPoints(6),
                label: "Course"
            },
            {
                stroke: "green",
                fill: "green",
                paths: drawPoints(4),
                label: "Start line"
            }
        ],
        legend: {
            live: false,
        },
        scales: {
            x: {
                time: false,
                auto: false,
            	// range: [-500, 500],
                // remove any scale padding, use raw data limits
                range: guardedRangeX,
            },
            y: {
                auto: false,
            	// range: [-500, 500],
                // remove any scale padding, use raw data limits
                range: guardedRangeY,
            },
        },
    },
    td, // data
    "map" // map type
)
synckey.sub(new FakePlotSync() as unknown as uPlot); // super ghetto just to subscribe to sync events.

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