import { Box, Grid2 as Grid, Typography, TextField, Select, MenuItem, Slider } from "@mui/material";
import { Algorithm } from "algo-wasm";
import React from "react";
import { ConfigurationOptions } from "../types";

export type TConfigurationForm = ConfigurationOptions

export default function ConfigurationForm({ children, onSubmit, currentSettings }:
    {
        children: (submit: () => void) => JSX.Element,
        onSubmit: (data: TConfigurationForm) => void,
        currentSettings?: TConfigurationForm
    }) {
    const [minLength, setMinLength] = React.useState(currentSettings?.minLength ?? 7);
    const [ratio, setRatio] = React.useState(currentSettings?.ratio ?? 0.8);
    const [maxStrikes, setMaxStrikes] = React.useState(currentSettings?.maxStrikes ?? 3);
    const [kernelSize, setKernelSize] = React.useState(currentSettings?.kernelSize ?? 4);
    const [algorithmSelection, setAlgorithmSelection] = React.useState(currentSettings?.algorithmSelection ?? Algorithm.Comparativus);
    const [baseMatchSize, setBaseMatchSize] = React.useState(currentSettings?.baseMatchSize ?? 10);

    return (
        <Box sx={{ mt: 4, placeItems: "center", display: "grid", placeSelf: "center" }}>
            <Grid container spacing={3}>
                <Grid>
                    <Typography variant='body1'>Minimum Length:</Typography>
                    <TextField
                        fullWidth
                        variant='standard'
                        type='number'
                        name='min_length'
                        label='Minimum Length'
                        value={minLength}
                        onChange={(e) => setMinLength(parseInt(e.target.value))}
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
                        value={maxStrikes}
                        onChange={(e) => setMaxStrikes(parseInt(e.target.value))}
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
                        value={kernelSize}
                        onChange={(e) => setKernelSize(parseInt(e.target.value))}
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
                        value={baseMatchSize}
                        onChange={(e) => setBaseMatchSize(parseInt(e.target.value))}
                        required
                    />
                </Grid>
                <Grid>
                    <Typography variant='body1'>Algorithm</Typography>
                    <Select
                        fullWidth
                        label='Algorithm'
                        name='algorithm_selection'
                        onChange={(e) => setAlgorithmSelection(e.target.value as Algorithm)}
                        value={algorithmSelection}
                        variant='standard'
                        displayEmpty
                        inputProps={{ "aria-label": "Select algorithm" }}
                    >
                        <MenuItem value={Algorithm.Comparativus}>Comparativus</MenuItem>
                        <MenuItem value={Algorithm.Matrix}>Matrix</MenuItem>
                    </Select>
                </Grid>
            </Grid>
            <Box sx={{ width: "70%", placeItems: "center", display: "grid", placeSelf: "center" }}>
                <Typography id='ratio_slider' gutterBottom>
                    Ratio:
                </Typography>
                <Slider
                    name='ratio'
                    onChange={(e, value) => setRatio(value as number)}
                    value={ratio}
                    step={0.01}
                    min={0}
                    max={1}
                    valueLabelDisplay='auto'
                    aria-labelledby='ratio_slider'
                />
            </Box>
            {children(() => {
                onSubmit({
                    minLength,
                    ratio,
                    maxStrikes,
                    kernelSize,
                    algorithmSelection,
                    baseMatchSize
                });
            })}
        </Box>
    )
}