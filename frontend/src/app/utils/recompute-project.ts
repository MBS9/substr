import React from "react"
import type { ConfigurationOptions, DisplayResultState } from "../types"
import * as SubstringAlgorithm from "algo-wasm"
import { useNotification } from "../components/showNotification"
import { cloneDeep } from "lodash"

export default function useComputeAnalysis(
  setResult: (result: DisplayResultState) => void,
  result: DisplayResultState | null,
) {
  const showNotification = useNotification()
  const history = React.useRef<ConfigurationOptions[]>([])
  const computeAnalysis = React.useCallback(
    (textA: string, textB: string, config: ConfigurationOptions, addToHistory = true) => {
      try {
        const newResult = SubstringAlgorithm.process(
          textA,
          textB,
          config.minLength,
          config.ratio,
          config.maxStrikes,
          20000,
          config.kernelSize,
          config.baseMatchSize,
          config.algorithmSelection,
          config.synonymsA,
          config.synonymsB,
        )
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (addToHistory && result) history.current.push(cloneDeep({
          minLength: result.minLength,
          maxStrikes: result.maxStrikes,
          ratio: result.ratio,
          kernelSize: result.kernelSize,
          baseMatchSize: result.baseMatchSize,
          algorithmSelection: result.algorithmSelection,
          synonymsA: result.synonymsA,
          synonymsB: result.synonymsB,
          fileNameA: result.fileNameA,
          fileNameB: result.fileNameB,
        } satisfies ConfigurationOptions))
        setResult({
          textA: textA,
          textB: textB,
          pairs: newResult.result,
          overallLevensteinSimilarity: newResult.overall_levenstein_similarity,
          overallCosineSimilarity: newResult.overall_cosine_similarity,
          minLength: config.minLength,
          maxStrikes: config.maxStrikes,
          ratio: config.ratio,
          kernelSize: config.kernelSize,
          baseMatchSize: config.baseMatchSize,
          algorithmSelection: config.algorithmSelection,
          synonymsA: config.synonymsA,
          synonymsB: config.synonymsB,
          fileNameA: config.fileNameA,
          fileNameB: config.fileNameB,
        })
      } catch (error) {
        console.error("Error during analysis:", error)
        showNotification("An error occurred during analysis.", "error")
        return
      }
    },
    [result, setResult, showNotification],
  )
  const undo = React.useCallback((textA: string, textB: string) => {
    const previous = history.current.pop()
    console.log("Undo to previous config:", previous)
    if (previous) {
      computeAnalysis(textA, textB, previous, false)
      showNotification("Reverted to previous configuration.", "success")
    } else {
      showNotification("No previous configuration to revert to.", "info")
    }
  }, [computeAnalysis, showNotification])
  return { computeAnalysis, undo }
}