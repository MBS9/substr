"use client"
import React, { useEffect } from 'react';
import * as SubstringAlgorithm from 'algo-wasm';
import { InputForm } from './components/form';
import { DisplayResultState, InputData } from './types';
import { ShowDiff } from './components/displayResult';
import Instructions from './components/instructions';
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

export default function Run() {
  const [wasmLoading, setWasmLoading] = React.useState(true);
  const [statusMessage, setStatusMessage] = React.useState(
    "Loading wasm module..."
  );
  useEffect(() => {
    SubstringAlgorithm.default().then(() => {
      console.log("Wasm initialized");
      setWasmLoading(false);
      setStatusMessage("Ready");
    });
  }, []);
  const [result, setResult] = React.useState<DisplayResultState | null>(null);
  const handleSubmit = React.useCallback(async (data: InputData) => {
    setStatusMessage("Processing... please wait");
    const result = SubstringAlgorithm.process(
      await data.fileA.text(),
      await data.fileB.text(),
      data.minLength,
      data.ratio,
      data.maxStrikes
    );
    setResult({
      textA: await data.fileA.text(),
      textB: await data.fileB.text(),
      pairs: result,
      minLength: data.minLength,
      maxStrikes: data.maxStrikes,
      ratio: data.ratio,
    });
  }, []);
  if (result === null) {
    return (
      <div>
        <Typography variant='h4'>Substring Tiler</Typography>
        <Typography variant='body1'>Status: {statusMessage}</Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid>
              <InputForm
                onSubmit={handleSubmit}
                disabled={wasmLoading}
                onImport={setResult}
              />
            </Grid>
            <Grid>
              <Instructions />
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  } else {
    return <ShowDiff result={result} />;
  }
}