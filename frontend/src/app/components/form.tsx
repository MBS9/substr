import React from "react";
import { InputData, DisplayResultState } from "../types";
import { importFromFile } from "../utils/file-format";
import {
  Button,
  TextField,
  Typography,
  Slider,
  Box,
  Chip,
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import ImportButton from "./importButton";

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
  return (
    <Box>
      <Box sx={{ mt: 4, placeItems: "center" }}>
        <Typography variant='h5'>Open or create a project</Typography>
        <ImportButton onImport={onImport} variant='contained' />
      </Box>
      <form onSubmit={submitCallback}>
        <Divider textAlign='center' sx={{ mt: 3, mb: 3 }}>
          <Chip label='Upload new files' />
        </Divider>
        <Typography variant='body1'>
          Please click to upload two files to compare. The files should be in
          plain text format.
        </Typography>
        <Button
          variant='outlined'
          component='label'
          endIcon={fileASelected ? <CheckIcon /> : null}
          sx={{ mr: 3 }}
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
        <Divider textAlign='center' sx={{ mt: 3, mb: 3 }}>
          <Chip label='Enter a few configuration options for the new files' />
        </Divider>

        <Typography variant='body1'>Minimum Length:</Typography>
        <TextField
          variant='standard'
          type='number'
          name='min_length'
          label='Minimum Length'
          placeholder='7'
        />
        <br />

        <Box sx={{ width: 300 }}>
          <Typography id='ratio_slider' gutterBottom>
            Ratio:
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
        <Typography variant='body1'>Max Strikes:</Typography>
        <TextField
          variant='standard'
          type='number'
          name='strikes'
          label='Max Strikes'
          placeholder='4'
        />
        <br />
        <Divider> </Divider>

        <Button
          variant='contained'
          type='submit'
          className='rounded-md py-1 text-center border-black border-4 px-5'
          disabled={disabled}
          sx={{ mt: 4 }}
        >
          Create new project
        </Button>
      </form>
    </Box>
  );
}
