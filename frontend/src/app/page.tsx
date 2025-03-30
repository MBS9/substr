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
    setIsReady(false);
    const result = SubstringAlgorithm.process(
      await data.fileA.text(),
      await data.fileB.text(),
      data.minLength,
      data.ratio,
      data.maxStrikes,
      2000,
      4,
      data.algorithmSelection,
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