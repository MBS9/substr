"use client"
import React, { useEffect } from 'react';
import * as SubstringAlgorithm from 'algo-wasm';
import { InputForm } from './components/form';
import { ConfigurationOptions, DisplayResultState, InputData } from './types';
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
  const runAnalysisFromTextAndConfig = React.useCallback(
    (textA: string, textB: string, config: ConfigurationOptions) => {
      const result = SubstringAlgorithm.process(
        textA,
        textB,
        config.minLength,
        config.ratio,
        config.maxStrikes,
        20000,
        config.kernelSize,
        config.baseMatchSize,
        config.algorithmSelection
      );
      setResult({
        textA: textA,
        textB: textB,
        pairs: result,
        minLength: config.minLength,
        maxStrikes: config.maxStrikes,
        ratio: config.ratio,
        kernelSize: config.kernelSize,
        baseMatchSize: config.baseMatchSize,
        algorithmSelection: config.algorithmSelection,
      });
    }, [setResult]);
  const handleSubmit = React.useCallback(async (data: InputData) => {
    setStatusMessage("Processing... please wait");
    const textA = SubstringAlgorithm.clean_text(await data.fileA.text());
    const textB = SubstringAlgorithm.clean_text(await data.fileB.text());

    setIsReady(false);
    runAnalysisFromTextAndConfig(
      textA,
      textB,
      data
    );
  }, []);
  const onConfigurationChange = React.useCallback(
    (data: ConfigurationOptions) => {
      if (result === null) return null;
      runAnalysisFromTextAndConfig(
        result.textA,
        result.textB,
        data
      );
    },
    [result, setResult]
  );
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
        <ShowDiff result={result} updateConfiguration={onConfigurationChange} />
      </>
    );
  }
}