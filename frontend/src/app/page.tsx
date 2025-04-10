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
import useComputeAnylsis from './utils/recompute-project';
import { importFromFile } from './utils/file-format';

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
  React.useEffect(() => {
    if ("launchQueue" in window) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (launchParams.files.length > 0) {
          const fileA = (await launchParams.files[0].getFile()) as File;
          setResult(await importFromFile(fileA));
        }
      });
    }
  }, []);
  const runAnalysisFromTextAndConfig = useComputeAnylsis(setResult);
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
  }, [runAnalysisFromTextAndConfig]);
  const onConfigurationChange = React.useCallback(
    (data: ConfigurationOptions) => {
      if (result === null) return null;
      runAnalysisFromTextAndConfig(
        result.textA,
        result.textB,
        data
      );
    },
    [result, runAnalysisFromTextAndConfig]
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