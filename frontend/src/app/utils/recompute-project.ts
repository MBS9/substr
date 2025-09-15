import React from "react"
import type { ConfigurationOptions, DisplayResultState } from "../types"
import * as SubstringAlgorithm from "algo-wasm"
import { useNotification } from "../components/showNotification"

export default function useComputeAnalysis(
  setResult: (result: DisplayResultState) => void,
) {
  const showNotification = useNotification()
  const computeAnalysis = React.useCallback(
    (textA: string, textB: string, config: ConfigurationOptions) => {
      try {
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
          config.synonymsA,
          config.synonymsB,
        )
        setResult({
          textA: textA,
          textB: textB,
          pairs: result.result,
          overallLevensteinSimilarity: result.overall_levenstein_similarity,
          overallCosineSimilarity: result.overall_cosine_similarity,
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
    [setResult, showNotification],
  )
  return computeAnalysis
}