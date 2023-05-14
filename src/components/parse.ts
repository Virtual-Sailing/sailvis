import { parse } from 'papaparse';
import type { Ref } from 'vue'
import type { ParseStepResult, Parser} from 'papaparse';

function parseHeader(results: Papa.ParseResult<Record<string, unknown>>) {

} 
function stripHeader(chunk : any) {
    // get first line, then do some processing...

    // split rows to get first row
    return chunk.split("\n").slice(1).join("\n");
}

export function parseCSV(file: File, stepfunc: (result: ParseStepResult<Record<string, unknown>>, parser: Parser) => void, oncomplete: () => void) {
    // use preview first to parse and check header.
    parse(file, {
        header: false,
        dynamicTyping: true,
        skipEmptyLines: true,
        fastMode: true,
        preview: 1,
        complete: parseHeader,
    });
    // parse file proper.
    parse(file, {
        header: false, // use beforeFirstChunk to strip and parse the special header metadata.
        dynamicTyping: true,
        worker: false,
        step: stepfunc,
        skipEmptyLines: true,
        fastMode: true,
        beforeFirstChunk: stripHeader,
        complete: oncomplete
    });
  }