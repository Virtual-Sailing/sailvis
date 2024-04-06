import { parse } from 'papaparse';
import type { Ref } from 'vue'
import type { ParseStepResult, Parser} from 'papaparse';

// Map of version number to headings.
// TODO: change simulator to somehow add headers in the track metadata.
const VER_MAP: Record<number, Record<string, number>> = {
    3: { TIME: 0, POSX: 1, POSY: 2, POSZ: 3, ANGX: 4, ANGY: 5, ANGZ: 6, BOOM: 7, TACK: 8, SAILANGTOWIND: 9, LUFFING: 10,
        VELX: 11, VELY: 12, VELZ: 13, HIKE: 14, WIND: 15, RUDDER: 16, GUST: 17 }
}
var MAPPING = VER_MAP[3];
// https://github.com/mholt/PapaParse/issues/752#issuecomment-567294386
const papaHeaderPromise = (f: File) => new Promise<Papa.ParseResult<Record<number, unknown>>>((resolve, reject) => {
    parse(f, {
        header: false,
        delimiter: "\t",
        dynamicTyping: true,
        skipEmptyLines: true,
        fastMode: true,
        preview: 1,
        complete: function(results: Papa.ParseResult<Record<number, unknown>>) {
            resolve(results);
        },
        error: function(error: Error,  file: File) {
            reject(error);
        }
    });
});

let CHECK_DATA = false;
function parseHeader(results: Papa.ParseResult<Record<number, unknown>>) {
    let row = results.data[0];
    let version = row[0] as string|number;
    if (!version.toString().startsWith("@")) { CHECK_DATA = false; }
    const ver = Number.parseInt(version.toString().replace("@", ""));
    if (ver > 2) { 
        CHECK_DATA = true; 
        MAPPING = VER_MAP[ver];
        return;
    }
    CHECK_DATA = false;
} 

 export async function parseCSV(
        file: File, 
        stepfunc: (result: ParseStepResult<Record<number, unknown>>, parser: Parser, H: Record<string, number>) => void, 
        oncomplete: (success: boolean) => void) 
    {
    // use preview first to parse and check header.
    const results = await papaHeaderPromise(file);
    parseHeader(results);
    if (!CHECK_DATA) { return oncomplete(false); }
    // parse file proper.
    parse(file, {
        header: false, // use beforeFirstChunk to strip and parse the special header metadata.
        delimiter: "\t",
        dynamicTyping: true,
        worker: true,
        step: (_result: ParseStepResult<Record<number, unknown>>, _parser: Parser) => stepfunc(_result, _parser, MAPPING),
        skipEmptyLines: true,
        fastMode: true,
        complete: () => oncomplete(true)
    });
  }