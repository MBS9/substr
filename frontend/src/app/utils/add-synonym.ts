import { useNotification } from "../components/showNotification";
import { ConfigurationOptions, DisplayResultState } from "../types";
import React from "react";

export function useAddSynonym(
  result: DisplayResultState,
  setConfiguration: (result: ConfigurationOptions) => void
) {
  const { synonymsA, synonymsB } = result;
  const [priorSelection, setPriorSelection] = React.useState<Range | null>(
    null
  );
  const showNotification = useNotification();
  const handleAddSynonym = React.useCallback(() => {
    const currentSelection = document.getSelection();
    if (currentSelection === null || currentSelection.rangeCount === 0) {
      showNotification("Please select words.");
      return;
    }
    if (priorSelection === null) {
      setPriorSelection(currentSelection.getRangeAt(0).cloneRange());
      showNotification("Please select the second word.");
      return;
    }
    // Get the element ids of the first and last element for both selections
    let firstElements: [string | undefined, string | undefined] = [
      priorSelection.startContainer.parentElement?.id,
      priorSelection.endContainer.parentElement?.id,
    ];
    let secondElements: [string | undefined, string | undefined] = [
      currentSelection.getRangeAt(0).startContainer.parentElement?.id,
      currentSelection.getRangeAt(0).endContainer.parentElement?.id,
    ];

    console.log("firstElements", firstElements);
    console.log("secondElements", secondElements);

    if (
      firstElements.includes(undefined) ||
      secondElements.includes(undefined)
    ) {
      showNotification("An error occured while adding the synonym.");
      return;
    }

    if (firstElements[0]?.includes("b")) {
      // Swap the elements if the first element is from B
      const temp = firstElements;
      firstElements = secondElements;
      secondElements = temp;
    }

    const startRangeA = Number(firstElements[0]!.split("-")[1]);
    const endRangeA = Number(firstElements[1]!.split("-")[1]);
    const startRangeB = Number(secondElements[0]!.split("-")[1]);
    const endRangeB = Number(secondElements[1]!.split("-")[1]);

    const wordA = { start: startRangeA, end: endRangeA + 1 };
    const wordB = { start: startRangeB, end: endRangeB + 1 };
    const foundSynonymA = synonymsA.find(
      (synonym) =>
        synonym.word.end === wordA.end && synonym.word.start === wordA.start
    );
    if (foundSynonymA) {
      foundSynonymA.synonyms.push(wordB as any);
    } else {
      synonymsA.push({
        synonyms: [wordB as any],
        word: wordA as any,
      });
    }

    const foundSynonymB = synonymsB.find(
      (synonym) =>
        synonym.word.end === wordB.end && synonym.word.start === wordB.start
    );
    if (foundSynonymB) {
      foundSynonymB.synonyms.push(wordA as any);
    } else {
      synonymsB.push({
        synonyms: [wordA as any],
        word: wordB as any,
      });
    }
    setPriorSelection(null);
    setConfiguration({
      algorithmSelection: result.algorithmSelection,
      baseMatchSize: result.baseMatchSize,
      kernelSize: result.kernelSize,
      maxStrikes: result.maxStrikes,
      minLength: result.minLength,
      ratio: result.ratio,
      synonymsA: synonymsA,
      synonymsB: synonymsB,
    });
    showNotification("Synonym added");
  }, [
    priorSelection,
    result.algorithmSelection,
    result.baseMatchSize,
    result.kernelSize,
    result.maxStrikes,
    result.minLength,
    result.ratio,
    setConfiguration,
    showNotification,
    synonymsA,
    synonymsB,
  ]);
  return handleAddSynonym;
}
