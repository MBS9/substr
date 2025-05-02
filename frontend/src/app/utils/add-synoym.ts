import { ConfigurationOptions, DisplayResultState } from "../types";
import React from "react";

export function useAddSynonym(
  result: DisplayResultState,
  setConfiguration: (result: ConfigurationOptions) => void
) {
  const handleAddSynonym = React.useCallback(
    (index: number) => {
      const currentSelection = document.getSelection();
      if (!currentSelection || currentSelection.rangeCount === 0) return;
      const a = currentSelection.toString();
      const b = prompt(
        "Please enter the synonym for the selected text",
        a
      ) as string;
      const synonymsA = result.synoymsA;
      const synonymsB = result.synoymsB;
      // Find all occurrences of a string in text
      const findAllOccurrences = (text: string, search: string): number[] => {
        const indices: number[] = [];
        let index = text.indexOf(search);
        while (index !== -1) {
          indices.push(index);
          index = text.indexOf(search, index + 1);
        }
        return indices;
      };

      // Get all occurrences
      const allIndicesA = findAllOccurrences(result.textA, a);
      const allIndicesB = findAllOccurrences(result.textB, b);
      // Find the closest index before the selection point
      const indexOfA =
        allIndicesA.find((idx) => idx <= index && idx + a.length >= index) ||
        allIndicesA[0];
      for (const indexOfB of allIndicesB) {
        const wordA = { start: indexOfA, end: indexOfA + a.length };
        const wordB = { start: indexOfB, end: indexOfB + b.length };
        const foundSynonymA = synonymsA.find(
          (synonym) =>
            synonym.word.end === wordA.end && synonym.word.start === wordA.start
        );
        if (foundSynonymA) {
          foundSynonymA.synonyms.push(wordB as any);
        } else {
          synonymsA.push({ synonyms: [wordB as any], word: wordA as any });
        }

        const foundSynonymB = synonymsB.find(
          (synonym) =>
            synonym.word.end === wordB.end && synonym.word.start === wordB.start
        );
        if (foundSynonymB) {
          foundSynonymB.synonyms.push(wordA as any);
        } else {
          synonymsB.push({ synonyms: [wordA as any], word: wordB as any });
        }
      }
      setConfiguration({
        minLength: result.minLength,
        maxStrikes: result.maxStrikes,
        ratio: result.ratio,
        kernelSize: result.kernelSize,
        baseMatchSize: result.baseMatchSize,
        algorithmSelection: result.algorithmSelection,
        synoymsA: synonymsA,
        synoymsB: synonymsB,
      });
    },
    [
      result.algorithmSelection,
      result.baseMatchSize,
      result.kernelSize,
      result.maxStrikes,
      result.minLength,
      result.ratio,
      result.synoymsA,
      result.synoymsB,
      result.textA,
      result.textB,
      setConfiguration,
    ]
  );
  return handleAddSynonym;
}
