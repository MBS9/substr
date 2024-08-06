"use client"
import API, { CompareResult, Pair } from '../api';
import React from 'react';

const COLOR_LIST = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'black'];

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
        const color = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
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
    const A: React.JSX.Element[] = [];
    const B: React.JSX.Element[] = [];

    result.pairs.map((pair, i) => {
        const elem = HighlightedPair({ pair, textA: result.textA, textB: result.textB });
        A.push(elem[0]);
        B.push(elem[1]);
    })
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
        <div>
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
                    Ratio: <input type="number" name="ratio" />
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