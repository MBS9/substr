import React from "react";
import { InputData, DisplayResultState } from "../types";
import {
  Button, Typography, Box,
  Chip
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import ImportButton from "./importButton";
import { Algorithm } from "algo-wasm";
import ConfigurationForm from "./configurationForm";

type Props = {
  onSubmit: (data: InputData) => void;
  disabled: boolean;
  onImport: (data: DisplayResultState) => void;
};

export function InputForm({ onSubmit, disabled, onImport }: Props) {
  const [fileASelected, setFileASelected] = React.useState(false);
  const [fileBSelected, setFileBSelected] = React.useState(false);
  const submitCallback = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const fileA = formData.get("a") as File;
      const fileB = formData.get("b") as File;
      const minLength = parseInt(formData.get("min_length") as string);
      const ratio = parseFloat(formData.get("ratio") as string);
      const maxStrikes = parseInt(formData.get("strikes") as string);
      const kernelSize = parseInt(formData.get("kernel_size") as string);
      const algorithmSelection = parseInt(formData.get("algorithm_selection") as string) as Algorithm;
      const baseMatchSize = parseInt(formData.get("base_match_size") as string);
      onSubmit({ fileA, fileB, minLength, ratio, maxStrikes, kernelSize, algorithmSelection, baseMatchSize: baseMatchSize });
    },
    [onSubmit]
  );
  return (
    <Box sx={{ textAlign: "center", placeItems: "center", display: "grid", placeSelf: "center" }}>
      <Box sx={{ mt: 4, placeItems: "center" }}>
        <Typography variant='h5' sx={{ mb: 3 }}></Typography>
        <ImportButton disabled={disabled} onImport={onImport} variant='contained' />
      </Box>
      <form onSubmit={submitCallback}>
        <Divider textAlign='center' sx={{ mt: 3, mb: 3 }}>
          <Chip label='Upload new files' />
        </Divider>
        <Box sx={{ mt: 4, placeItems: "center" }}>
          <Typography variant='body1'>
            Please click to upload two files to compare. The files should be in
            plain text format.
          </Typography>
          <Button
            variant='outlined'
            component='label'
            disabled={disabled}
            endIcon={fileASelected ? <CheckIcon /> : null}
            sx={{ mr: 3 }}
          >
            File A
            <input
              type='file'
              name='a'
              accept="text/plain"
              hidden
              required
              onChange={(e) =>
                e.target.files?.[0]
                  ? setFileASelected(true)
                  : setFileASelected(false)
              }
            />
          </Button>
          <Button
            variant='outlined'
            component='label'
            disabled={disabled}
            endIcon={fileBSelected ? <CheckIcon /> : null}
          >
            File B
            <input
              type='file'
              name='b'
              hidden
              accept="text/plain"
              required
              onChange={(e) =>
                e.target.files?.[0]
                  ? setFileBSelected(true)
                  : setFileBSelected(false)
              }
            />
          </Button>
          <br />
        </Box>
        <Divider textAlign='center' sx={{ mt: 3, mb: 3 }}>
          <Chip label='Enter a few configuration options for the new files' />
        </Divider>
        <ConfigurationForm onSubmit={() => null} disabled={disabled}>
            {() => (
              <>
                <Divider> </Divider>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={disabled}
                  sx={{ mt: 4 }}
                >
                  Create new project
                </Button>
              </>
            )}
        </ConfigurationForm>
      </form>
    </Box>
  );
}
