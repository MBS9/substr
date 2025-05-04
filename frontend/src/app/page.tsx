"use client"
import React from 'react';
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
import { ShowNotification } from './components/showNotification';

let hotReloadCounter = 0;

export default function Run() {
  const [isReady, setIsReady] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState(
    "Loading... please wait"
  );
  const [result, setResult] = React.useState<DisplayResultState | null>(null);
  if (process.env.NODE_ENV === "development") hotReloadCounter++;
  React.useEffect(() => {
    SubstringAlgorithm.default().then(() => {
      setStatusMessage("Ready to process files");
      setIsReady(true);
      if ("launchQueue" in window) {
        window.launchQueue.setConsumer(async (launchParams) => {
          if (launchParams.files.length > 0) {
            const fileA = (await launchParams.files[0].getFile()) as File;
            setResult(await importFromFile(fileA));
          }
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotReloadCounter]);
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
          <Typography variant='h4' component='h1'>Substring Tiler</Typography>
          <Typography variant='subtitle1'>Status: {statusMessage}</Typography>
        </header>
        <main style={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{ flexGrow: 1, width: "70%", mb: 5 }}
          >
            <InputForm
              onSubmit={handleSubmit}
              disabled={!isReady}
              onImport={setResult}
            />
          </Box>
        </main>
      </>
    );
  } else {
    return (
      <ShowNotification>
        <ShowDiff result={result} updateConfiguration={onConfigurationChange} />
      </ShowNotification>
    );
  }
}