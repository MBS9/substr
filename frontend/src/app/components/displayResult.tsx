import { DisplayResultState, Pair, Substring } from "../types";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";

const COLOR_LIST = ['yellow', 'orange', 'pink', 'gray'];

export function ShowDiff({ result }: { result: DisplayResultState }) {
    const [isLoading, setIsLoading] = useState(true);
    const [aRefs, setARefs] = useState<React.RefObject<HTMLSpanElement>[]>([]);
    const [bRefs, setBRefs] = useState<React.RefObject<HTMLSpanElement>[]>([]);

    const matchesA = useMemo(() => result.pairs.filter(pair => pair.levenshteinMatch).map(pair => pair.a), [result.pairs]);
    const matchesB = useMemo(() => result.pairs.filter(pair => pair.levenshteinMatch).map(pair => pair.b), [result.pairs]);

    const highlightRange = useCallback((left: number, right: number, color: string, refSet: React.RefObject<HTMLSpanElement>[], text: string, matches: Substring[]) => {
        for (let i = left; i < right; i++) {
            const ref = refSet[i];
            if (ref.current !== null) {
                if (matches.findIndex(match => match.start <= i && i < match.end) !== -1) {
                    ref.current.style.border = '3px solid green';
                }
                ref.current.style.backgroundColor = color;
                ref.current.title = text;
            }
        }
    }, []);

    const resetRange = useCallback((left: number, right: number, refSet: React.RefObject<HTMLSpanElement>[]) => {
        for (let i = left; i < right; i++) {
            const ref = refSet[i];
            if (ref.current !== null) {
                ref.current.style.backgroundColor = 'transparent';
                ref.current.style.borderColor = 'transparent';
                ref.current.title = '';
            }
        }
    }, []);

    const getContainingPair = useCallback((index: number, text: 'a' | 'b') => {
        const pairs: Pair[] = [];
        let pairResult: Pair | null = null;
        let len = Infinity;
        for (const pair of result.pairs) {
            if (pair[text].start <= index && index < pair[text].end) {
                const newLen = pair[text].end - pair[text].start;
                if (newLen < len) {
                    len = newLen;
                    pairResult = pair;
                }
            }
        }
        if (pairResult) pairs.push(pairResult);
        return pairs;
    }, [result.pairs]);

    const highlightFromPair = useCallback((pair: Pair, color: string, matchColor: string, index: number) => {
        if (pair.levenshteinMatch) color = matchColor;
        if (!color) color = COLOR_LIST[index % COLOR_LIST.length];
        const similarityType = pair.levenshteinMatch ? 'Edit Ratio' : 'Cosine';
        const title = `${similarityType} similarity: ${pair.similarity.toFixed(2)}`;
        highlightRange(pair.b.start, pair.b.end, color, bRefs, title, matchesB);
        highlightRange(pair.a.start, pair.a.end, color, aRefs, title, matchesA);
    }, [highlightRange, matchesA, matchesB, bRefs, aRefs]);

    const highlightFromCharIndex = useCallback((index: number, color: string, matchColor: string) => {
        getContainingPair(index, 'a').forEach(pair => {
            if (pair.hold === true) return;
            highlightFromPair(pair, color, matchColor, index);
        });
    }, [getContainingPair, highlightFromPair]);

    const reset = useCallback((index: number) => {
        getContainingPair(index, 'a').forEach(pair => {
            if (pair.hold === true) return;
            resetRange(pair.b.start, pair.b.end, bRefs);
            resetRange(pair.a.start, pair.a.end, aRefs);
        });
    }, [getContainingPair, resetRange, bRefs, aRefs]);

    const toggleHold = useCallback((index: number) => {
        getContainingPair(index, 'a').forEach(pair => {
            pair.hold = !pair.hold;
        });
    }, [getContainingPair]);

    useEffect(() => {
        const newARefs = Array(result.textA.length).fill(null).map(() => React.createRef<HTMLSpanElement>());
        const newBRefs = Array(result.textB.length).fill(null).map(() => React.createRef<HTMLSpanElement>());
        setARefs(newARefs);
        setBRefs(newBRefs);
        setIsLoading(false);
    }, [result.textA.length, result.textB.length]);

    useEffect(() => {
        if (!isLoading) {
            result.pairs.forEach((pair, index) => {
                if (pair.hold) {
                    highlightFromPair(pair, '', 'green', index);
                }
            });
        }
    }, [isLoading, result.pairs, highlightFromPair]);

    const exportResult = useCallback(() => {
        const jsResultCopy: DisplayResultState = { textA: result.textA, textB: result.textB, pairs: [] };
        result.pairs.forEach(pair => {
            jsResultCopy.pairs.push({
                a: { start: pair.a.start, end: pair.a.end } as any,
                b: { start: pair.b.start, end: pair.b.end } as any,
                similarity: pair.similarity,
                levenshteinMatch: pair.levenshteinMatch,
                hold: pair.hold,
            });
        });
        const resultText = JSON.stringify(jsResultCopy);
        const blob = new Blob([resultText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'myproject.tile';
        a.click();
    }, [result]);

    return (
        <>
            <button onClick={exportResult} className="rounded-md py-1 text-center border-black border-4 px-5" type="button">
                Save Project
            </button>
            {isLoading ? <p>Loading...</p> :
                <div className='grid grid-cols-2 mt-4'>
                    <div>
                        <h1>Text A</h1>
                        <p>
                            {Array.from(result.textA).map((letter, index) => (
                                <span
                                    ref={aRefs[index]}
                                    className='show-info spacing'
                                    key={index + result.textB.length}
                                    onMouseOver={() => highlightFromCharIndex(index, '', 'green')}
                                    onMouseLeave={() => reset(index)}
                                    onMouseDown={() => toggleHold(index)}
                                >
                                    {letter}
                                </span>
                            ))}
                        </p>
                    </div>
                    <div>
                        <h1>Text B</h1>
                        <p>
                            {Array.from(result.textB).map((letter, index) => (
                                <span
                                    ref={bRefs[index]}
                                    className='show-info spacing'
                                    key={index}
                                >
                                    {letter}
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            }
        </>
    );
}