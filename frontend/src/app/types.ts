import { Substring as WasmSubstring, Result } from "algo-wasm";

export type Substring = WasmSubstring;

export type Pair = Omit<Result, 'free'> & {
    hold?: boolean;
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

interface LaunchParams {
    files: any[];
    targetURL: string;
}

declare global {
    interface Window {
        launchQueue: {
            setConsumer: (
                consumer: (launchParams: LaunchParams) => void
            ) => void
        };
    }
}