import { Substring as WasmSubstring, Result, Algorithm } from "algo-wasm";

export type Substring = WasmSubstring;

export type Pair = Omit<Result, 'free'> & {
    hold?: boolean;
};

export type DisplayResultState = {
    textA: string;
    textB: string;
    pairs: Pair[];
    minLength: number;
    ratio: number;
    maxStrikes: number;
    kernelSize: number;
    baseMatchSize: number;
    algorithmSelection: Algorithm;
};

export type InputData = {
    fileA: File,
    fileB: File,
} & ConfigurationOptions;

export type ConfigurationOptions = {
    minLength: number;
    ratio: number;
    maxStrikes: number;
    kernelSize: number;
    baseMatchSize: number;
    algorithmSelection: Algorithm;
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