import { DisplayResultState } from "../types";
import React, {
  useState,
  useCallback,
} from "react";
import { exportToFile } from "../utils/file-format";
import {
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useResultAnalytics } from "./useResultAnalytics";
import { Header } from "./header";
import { DisplayHighlighting } from './displayHighlighting';

export function ShowDiff({ result }: { result: DisplayResultState }) {
  const [isLoading, setIsLoading] = useState(true);
  const resultAnalytics = useResultAnalytics(result);
  const exportResult = useCallback(async () => {
    const jsResultCopy: DisplayResultState = {
      textA: result.textA,
      textB: result.textB,
      pairs: [],
      minLength: result.minLength,
      ratio: result.ratio,
      maxStrikes: result.maxStrikes,
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
      <header>
        <Header>
          <Button
            onClick={exportResult}
            type='button'
            variant='outlined'
            color='inherit'
          >
            Save Project
          </Button>
          <Typography variant='body1' sx={{ ml: 2 }}>
            Minimum Length: {result.minLength}
          </Typography>
          <Typography variant='body1' sx={{ ml: 2 }}>
            Ratio: {result.ratio}
          </Typography>
          <Typography variant='body1' sx={{ ml: 2 }}>
            Max Strikes: {result.maxStrikes}
          </Typography>
        </Header>
      </header>
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
