import { Button } from "@mui/material";
import React from "react";
import { importFromFile } from "../utils/file-format";
import { DisplayResultState } from "../types";

export default function ImportButton(props: {
  onImport: (file: DisplayResultState) => void;
  variant?: "contained" | "outlined" | "text";
}) {
  const importCallback = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        alert("No file selected");
        return;
      }
      const input = await importFromFile(file);
      props.onImport(input);
    },
    [props.onImport]
  );
  return (
    <Button variant={props.variant} component='label'>
      Import Existing Project
      <input type='file' accept='*.tile' onChange={importCallback} hidden />
    </Button>
  );
}
