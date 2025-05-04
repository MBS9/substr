import { Box, Grid2 as Grid, Typography, TextField, MenuItem, Slider } from "@mui/material";
import { Algorithm } from "algo-wasm";
import React from "react";
import { ConfigurationOptions } from "../types";

export type TConfigurationForm = ConfigurationOptions

export default function ConfigurationForm({ children, onSubmit, currentSettings, disabled }:
    {
        children: (submit: () => void) => JSX.Element,
        onSubmit: (data: TConfigurationForm) => void,
        currentSettings?: TConfigurationForm,
        disabled?: boolean,
    }) {
    const [minLength, setMinLength] = React.useState(currentSettings?.minLength ?? 7);
    const [ratio, setRatio] = React.useState(currentSettings?.ratio ?? 0.8);
    const [maxStrikes, setMaxStrikes] = React.useState(currentSettings?.maxStrikes ?? 3);
    const [kernelSize, setKernelSize] = React.useState(currentSettings?.kernelSize ?? 4);
    const [algorithmSelection, setAlgorithmSelection] = React.useState(currentSettings?.algorithmSelection ?? Algorithm.Comparativus);
    const [baseMatchSize, setBaseMatchSize] = React.useState(currentSettings?.baseMatchSize ?? 10);
    const UIDisabled = disabled ?? false;

    return (
        <Box sx={{ mt: 4, placeContent: "center", display: "grid", justifyItems: "center" }}>
            <Grid container spacing={3} sx={{ placeContent: "center" }}>
                <Grid>
                    <Typography variant='body1'>Minimum Length:</Typography>
                    <TextField
                        disabled={UIDisabled}
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
                        disabled={UIDisabled}
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
                        disabled={UIDisabled}
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
                        disabled={UIDisabled}
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
                    <TextField
                        disabled={UIDisabled}
                        select
                        label='Algorithm'
                        name='algorithm_selection'
                        onChange={(e) => setAlgorithmSelection(parseInt(e.target.value) as Algorithm)}
                        value={algorithmSelection}
                        variant='standard'
                    >
                        <MenuItem value={Algorithm.Comparativus}>Comparativus</MenuItem>
                        <MenuItem value={Algorithm.Matrix}>Matrix</MenuItem>
                    </TextField>
                </Grid>
            </Grid>
            <Box sx={{ width: "75%", placeItems: "center", display: "grid", placeSelf: "center", mt: 4 }}>
                <Typography id='ratio_slider' gutterBottom>
                    Ratio: {ratio}
                </Typography>
                <Slider
                    name='ratio'
                    disabled={UIDisabled}
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
                    baseMatchSize,
                    synonymsA: currentSettings?.synonymsA ?? [],
                    synonymsB: currentSettings?.synonymsB ?? [],
                });
            })}
        </Box>
    )
}