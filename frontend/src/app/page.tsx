"use client"
import React, { useEffect } from 'react';
import * as SubstringAlgorithm from 'algo-wasm';
import { InputForm } from './components/form';
import { DisplayResultState, InputData } from './types';
import { ShowDiff } from './components/displayResult';
import {
  Typography,
  Box
} from "@mui/material";

export default function Run() {
  const [isReady, setIsReady] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState(
    "Loading wasm module..."
  );
  useEffect(() => {
    SubstringAlgorithm.default().then(() => {
      console.log("Wasm initialized");
      setIsReady(true);
      setStatusMessage("Ready");
    });
  }, []);
  const [result, setResult] = React.useState<DisplayResultState | null>(null);
  const handleSubmit = React.useCallback(async (data: InputData) => {
    setStatusMessage("Processing... please wait");
    const textA = SubstringAlgorithm.clean_text(await data.fileA.text());
    const textB = SubstringAlgorithm.clean_text(await data.fileB.text());
    setIsReady(false);
    const result = SubstringAlgorithm.process(
      textA,
      textB,
      data.minLength,
      data.ratio,
      data.maxStrikes,
      20000,
      data.kernelSize,
      data.baseMatchSize,
      data.algorithmSelection,
    );
    setResult({
      textA: textA,
      textB: textB,
      pairs: result,
      minLength: data.minLength,
      maxStrikes: data.maxStrikes,
      ratio: data.ratio,
      kernelSize: data.kernelSize,
      baseMatchSize: data.baseMatchSize,
      algorithmSelection: data.algorithmSelection,
    });
  }, []);
  if (result === null) {
    return (
      <>
        <header style={{ textAlign: "center" }}>
          <Typography variant='h4'>Substring Tiler</Typography>
          <Typography variant='body1'>Status: {statusMessage}</Typography>
        </header>
        <main>
          <div style={{ placeItems: "center" }}>
            <Box
              sx={{ flexGrow: 1, width: "70%", placeContent: "center", mb: 5 }}
            >
              <InputForm
                onSubmit={handleSubmit}
                disabled={!isReady}
                onImport={setResult}
              />
            </Box>
          </div>
        </main>
      </>
    );
  } else {
    return (
      <>
        <ShowDiff result={result} />
      </>
    );
  }
}