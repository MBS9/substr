import type { Algorithm, Result, Synonym, Substring as WasmSubstring } from "algo-wasm"

export type Substring = WasmSubstring

export type Pair = Omit<Result, "free"> & {
  hold?: boolean;
}

export type DisplayResultState = {
  textA: string;
  textB: string;
  pairs: Pair[];
} & ConfigurationOptions

export type InputData = {
  fileA: File,
  fileB: File,
} & ConfigurationOptions

export type ConfigurationOptions = {
  minLength: number;
  ratio: number;
  maxStrikes: number;
  kernelSize: number;
  baseMatchSize: number;
  algorithmSelection: Algorithm;
  synonymsA: Omit<Synonym, "free">[];
  synonymsB: Omit<Synonym, "free">[];
}

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