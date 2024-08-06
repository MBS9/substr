"use client"
import API, { CompareResult, Pair } from '../api';
import React, { useMemo } from 'react';

const COLOR_LIST = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'black'];

function getRandomColor() {
    return COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
}

type DisplayResultState = {
    textA: string,
    textB: string,
    pairs: CompareResult['pairs']
}

function ShowDiff({ result }: { result: DisplayResultState }) {
    function HighlightedPair({ pair, textA, textB }:
        { pair: Pair, textA: string, textB: string })
        : [React.JSX.Element, React.JSX.Element] {
        const onHover = (e: any) => {
            aRef.current!.style.backgroundColor = 'yellow';
            bRef.current!.style.backgroundColor = 'yellow';
        }
        const onHoverFinish = (e: any) => {
            aRef.current!.style.backgroundColor = 'white';
            bRef.current!.style.backgroundColor = 'white';
        }
        // SELECT A RANDOM COLOR
        const aRef = React.useRef<HTMLSpanElement>(null);
        const bRef = React.useRef<HTMLSpanElement>(null);
        const color = getRandomColor();
        const aStyle = { color: color };
        const bStyle = { color: color };
        const similarityType = pair.match ? 'Edit Ratio' : 'Cosine';
        const title = `${similarityType} similarity: ${pair.similarity.toFixed(2)}`;
        return [<span style={aStyle} ref={aRef}
            onMouseOver={onHover}
            title={title}
            onMouseLeave={onHoverFinish}>{
                textA.substring(...pair.a)
            }</span>, <span style={bStyle} ref={bRef}
                onMouseOver={onHover}
                title={title}
                onMouseLeave={onHoverFinish}>{
                textB.substring(...pair.b)
            }</span>];
    }
    
    const { A, aRefs, B, bRefs } = React.useMemo(() => {
        function highlightRange(left: number, right: number, color: string, refSet: React.RefObject<HTMLSpanElement>[], text: string) {
            for (let i = left; i < right; i++) {
                const ref = refSet[i];
                if (ref.current !== null) {
                    ref.current.style.backgroundColor = color;
                    ref.current.title = text;
                }
            }
        }
        function getContainingPair(index: number, text: 'a' | 'b') {
            const pairs = []
            for (const pair of result.pairs) {
                if (pair[text][0] <= index && index < pair[text][1]) {
                    pairs.push(pair);
                }
            }
            return pairs;
        }
        function highlight(index: number, color: string, matchColor: string, text: boolean ) {
            getContainingPair(index, 'a').forEach(pair => {
                console.log(pair.similarity, pair.match)
                if (pair.match) color = matchColor;
                const similarityType = pair.match ? 'Edit Ratio' : 'Cosine';
                const title = `${similarityType} similarity: ${pair.similarity.toFixed(2)}`;
                highlightRange(pair.b[0], pair.b[1], color, bRefs, text ? title: '');
                highlightRange(pair.a[0], pair.a[1], color, aRefs, text ? title: '');
            });
        }
        const A: React.JSX.Element[] = [];
        const aRefs: React.RefObject<HTMLSpanElement>[] = [];
        const B: React.JSX.Element[] = [];
        const bRefs: React.RefObject<HTMLSpanElement>[] = [];

        for (const [index, letter] of result.textB.split('').entries()) {
            const ref = React.createRef<HTMLSpanElement>();
            bRefs.push(ref);
            B.push(<span ref={ref} className='show-info' key={index}
                onMouseOver={()=>{
                    highlight(index, 'yellow', 'green', true);
                }}
                onMouseLeave={()=>{
                    highlight(index, 'white', 'white', true);
                }}>{letter}</span>);
        }
        for (const [index, letter] of result.textA.split('').entries()) {
            const ref = React.createRef<HTMLSpanElement>();
            aRefs.push(ref);
            A.push(<span ref={ref} className='show-info' key={index+result.textB.length} onMouseOver={()=>{
                highlight(index, 'yellow', 'green', true);
            }}
            onMouseLeave={()=>{
                highlight(index, 'white', 'white', false);
            }}>{letter}</span>);
            // highlight(index, getRandomColor());
        }
        return { A, aRefs, B, bRefs };
    }, [result.textA, result.textB]);

    /*
    const A: React.JSX.Element[] = [];
    const B: React.JSX.Element[] = [];
    result.pairs.map((pair, i) => {
        const elem = HighlightedPair({ pair, textA: result.textA, textB: result.textB });
        A.push(elem[0]);
        B.push(elem[1]);
    })
        */
    
    return (
        <div className='grid grid-cols-2'>
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

function InputForm({ onSubmit }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) {
    return (
        <div className='items-center'>
            <h1>Run</h1>
            <form onSubmit={onSubmit}>
                <label>
                    File A: <input type="file" name="a" />
                </label>
                <br />
                <label>
                    File B: <input type="file" name="b" />
                </label>
                <br />
                <label>
                    Minimum Length: <input type="number" name="min_length" />
                </label>
                <br />
                <label>
                    Ratio: <input type="number" name="ratio" min={0} max={1} step={0.001}/>
                </label>
                <br />
                <button type="submit">Run</button>
            </form>
        </div>
    )
}

export default function Run() {
    const api = new API();
    const [result, setResult] = React.useState<DisplayResultState | null>(null);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const a = formData.get("a") as File;
        const b = formData.get("b") as File;
        const minLength = parseInt(formData.get("min_length") as string);
        const ratio = parseFloat(formData.get("ratio") as string);
        const result = await api.compare(a, b, minLength, ratio);
        setResult({ textA: await a.text(), textB: await b.text(), pairs: result.pairs });
    }
    if (result === null) {
        return <InputForm onSubmit={handleSubmit} />
    } else {
        return <ShowDiff result={result} />
    }
}