import uPlot, { type TypedArray } from "uplot";
import { Chart, charts } from "./charts";
import type { ParseStepResult, Parser } from "papaparse";

var minmaxX = [0,0];
var minmaxY = [0,0];
var minmaxXabs: uPlot.Range.MinMax = [0,0];
var minmaxYabs: uPlot.Range.MinMax = [0,0];
var minmaxSize = 20;
export function resetMapSize() { minmaxX[0] = 0; minmaxX[1] = 0; minmaxY[0] = 0; minmaxY[1] = 0; minmaxSize = 20; }
function calcRangeSize(x: number, y: number) {
    if (x < minmaxX[0]) { minmaxX[0] = x; }
    if (x > minmaxX[1]) { minmaxX[1] = x; }
    if (y < minmaxY[0]) { minmaxY[0] = y; }
    if (y > minmaxY[1]) { minmaxY[1] = y; }
    let tsizeX = minmaxX[1] - minmaxX[0];
    let tsizeY = minmaxY[1] - minmaxY[0];
    let tsize = tsizeX > tsizeY ? tsizeX : tsizeY;
    if (tsize > minmaxSize) { minmaxSize = tsize; }
    let diffX = (minmaxSize - tsizeX)/2;
    let diffY = (minmaxSize - tsizeY)/2;
    minmaxXabs = [minmaxX[0] - diffX, minmaxX[1] + diffX];
    minmaxYabs = [minmaxY[0] - diffY, minmaxY[1] + diffY];
}

export function guardedRangeX(u: uPlot, min: number, max: number): uPlot.Range.MinMax {
    return minmaxXabs;
}

export function guardedRangeY(u: uPlot, min: number, max: number): uPlot.Range.MinMax {
    return minmaxYabs;
}

// time : [x,y]
var maptime: Record<number, [number, number]> = {};

export function resetMapTime() {
    maptime = {};
}

function addPointsToMap(mapdata: (number[] | null | undefined)[], cell:string){
    for (const bouy of cell.split("|")) {
        const xy = bouy.split("~");
        const x = parseFloat(xy[1]);  // x is first element, y is second element.
        const y = -parseFloat(xy[0]);
        mapdata[0]?.push(x);
        mapdata[1]?.push(y);
        calcRangeSize(x, y);
    }
}
// data format
// [[timestamp, timestamp], [x, x], [y, y]]
// sail data format: timestamp, x, y, ...
export function charstepper(updatefunc: ()=>void) {
    
    return (results: ParseStepResult<Record<number, unknown>>, parser: Parser) => {
        let row = results.data;
        if ((row[0] as string|number).toString().startsWith("@")) { 
            // handle metadata
            if (row[0] as string === "@") {
                // handle course and start line metadata.
                // course
                addPointsToMap(charts["map"].data[2] as (number[] | null | undefined)[], row[1] as string);
                // start line.
                addPointsToMap(charts["map"].data[3] as (number[] | null | undefined)[], row[2] as string);
            }
            return; 
        }
        else if (Object.keys(row).length < 6) { return; }
        let timestamp = row[0] as number;

        // process map data:
        let xy = charts["map"].data[1] as (number[] | null | undefined)[];
        let x = row[2] as number;
        let y = -(row[1] as number); // y is negative for some reason. I think because 3D coordinate convention used in the simulator.
        xy[0]?.push(x);
        xy[1]?.push(y);
        maptime[timestamp] = [x,y];
        calcRangeSize(x, y);
        // boom
        let d = charts["boom"].data as number[][];
        d[0].push(timestamp);
        d[1].push(row[7] as number * 180 / Math.PI);
        // rudder
        d = charts["rudder"].data as number[][];
        d[0].push(timestamp);
        d[1].push(row[16] as number * 180 / Math.PI);
        // update map
        updatefunc();
    }
}

// https://github.com/leeoniya/uPlot/blob/master/demos/scatter.html#L51
export function drawPoints(sizemult: number) {
    return (u: uPlot, seriesIdx: any, idx0: any, idx1: any) => {
        const size = 1.6 * devicePixelRatio * sizemult;
        uPlot.orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim, moveTo, lineTo, rect, arc) => {
            let d = u.data[seriesIdx];
            // @ts-expect-error
            u.ctx.fillStyle = series.stroke();
            let deg360 = 2 * Math.PI;
            console.time("points");
        //	let cir = new Path2D();
        //	cir.moveTo(0, 0);
        //	arc(cir, 0, 0, 3, 0, deg360);
            // Create transformation matrix that moves 200 points to the right
        //	let m = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();
        //	m.a = 1;   m.b = 0;
        //	m.c = 0;   m.d = 1;
        //	m.e = 200; m.f = 0;
            let p = new Path2D();
            // @ts-expect-error
            for (let i = 0; i < d[0].length; i++) {
                // @ts-expect-error
                let xVal = d[0][i];
                // @ts-expect-error 
                let yVal = d[1][i];
                // @ts-expect-error
                if (xVal >= scaleX.min && xVal <= scaleX.max && yVal >= scaleY.min && yVal <= scaleY.max) {
                    let cx = valToPosX(xVal, scaleX, xDim, xOff);
                    let cy = valToPosY(yVal, scaleY, yDim, yOff);
                    p.moveTo(cx + size/2, cy);
                //	arc(p, cx, cy, 3, 0, deg360);
                    arc(p, cx, cy, size/2, 0, deg360);
                //	m.e = cx;
                //	m.f = cy;
                //	p.addPath(cir, m);
                //	qt.add({x: cx - 1.5, y: cy - 1.5, w: 3, h: 3, sidx: seriesIdx, didx: i});
                }
            }
            console.timeEnd("points");
            u.ctx.fill(p);
        });
        return null;
    };
}

export class FakePlotSync {
    pub(type: string, client: uPlot, x: number, y: number, w: number, h: number, i: number) {
        if (type != "mousemove") return;
        var time =  client.cursor.idx != null ? client.data[0][client.cursor.idx] : null;
        if (time != null) {
            let actualPlot = charts["map"].chart;
            var xy = maptime[time];
            //console.log(xy);
            if (xy !== undefined) {
                actualPlot.setCursor({left:actualPlot.valToPos(xy[0],"x"), top:actualPlot.valToPos(xy[1],"y")});
            }
            //debugger;
        }
    }
}