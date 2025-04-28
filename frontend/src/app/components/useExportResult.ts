import { useCallback } from "react";
import { DisplayResultState } from "../types";
import { exportToFile } from "../utils/file-format";

export default function useExportResult(result: DisplayResultState) {
    const exportResult = useCallback(async () => {
        const jsResultCopy: DisplayResultState = {
            textA: result.textA,
            textB: result.textB,
            pairs: [],
            minLength: result.minLength,
            ratio: result.ratio,
            maxStrikes: result.maxStrikes,
            kernelSize: result.kernelSize,
            baseMatchSize: result.baseMatchSize,
            algorithmSelection: result.algorithmSelection,
            synoymsA: [],
            synoymsB: [],
        };
        result.pairs.forEach((pair) => {
            jsResultCopy.pairs.push({
                a: { start: pair.a.start, end: pair.a.end } as any,
                b: { start: pair.b.start, end: pair.b.end } as any,
                similarity: pair.similarity,
                levenshteinMatch: pair.levenshteinMatch,
                hold: pair.hold,
            });
            result.synoymsA.forEach((synonym) => {
                jsResultCopy.synoymsA.push({
                    synonyms: synonym.synonyms.map((s) => ({ start: s.start, end: s.end })),
                    word: { start: synonym.word.start, end: synonym.word.end } as any,
                } as any);
            });
            result.synoymsB.forEach((synonym) => {
                jsResultCopy.synoymsB.push({
                    synonyms: synonym.synonyms.map((s) => ({ start: s.start, end: s.end })),
                    word: { start: synonym.word.start, end: synonym.word.end } as any,
                } as any);
            });
        });
        const file = await exportToFile(jsResultCopy);
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = "myproject.tile";
        a.click();
    }, [result]);
    return exportResult;
}
