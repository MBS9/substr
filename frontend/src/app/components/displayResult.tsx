import { cloneDeep } from "lodash";
import { DisplayResultState, Pair, Substring } from "../types";
import React from "react";

const COLOR_LIST = ['yellow', 'orange', 'pink', 'gray'];

export function ShowDiff({ result: inp }: { result: DisplayResultState }) {

    const result: DisplayResultState = cloneDeep(inp);
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
        // if (pairResult?.match === false) {
        //     getContainingPair(pairResult[text].start-1, text).forEach(pair => pairs.push(pair));
        //     getContainingPair(pairResult[text].end, text).forEach(pair => pairs.push(pair));
        // }
        return pairs;
    }
    function highlight(index: number, color: string, matchColor: string) {
        getContainingPair(index, 'a').forEach(pair => {
            if (pair.hold === true) return;
            if (pair.levenshteinMatch) color = matchColor;
            if (!color) color = COLOR_LIST[index % COLOR_LIST.length];
            const similarityType = pair.levenshteinMatch ? 'Edit Ratio' : 'Cosine';
            const title = `${similarityType} similarity: ${pair.similarity.toFixed(2)}`;
            highlightRange(pair.b.start, pair.b.end, color, bRefs, title, matchesB);
            highlightRange(pair.a.start, pair.a.end, color, aRefs, title, matchesA);
        });
    }
    function reset(index: number) {
        getContainingPair(index, 'a').forEach(pair => {
            if (pair.hold === true) return;
            resetRange(pair.b.start, pair.b.end, bRefs);
            resetRange(pair.a.start, pair.a.end, aRefs);
        });
    }
    function toggleHold(index: number) {
        getContainingPair(index, 'a').forEach(pair => {
            pair.hold = !pair.hold;
        });
    }
    const A: React.JSX.Element[] = [];
    const aRefs: React.RefObject<HTMLSpanElement>[] = [];
    const B: React.JSX.Element[] = [];
    const bRefs: React.RefObject<HTMLSpanElement>[] = [];
    const matchesA = result.pairs.filter(pair => pair.levenshteinMatch).map(pair => pair.a);
    const matchesB = result.pairs.filter(pair => pair.levenshteinMatch).map(pair => pair.b);

    for (const [index, letter] of Array.from(result.textB).entries()) {
        const ref = React.createRef<HTMLSpanElement>();
        bRefs.push(ref);
        B.push(<span ref={ref} className='show-info spacing' key={index}>{letter}</span>);
    }
    for (const [index, letter] of Array.from(result.textA).entries()) {
        const ref = React.createRef<HTMLSpanElement>();
        aRefs.push(ref);
        A.push(
            <span ref={ref} className='show-info spacing'
                key={index + result.textB.length}
                onMouseOver={() => {
                    highlight(index, '', 'green');
                }}
                onMouseLeave={() => {
                    reset(index);
                }}
                onMouseDown={() => toggleHold(index)}
            >{letter}</span>);
        //highlight(index, 'white', 'green', false);
    }

    return (
        <div className='grid grid-cols-2 mt-4'>
            <div>
                <h1>Text A</h1>
                <p>{A}</p>
            </div>
            <div>
                <h1>Text B</h1>
                <p>{B}</p>
            </div>
        </div>
    );
}