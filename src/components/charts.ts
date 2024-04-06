import type uPlot from "uplot"
import { drawPoints, resetMapSize, guardedRangeX, guardedRangeY, FakePlotSync, charstepper, resetMapTime } from "./chartfuncs"
import uPlotA from 'uplot'
import { parseCSV } from './parse'

const synckey = uPlotA.sync("synckey")
const DARK = {
    TEXT: "#c7d0d9",
    GRID: "#2c3235",
    LINE: "#598ef7",
    BOUY: "#EF843C",
    START: "#7EB26D"
}
const LIGHT = {
    TEXT: "#434556",
    GRID: "#eff1f5",
    LINE: "#1e66f5",
    BOUY: "#fe640b",
    START: "#7EB26D"
}
let THEME = LIGHT;

export class Chart {
    options: uPlot.Options;
    data: number[][][] | number[][];
    chart!: uPlot;
    type: string;
    min: Number | null = null;
    max: Number | null = null;
    constructor(options: uPlot.Options, data: number[][][], type: string = "normal") {
        this.options = options;
        this.data = data;
        this.type = type;
    }
    resetData() {
        if (this.type == "map") {
            // initiate map data structure
            this.data = [[], [[],[]], [[],[]], [[],[]]];
            resetMapSize();
            resetMapTime();
        } else if (this.type == "wind") { 
            this.data = [[], [], []];
        } else {
            this.data = [[], []];
        }
    }
}
export const charts: Record<string, Chart> = {}

export function switchTheme() {
    if (THEME == LIGHT) { THEME = DARK; }
    else { THEME = LIGHT; }
    for (const c of Object.values(charts)) { c.chart?.redraw(false); }
}
export function setTheme(dark:boolean) {
    if (dark) { THEME = DARK; }
    else { THEME = LIGHT; }
    for (const c of Object.values(charts)) { c.chart?.redraw(false); }
}

function resetCharts() {
    for (const c of Object.values(charts)) {
        c.resetData();
    }
}

export function loadCSV(file: File, onloadcomplete: (success: boolean) => void, updatefunc: ()=>void) {
    resetCharts();
    parseCSV(file, charstepper(updatefunc), onloadcomplete);
}

const AXES = [
    {
        stroke: () => THEME.TEXT,
        ticks: {
            stroke: () => THEME.GRID,
        },
        grid: {
            stroke: () => THEME.GRID,
        }
    },
    {
        stroke: () => THEME.TEXT,
        ticks: {
            stroke: () => THEME.GRID,
        },
        grid: {
            stroke: () => THEME.GRID,
        }
    },
]

// white: #c7d0d9
charts["map"] = new Chart(
    { // options
        width: 600, height: 600,
        mode: 2,
        axes: AXES,
        series: [
            {},
            {
                stroke: () => THEME.LINE,
                //fill: () => THEME.LINE,
                paths: drawPoints(1),
                label: "Track"
            },
            {
                stroke: () => THEME.BOUY,
                //fill: "orange",
                paths: drawPoints(6),
                label: "Course"
            },
            {
                stroke: () => THEME.START,
                //fill: "green",
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
    [[], [], [], []], // data
    "map" // map type
)
synckey.sub(new FakePlotSync() as unknown as uPlot); // super ghetto just to subscribe to sync events.

const commonopts = {
    width: 600, height: 300,
    legend: {
        live: true,
    },
    axes: AXES,
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
            { label: 'Time' },
            { label: 'Boom Angle', stroke: () => THEME.LINE },
        ],
    },
    [[],[]], // data
)
charts["rudder"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Rudder Angle', stroke: () => THEME.LINE },
        ],
    },
    [[],[]], // data
)
// wind
// cell[WIND] static wind. cell[GUST] Gust wind
charts["wind"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Gust Strength', stroke: () => THEME.LINE },
            { label: 'Wind Strength', stroke: () => THEME.START },
        ],
    },
    [[],[],[]], // data
    "wind" // wind type.
)
charts["heel"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Heel Angle', stroke: () => THEME.LINE },
        ],
    },
    [[],[]], // data
)
charts["fwd"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Forward Velocity', stroke: () => THEME.LINE },
        ],
    },
    [[],[]], // data
)
charts["yaw"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Yaw', stroke: () => THEME.LINE },
        ],
    },
    [[],[]], // data
)
charts["hike"] = new Chart(
    { // options
        ...commonopts,
        series: [
            { label: 'Time'},
            { label: 'Hiking Effort', stroke: () => THEME.LINE },
        ],
    },
    [[],[]], // data
)


resetCharts();