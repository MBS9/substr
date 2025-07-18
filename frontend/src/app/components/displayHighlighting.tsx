import { Box, Grid2 as Grid, Typography } from "@mui/material"
import type { Pair, Substring } from "../types"
import { useCallback, useEffect, useMemo, useState } from "react"
import React from "react"
import { useProject } from "../utils/useProject"

const COLOR_LIST = ["orange"]

export function DisplayHighlighting(props: { onContextMenu?: (charIndex: number, e: PointerEvent) => void }) {
  const { project } = useProject()
  const result = project!
  const { onContextMenu } = props
  const [isLoading, setIsLoading] = useState(true)
  const [aRefs, setARefs] = useState<React.RefObject<HTMLSpanElement>[]>([])
  const [bRefs, setBRefs] = useState<React.RefObject<HTMLSpanElement>[]>([])

  const matchesA = useMemo(
    () =>
      result.pairs
        .filter((pair) => pair.levenshteinMatch)
        .map((pair) => pair.a),
    [result.pairs],
  )
  const matchesB = useMemo(
    () =>
      result.pairs
        .filter((pair) => pair.levenshteinMatch)
        .map((pair) => pair.b),
    [result.pairs],
  )

  const highlightRange = useCallback(
    (
      left: number,
      right: number,
      color: string,
      refSet: React.RefObject<HTMLSpanElement>[],
      text: string,
      matches: Substring[],
    ) => {
      for (let i = left; i < right; i++) {
        const ref = refSet[i]
        if (ref.current !== null) {
          if (
            matches.findIndex((match) => match.start <= i && i < match.end) !==
            -1
          ) {
            ref.current.style.border = "3px solid green"
          }
          ref.current.style.backgroundColor = color
          ref.current.title = text
        }
      }
    },
    [],
  )

  const underlineRange = useCallback(
    (
      left: number,
      right: number,
      color: string,
      refSet: React.RefObject<HTMLSpanElement>[],
    ) => {
      for (let i = left; i < right; i++) {
        const ref = refSet[i]
        if (ref.current !== null) {
          ref.current.style.textDecoration = "underline"
          ref.current.style.textDecorationColor = color
        }
      }
    },
    [],
  )

  const resetRange = useCallback(
    (
      left: number,
      right: number,
      refSet: React.RefObject<HTMLSpanElement>[],
    ) => {
      for (let i = left; i < right; i++) {
        const ref = refSet[i]
        if (ref.current !== null) {
          ref.current.style.backgroundColor = "transparent"
          ref.current.style.borderColor = "transparent"
          ref.current.title = ""
        }
      }
    },
    [],
  )

  const getContainingPair = useCallback(
    (index: number, text: "a" | "b") => {
      const pairs: Pair[] = []
      let pairResult: Pair | null = null
      let len = Infinity
      for (const pair of result.pairs) {
        if (pair[text].start <= index && index < pair[text].end) {
          const newLen = pair[text].end - pair[text].start
          if (newLen < len) {
            len = newLen
            pairResult = pair
          }
        }
      }
      if (pairResult) pairs.push(pairResult)
      return pairs
    },
    [result.pairs],
  )

  const highlightFromPair = useCallback(
    (pair: Pair, color: string, matchColor: string, index: number) => {
      if (pair.levenshteinMatch) color = matchColor
      if (!color) color = COLOR_LIST[index % COLOR_LIST.length]
      const similarityType = pair.levenshteinMatch ? "Edit Ratio" : "Cosine"
      const title = `${similarityType} similarity: ${pair.similarity.toFixed(
        4,
      )}`
      highlightRange(pair.b.start, pair.b.end, color, bRefs, title, matchesB)
      highlightRange(pair.a.start, pair.a.end, color, aRefs, title, matchesA)
    },
    [highlightRange, matchesA, matchesB, bRefs, aRefs],
  )

  const highlightFromCharIndex = useCallback(
    (index: number, color: string, matchColor: string) => {
      getContainingPair(index, "a").forEach((pair) => {
        if (pair.hold === true) return
        highlightFromPair(pair, color, matchColor, index)
      })
    },
    [getContainingPair, highlightFromPair],
  )

  const reset = useCallback(
    (index: number) => {
      getContainingPair(index, "a").forEach((pair) => {
        if (pair.hold === true) return
        resetRange(pair.b.start, pair.b.end, bRefs)
        resetRange(pair.a.start, pair.a.end, aRefs)
      })
    },
    [getContainingPair, resetRange, bRefs, aRefs],
  )

  const toggleHold = useCallback(
    (index: number) => {
      getContainingPair(index, "a").forEach((pair) => {
        pair.hold = !pair.hold
      })
    },
    [getContainingPair],
  )

  useEffect(() => {
    const newARefs = Array(result.textA.length)
      .fill(null)
      .map(() => React.createRef<HTMLSpanElement>())
    const newBRefs = Array(result.textB.length)
      .fill(null)
      .map(() => React.createRef<HTMLSpanElement>())
    setARefs(newARefs)
    setBRefs(newBRefs)
    setIsLoading(false)
  }, [result.textA.length, result.textB.length])

  useEffect(() => {
    if (!isLoading) {
      resetRange(0, result.textA.length, aRefs)
      resetRange(0, result.textB.length, bRefs)
      result.pairs.forEach((pair, index) => {
        pair.hold = pair.hold ?? true
        if (pair.hold) {
          highlightFromPair(pair, "", "green", index)
        }
      })
      result.synonymsA.forEach((synonym) => {
        underlineRange(
          synonym.word.start,
          synonym.word.end,
          "black",
          aRefs,
        )
      })
      result.synonymsB.forEach((synonym) => {
        underlineRange(
          synonym.word.start,
          synonym.word.end,
          "black",
          bRefs,
        )
      })
    }
  }, [isLoading, result.pairs, highlightFromPair, resetRange, result.textA.length, result.textB.length, aRefs, bRefs, result.synonymsA, result.synonymsB, underlineRange])

  return (
    <Box>
      <Typography variant='h5'>Text Comparison</Typography>
      <Typography>
        The two input texts are displayed below. With your cursor, hover
        over the text to highlight the matches. To hold the highlighting,
        click on the text.
      </Typography>
      <Grid container gap={3} sx={{ mt: 3 }}>
        <Grid sx={{ width: "50%" }}>
          <Typography>
            {Array.from(result.textA).map((letter, index) => (
              <span
                ref={aRefs[index]}
                style={{ fontFamily: "simsun" }}
                className='show-info spacing'
                key={index + result.textB.length}
                onMouseOver={() =>
                  highlightFromCharIndex(index, "", "green")
                }
                onMouseLeave={() => reset(index)}
                onMouseDown={() => toggleHold(index)}
                onContextMenu={(e) => onContextMenu ? onContextMenu(index, e as any) : undefined}
                id={`a-${index}`}
              >
                {letter}
              </span>
            ))}
          </Typography>
        </Grid>
        <Grid size='grow'>
          <Typography>
            {Array.from(result.textB).map((letter, index) => (
              <span
                ref={bRefs[index]}
                className='show-info spacing'
                style={{ fontFamily: "simsun" }}
                key={index}
                onContextMenu={(e) => onContextMenu ? onContextMenu(index, e as any) : undefined}
                id={`b-${index}`}
              >
                {letter}
              </span>
            ))}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}