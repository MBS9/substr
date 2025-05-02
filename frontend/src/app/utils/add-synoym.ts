import { DisplayResultState } from "../types";
import React from "react";

export function useAddSynonym(result: DisplayResultState) {
    const handleAddSynonym = React.useCallback(() => {
        const currentSelection = document.getSelection();
        if (!currentSelection || currentSelection.rangeCount === 0) return;
        const a = currentSelection.toString();
        const b = prompt("Please enter the synonym for the selected text", a) as string;
        const synonymsA = result.synoymsA;
        const synonymsB = result.synoymsB;
        const indexOfA = result.textA.indexOf(a);
        const indexOfB = result.textB.indexOf(b);
        const wordA = { start: indexOfA, end: indexOfA + a.length };
        const wordB = { start: indexOfB, end: indexOfB + b.length };
        const foundSynonymA = synonymsA.find((synonym) => synonym.word.end === wordA.end && synonym.word.start === wordA.start);
        if (foundSynonymA) {
            foundSynonymA.synonyms.push(wordB as any);
        } else {
            synonymsA.push({ synonyms: [wordB as any], word: wordA as any });
        }

        const foundSynonymB = synonymsB.find((synonym) => synonym.word.end === wordB.end && synonym.word.start === wordB.start);
        if (foundSynonymB) {
            foundSynonymB.synonyms.push(wordA as any);
        } else {
            synonymsB.push({ synonyms: [wordA as any], word: wordB as any });
        }
    }, [result.synoymsA, result.synoymsB, result.textA, result.textB]);
    return handleAddSynonym;
}
