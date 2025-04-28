import { Synonym, Word } from "algo-wasm";
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
        const wordA = new Word(indexOfA, indexOfA + a.length);
        const wordB = new Word(indexOfB, indexOfB + b.length);
        const foundSynonymA = synonymsA.find((synonym) => synonym.word === wordA.clone());
        if (foundSynonymA) {
            foundSynonymA.synonyms.push(wordB.clone());
        } else {
            synonymsA.push(new Synonym(wordA.clone(), [wordB.clone()]));
        }

        const foundSynonymB = synonymsB.find((synonym) => synonym.word === wordB.clone());
        if (foundSynonymB) {
            foundSynonymB.synonyms.push(wordA.clone());
        } else {
            synonymsB.push(new Synonym(wordB.clone(), [wordA.clone()]));
        }
    }, []);
    return handleAddSynonym;
}
