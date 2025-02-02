import { DisplayResultState, Pair, Substring } from "../types";
import React, { useEffect } from "react";

const COLOR_LIST = ['yellow', 'orange', 'pink', 'gray'];

export function ShowDiff({ result }: { result: DisplayResultState }) {

    const [isLoading, setIsLoading] = React.useState(true);

    function highlightRange(left: number, right: number, color: string, refSet: React.RefObject<HTMLSpanElement>[], text: string, matches: Substring[]) {
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
    }

    function resetRange(left: number, right: number, refSet: React.RefObject<HTMLSpanElement>[]) {
        for (let i = left; i < right; i++) {
            const ref = refSet[i];
            if (ref.current !== null) {
                ref.current.style.backgroundColor = 'transparent';
                ref.current.style.borderColor = 'transparent';
                ref.current.title = '';
            }
        }
    }
    function getContainingPair(index: number, text: 'a' | 'b') {
        const pairs: Pair[] = []
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
    }
    function highlightFromPair(pair: Pair, color: string, matchColor: string, index: number) {
        if (pair.levenshteinMatch) color = matchColor;
        if (!color) color = COLOR_LIST[index % COLOR_LIST.length];
        const similarityType = pair.levenshteinMatch ? 'Edit Ratio' : 'Cosine';
        const title = `${similarityType} similarity: ${pair.similarity.toFixed(2)}`;
        highlightRange(pair.b.start, pair.b.end, color, bRefs.current, title, matchesB);
        highlightRange(pair.a.start, pair.a.end, color, aRefs.current, title, matchesA);
    }
    function highlightFromCharIndex(index: number, color: string, matchColor: string) {
        getContainingPair(index, 'a').forEach(pair => {
            if (pair.hold === true) return;
            highlightFromPair(pair, color, matchColor, index);
        });
    }
    function reset(index: number) {
        getContainingPair(index, 'a').forEach(pair => {
            if (pair.hold === true) return;
            resetRange(pair.b.start, pair.b.end, bRefs.current);
            resetRange(pair.a.start, pair.a.end, aRefs.current);
        });
    }
    function toggleHold(index: number) {
        getContainingPair(index, 'a').forEach(pair => {
            pair.hold = !pair.hold;
        });
    }
    const A = React.useRef<React.JSX.Element[]>([]);
    const aRefs = React.useRef<React.RefObject<HTMLSpanElement>[]>([])
    const B = React.useRef<React.JSX.Element[]>([]);
    const bRefs = React.useRef<React.RefObject<HTMLSpanElement>[]>([]);
    const matchesA = React.useMemo(() => result.pairs.filter(pair => pair.levenshteinMatch).map(pair => pair.a), [result.pairs]);
    const matchesB = React.useMemo(() => result.pairs.filter(pair => pair.levenshteinMatch).map(pair => pair.b), [result.pairs]);

    useEffect(() => {
        A.current = [];
        B.current = [];
        aRefs.current = [];
        bRefs.current = [];

        for (const [index, letter] of Array.from(result.textB).entries()) {
            const ref = React.createRef<HTMLSpanElement>();
            bRefs.current.push(ref);
            B.current.push(<span ref={ref} className='show-info spacing' key={index}>{letter}</span>);
        }
        for (const [index, letter] of Array.from(result.textA).entries()) {
            const ref = React.createRef<HTMLSpanElement>();
            aRefs.current.push(ref);
            A.current.push(
                <span ref={ref} className='show-info spacing'
                    key={index + result.textB.length}
                    onMouseOver={() => {
                        highlightFromCharIndex(index, '', 'green');
                    }}
                    onMouseLeave={() => {
                        reset(index);
                    }}
                    onMouseDown={() => toggleHold(index)}
                >{letter}</span>);
        }
        loadInputResult();
        setIsLoading(false);
    }, [result.textA, result.textB]);

    function loadInputResult() {
        for (const [index, pair] of Array.from(result.pairs).entries()) {
            if (pair.hold) {
                highlightFromPair(pair, '', 'green', index);
            }
        }
    }

    function exportResult() {
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
    }

    return (
        <>
            <button onClick={exportResult} className="rounded-md py-1 text-center border-black border-4 px-5" type="button">
                Save Project
            </button>
            <p>Is Loading: {String(isLoading)}</p>
            <div className='grid grid-cols-2 mt-4'>
                <div>
                    <h1>Text A</h1>
                    <p>{A.current}</p>
                </div>
                <div>
                    <h1>Text B</h1>
                    <p>{B.current}</p>
                </div>
            </div>
        </>
    );
}