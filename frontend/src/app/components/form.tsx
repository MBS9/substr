import React from "react";
import { InputData, DisplayResultState } from "../types";
import {
  Button,
  TextField,
  Typography,
  Slider,
  Box,
  Chip,
  Select,
  MenuItem,
  Grid2 as Grid
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import ImportButton from "./importButton";
import { Algorithm } from "algo-wasm";

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
    <Box>
      <Box sx={{ mt: 4, placeItems: "center" }}>
        <Typography variant='h5' sx={{ mb: 3 }}></Typography>
        <ImportButton onImport={onImport} variant='contained' />
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
            endIcon={fileASelected ? <CheckIcon /> : null}
            sx={{ mr: 3 }}
          >
            File A
            <input
              type='file'
              name='a'
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
            endIcon={fileBSelected ? <CheckIcon /> : null}
          >
            File B
            <input
              type='file'
              name='b'
              hidden
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
        <Box sx={{ mt: 4, placeItems: "center" }}>
          <Grid container spacing={3}>
            <Grid>
              <Typography variant='body1'>Minimum Length:</Typography>
              <TextField
                fullWidth
                variant='standard'
                type='number'
                name='min_length'
                label='Minimum Length'
                defaultValue='7'
                required
              />
            </Grid>
            <Grid>
              <Typography variant='body1'>Max Strikes:</Typography>
              <TextField
                fullWidth
                variant='standard'
                type='number'
                name='strikes'
                label='Max Strikes'
                defaultValue='4'
                required
              />
            </Grid>
            <Grid>
              <Typography variant='body1'>Kernel Size</Typography>
              <TextField
                fullWidth
                variant='standard'
                type='number'
                name='kernel_size'
                label='Kernel Size'
                defaultValue='4'
                required
              />
            </Grid>
            <Grid>
              <Typography variant='body1'>Base Match Size</Typography>
              <TextField
                fullWidth
                variant='standard'
                type='number'
                name='base_match_size'
                label='Base Match Size'
                defaultValue='10'
                required
              />
            </Grid>
            <Grid>
              <Typography variant='body1'>Algorithm Selection</Typography>
              <Select
                fullWidth
                label='Algorithm'
                name='algorithm_selection'
                defaultValue={Algorithm.Comparativus}
                variant='standard'
                displayEmpty
                inputProps={{ "aria-label": "Select algorithm" }}
              >
                <MenuItem value={Algorithm.Comparativus}>Comparativus</MenuItem>
                <MenuItem value={Algorithm.Matrix}>Matrix</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Box sx={{ width: "50%", placeSelf: "center" }}>
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
        </Box>
        <Box sx={{ placeItems: "center" }}>
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
        </Box>
      </form>
    </Box>
  );
}
