import { ConfigurationOptions, DisplayResultState } from "../types";
import React, {
  useState,
  useCallback,
} from "react";
import { exportToFile } from "../utils/file-format";
import {
  Button,
  Typography,
  Box,
  IconButton,
  Snackbar,
} from "@mui/material";
import { useResultAnalytics } from "./useResultAnalytics";
import { Header } from "./header";
import { DisplayHighlighting } from './displayHighlighting';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CloseIcon from '@mui/icons-material/Close';
import UpdateSettingsModal from "./updateSettingsModal";

export function ShowDiff({ result, updateConfiguration }: { result: DisplayResultState, updateConfiguration: (result: ConfigurationOptions) => void }) {
  const resultAnalytics = useResultAnalytics(result);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);
  const onSettingsChange = useCallback(
    (settings: any) => {
      setModalOpen(false);
      updateConfiguration(settings);
      setSnackbarOpen(true);
    },
    [setModalOpen, setSnackbarOpen, updateConfiguration]
  );
  const exportResult = useCallback(async () => {
    const jsResultCopy: DisplayResultState = {
      textA: result.textA,
      textB: result.textB,
      pairs: [],
      minLength: result.minLength,
      ratio: result.ratio,
      maxStrikes: result.maxStrikes,
      kernelSize: result.kernelSize,
      baseMatchSize: result.baseMatchSize,
      algorithmSelection: result.algorithmSelection,
    };
    result.pairs.forEach((pair) => {
      jsResultCopy.pairs.push({
        a: { start: pair.a.start, end: pair.a.end } as any,
        b: { start: pair.b.start, end: pair.b.end } as any,
        similarity: pair.similarity,
        levenshteinMatch: pair.levenshteinMatch,
        hold: pair.hold,
      });
    });
    const file = await exportToFile(jsResultCopy);
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "myproject.tile";
    a.click();
  }, [result]);

  return (
    <>
      <Header>
        <IconButton
          onClick={exportResult}
          type='button'
          color='inherit'
        >
          <SaveAsIcon color="inherit" />
        </IconButton>
        <Button onClick={openModal} color='inherit'>
          <SettingsIcon color="inherit" />
        </Button>
        <Typography variant='body1' sx={{ ml: 4 }}>
          Minimum Length: {result.minLength}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Ratio: {result.ratio}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Max Strikes: {result.maxStrikes}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Kernel Size: {result.kernelSize}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Base Match Size: {result.baseMatchSize}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Algorithm: {result.algorithmSelection}
        </Typography>
      </Header>
      <UpdateSettingsModal settings={result} onSubmit={onSettingsChange} open={modalOpen} />
      <Snackbar
        message="Settings updated successfully"
        autoHideDuration={10000}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <CloseIcon />
          </IconButton>
        }
      />
      <Box>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant='h5'>Quick Summary of Results</Typography>
          <Typography variant='body1'>
            Number of Levenshtein Matches:{" "}
            {resultAnalytics.numberOfLevenshteinMatches}
          </Typography>
          <Typography variant='body1'>
            Mean Levenshtein Match:{" "}
            {resultAnalytics.avarageLevenshteinMatch.toPrecision(4)}
          </Typography>
          <Typography variant='body1'>
            Mean Cosine Similarity:{" "}
            {resultAnalytics.avarageCosineSimilarity.toPrecision(4)}
          </Typography>
        </Box>
        <DisplayHighlighting result={result} />
      </Box>
    </>

  );
}
