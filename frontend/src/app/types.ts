import { Substring as WasmSubstring, Result } from "algo-wasm";

export type Substring = WasmSubstring;

export type Pair = Result & {
    hold?: boolean;
    meta?: string;
};

export type DisplayResultState = {
    textA: string,
    textB: string,
    pairs: Pair[],
}

export type InputData = {
    fileA: File,
    fileB: File,
    minLength: number,
    ratio: number,
    maxStrikes: number,
};
