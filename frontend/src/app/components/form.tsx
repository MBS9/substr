import React from "react";
import { InputData, DisplayResultState } from "../types";
import { importFromFile } from "../utils/file-format";
import { Button, TextField, Typography, Slider, Box } from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";

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
      onSubmit({ fileA, fileB, minLength, ratio, maxStrikes });
    },
    [onSubmit]
  );
  const importCallback = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        alert("No file selected");
        return;
      }
      const input = await importFromFile(file);
      onImport(input);
    },
    [onImport]
  );
  return (
    <div>
      <Typography variant='h5'>Upload files for a new project</Typography>
      <form onSubmit={submitCallback}>
        <Typography variant='body1'>Select files: </Typography>
        <Button
          variant='outlined'
          component='label'
          endIcon={fileASelected ? <CheckIcon /> : null}
        >
          File A
          <input
            type='file'
            name='a'
            hidden
            onChange={(e) =>
              e.target.files?.[0]
                ? setFileASelected(true)
                : setFileASelected(false)
            }
          />
        </Button>
        <br />
        <Button
          variant='outlined'
          component='label'
          endIcon={fileBSelected ? <CheckIcon /> : null}
        >
          File B
          <input
            type='file'
            name='b'
            hidden
            onChange={(e) =>
              e.target.files?.[0]
                ? setFileBSelected(true)
                : setFileBSelected(false)
            }
          />
        </Button>
        <br />

        <TextField
          variant='standard'
          type='number'
          name='min_length'
          label='Minimum Length'
        />
        <br />

        <Box sx={{ width: 300 }}>
          <Typography id='ratio_slider' gutterBottom>
            Ratio
          </Typography>
          <Slider
            name='ratio'
            defaultValue={0.8}
            step={0.01}
            min={0}
            max={1}
            valueLabelDisplay='auto'
            aria-labelledby='ratio_slider'
          />
        </Box>
        <TextField
          variant='standard'
          type='number'
          name='strikes'
          label='Max Strikes'
        />
        <br />

        <Button
          variant='contained'
          type='submit'
          className='rounded-md py-1 text-center border-black border-4 px-5'
          disabled={disabled}
        >
          Create new project
        </Button>
      </form>
      <Typography variant='h5'>Or, open an existing project</Typography>
      <Button variant='contained' component='label'>
        Import Project
        <input type='file' accept='*.tile' onChange={importCallback} hidden />
      </Button>
    </div>
  );
}