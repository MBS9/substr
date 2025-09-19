import { useNotification } from "../components/showNotification"
import React, { useMemo } from "react"
import { useProject } from "./useProject"
import { cloneDeep } from "lodash"

export function useAddSynonym() {
  const { project, setOptions: setConfiguration } = useProject()
  const result = project!
  const { synonymsA: synA, synonymsB: synB } = result
  // Deep copy the synonyms to avoid direct state mutation
  const synonymsA = useMemo(() => cloneDeep(synA), [synA])
  const synonymsB = useMemo(() => cloneDeep(synB), [synB])
  const [priorSelection, setPriorSelection] = React.useState<Range | null>(
    null,
  )
  const showNotification = useNotification()
  const addSynonym = React.useCallback(
    (range: Range) => {
      if (priorSelection === null) {
        setPriorSelection(range.cloneRange())
        showNotification("Please select the second word.", "info")
        return
      }
      // Get the element ids of the first and last element for both selections
      let firstElements: [string | undefined, string | undefined] = [
        priorSelection.startContainer.parentElement?.id,
        priorSelection.endContainer.parentElement?.id,
      ]
      let secondElements: [string | undefined, string | undefined] = [
        range.startContainer.parentElement?.id,
        range.endContainer.parentElement?.id,
      ]

      if (
        firstElements.includes(undefined) ||
        secondElements.includes(undefined)
      ) {
        showNotification("An error occured while adding the synonym.", "error")
        setPriorSelection(null)
        return
      }

      if (
        (firstElements[0]?.includes("b") && secondElements[1]?.includes("b")) ||
        (firstElements[0]?.includes("a") && secondElements[1]?.includes("a"))
      ) {
        showNotification("Please select words from different texts.", "error")
        return
      }

      if (firstElements[0]?.includes("b")) {
        // Swap the elements if the first element is from B
        const temp = firstElements
        firstElements = secondElements
        secondElements = temp
      }

      const startRangeA = Number(firstElements[0]!.split("-")[1])
      const endRangeA = Number(firstElements[1]!.split("-")[1])
      const startRangeB = Number(secondElements[0]!.split("-")[1])
      const endRangeB = Number(secondElements[1]!.split("-")[1])

      const wordA = { start: startRangeA, end: endRangeA + 1 }
      const wordB = { start: startRangeB, end: endRangeB + 1 }
      const foundSynonymA = synonymsA.find(
        (synonym) =>
          synonym.word.end === wordA.end && synonym.word.start === wordA.start,
      )
      if (foundSynonymA) {
        foundSynonymA.synonyms.push(wordB as any)
      } else {
        synonymsA.push({
          synonyms: [wordB as any],
          word: wordA as any,
        })
      }

      const foundSynonymB = synonymsB.find(
        (synonym) =>
          synonym.word.end === wordB.end && synonym.word.start === wordB.start,
      )
      if (foundSynonymB) {
        foundSynonymB.synonyms.push(wordA as any)
      } else {
        synonymsB.push({
          synonyms: [wordA as any],
          word: wordB as any,
        })
      }
      setPriorSelection(null)
      setConfiguration({
        algorithmSelection: result.algorithmSelection,
        baseMatchSize: result.baseMatchSize,
        kernelSize: result.kernelSize,
        maxStrikes: result.maxStrikes,
        minLength: result.minLength,
        ratio: result.ratio,
        synonymsA: synonymsA,
        synonymsB: synonymsB,
        fileNameA: result.fileNameA,
        fileNameB: result.fileNameB,
      })
      showNotification(
        "The synonym was added, and the texts were reanalyzed.",
        "success",
      )
    },
    [priorSelection, result.algorithmSelection, result.baseMatchSize, result.fileNameA, result.fileNameB, result.kernelSize, result.maxStrikes, result.minLength, result.ratio, setConfiguration, showNotification, synonymsA, synonymsB],
  )
  const removeSynonym = React.useCallback(
    (range: Range) => {
      const startElement = range.startContainer.parentElement?.id
      const endElement = range.endContainer.parentElement?.id
      if (startElement === undefined || endElement === undefined) {
        showNotification("An error occured while removing the synonym.", "error")
        return
      }
      const startIndex = Number(startElement.split("-")[1])
      const endIndex = Number(endElement.split("-")[1])
      const word = { start: startIndex, end: endIndex + 1 }
      let synonymListA = synonymsA
      let synonymListB = synonymsB
      const text = startElement.includes("a") ? "a" : "b"
      if (text === "b") {
        const temp = synonymListA
        synonymListA = synonymListB
        synonymListB = temp
      }
      const foundSynonymA = synonymListA.findIndex(
        (synonym) =>
          synonym.word.end === word.end && synonym.word.start === word.start,
      )
      if (foundSynonymA === -1) {
        showNotification("No synonym found for the selected region.", "error")
        return
      }
      synonymListA.splice(foundSynonymA, 1)
      // Also remove from the other list
      synonymListB = synonymListB.map((synonym) => {
        return {
          word: synonym.word,
          synonyms: synonym.synonyms.filter(
            (syn) => syn.start !== word.start || syn.end !== word.end,
          ),
        }
      }).filter(synonym => synonym.synonyms.length > 0)
      setConfiguration({
        algorithmSelection: result.algorithmSelection,
        baseMatchSize: result.baseMatchSize,
        kernelSize: result.kernelSize,
        maxStrikes: result.maxStrikes,
        minLength: result.minLength,
        ratio: result.ratio,
        synonymsA: text === "a" ? synonymListA : synonymListB,
        synonymsB: text === "a" ? synonymListB : synonymListA,
        fileNameA: result.fileNameA,
        fileNameB: result.fileNameB,
      })
      showNotification(
        "The synonym was removed, and the texts were reanalyzed.",
        "success",
      )
    }, [result.algorithmSelection, result.baseMatchSize, result.fileNameA, result.fileNameB, result.kernelSize, result.maxStrikes, result.minLength, result.ratio, setConfiguration, showNotification, synonymsA, synonymsB])
  return { addSynonym, removeSynonym }
}
