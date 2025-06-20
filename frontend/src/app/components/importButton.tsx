import { Button } from "@mui/material"
import React from "react"
import { importFromFile } from "../utils/file-format"
import type { DisplayResultState } from "../types"

export default function ImportButton(props: {
  onImport: (file: DisplayResultState) => void;
  variant?: "contained" | "outlined" | "text";
  disabled?: boolean
}) {
  const { onImport, variant } = props
  const importCallback = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        alert("No file selected")
        return
      }
      const input = await importFromFile(file)
      onImport(input)
    },
    [onImport],
  )
  return (
    <Button variant={variant} disabled={props.disabled ?? false} component='label'>
      Import Existing Project
      <input type='file' accept='.tile' onChange={(e) => { void importCallback(e) }} hidden />
    </Button>
  )
}
