import React from "react";
import { ConfigurationOptions, DisplayResultState } from "../types";
import * as SubstringAlgorithm from "algo-wasm";

export default function useComputeAnalsys(setResult: (result: DisplayResultState) => void) {
    const computeAnalysis = React.useCallback(
        (textA: string, textB: string, config: ConfigurationOptions) => {
            const result = SubstringAlgorithm.process(
                textA,
                textB,
                config.minLength,
                config.ratio,
                config.maxStrikes,
                20000,
                config.kernelSize,
                config.baseMatchSize,
                config.algorithmSelection,
                [],
                []
            );
            setResult({
                textA: textA,
                textB: textB,
                pairs: result,
                minLength: config.minLength,
                maxStrikes: config.maxStrikes,
                ratio: config.ratio,
                kernelSize: config.kernelSize,
                baseMatchSize: config.baseMatchSize,
                algorithmSelection: config.algorithmSelection,
            });
        },
        [setResult]
    );
    return computeAnalysis;
}