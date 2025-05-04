import React from "react";
import { DisplayResultState } from "../types";

export function useResultAnalytics(result: DisplayResultState) {
  const numberOfLevenshteinMatches = React.useMemo(() => {
    return result.pairs.filter((pair) => pair.levenshteinMatch).length;
  }, [result.pairs]);
  const avarageLevenshteinMatch = React.useMemo(() => {
    const levenshteinMatches = result.pairs.filter(
      (pair) => pair.levenshteinMatch
    );
    const totalLevenshteinMatch = levenshteinMatches.reduce(
      (acc, pair) => acc + pair.similarity,
      0
    );
    return totalLevenshteinMatch / levenshteinMatches.length;
  }, [result.pairs]);
  const avarageCosineSimilarity = React.useMemo(() => {
    const cosineSimilarities = result.pairs.filter(
      (pair) => !pair.levenshteinMatch
    );
    const totalCosineSimilarity = cosineSimilarities.reduce(
      (acc, pair) => acc + pair.similarity,
      0
    );
    return totalCosineSimilarity / cosineSimilarities.length;
  }, [result.pairs]);
  return {
    avarageLevenshteinMatch,
    avarageCosineSimilarity,
    numberOfLevenshteinMatches,
  };
}
