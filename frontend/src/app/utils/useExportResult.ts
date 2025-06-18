import { useCallback } from "react"
import type { DisplayResultState } from "../types"
import { exportToFile } from "./file-format"
import { useProject } from "./useProject"
import { useNotification } from "../components/showNotification"

export default function useExportResult() {
  const { project } = useProject()
  const result = project!
  const showNotification = useNotification()
  const exportResult = useCallback(async () => {
    try {
      const jsResultCopy: DisplayResultState = {
        textA: result.textA,
        textB: result.textB,
        pairs: result.pairs,
        minLength: result.minLength,
        ratio: result.ratio,
        maxStrikes: result.maxStrikes,
        kernelSize: result.kernelSize,
        baseMatchSize: result.baseMatchSize,
        algorithmSelection: result.algorithmSelection,
        synonymsA: result.synonymsA,
        synonymsB: result.synonymsB,
      }

      const file = await exportToFile(jsResultCopy)
      const url = URL.createObjectURL(file)
      const a = document.createElement("a")
      a.href = url
      a.download = "myproject.tile"
      a.click()
    } catch (error) {
      console.error("Error exporting result:", error)
      showNotification("An error occurred while exporting the result.", "error")
    }
  }, [result, showNotification])
  return exportResult
}
