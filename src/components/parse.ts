import { parse } from 'papaparse';
import type { Ref } from 'vue'
import type { ParseStepResult, Parser} from 'papaparse';

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
    if (Number.parseInt(version.toString().replace("@", "")) > 2) { CHECK_DATA = true; return; }
    CHECK_DATA = false;
} 

 export async function parseCSV(file: File, stepfunc: (result: ParseStepResult<Record<number, unknown>>, parser: Parser) => void, oncomplete: (success: boolean) => void) {
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
        step: stepfunc,
        skipEmptyLines: true,
        fastMode: true,
        complete: () => oncomplete(true)
    });
  }