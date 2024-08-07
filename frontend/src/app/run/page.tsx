"use client"
import API, { CompareResult, Pair } from '../api';
import React, { useMemo } from 'react';

const COLOR_LIST = ['yellow', 'orange', 'pink', 'gray'];

function getRandomColor() {
    return COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
}

type DisplayResultState = {
    textA: string,
    textB: string,
    pairs: CompareResult['pairs']
}

function ShowDiff({ result }: { result: DisplayResultState }) {
    
    const { A, aRefs, B, bRefs } = React.useMemo(() => {
        function highlightRange(left: number, right: number, color: string, refSet: React.RefObject<HTMLSpanElement>[], text: string) {
            for (let i = left; i < right; i++) {
                const ref = refSet[i];
                if (ref.current !== null) {
                    if (matches.findIndex(match => match[0] <= i && i < match[1]) !== -1) {
                        ref.current.style.border = '3px solid green';
                    }
                    ref.current.style.backgroundColor = color;
                    ref.current.title = text;
                }
            }
        }
        
        function getContainingPair(index: number, text: 'a' | 'b') {
            const pairs: Pair[] = []
            let pairResult: Pair | null = null;
            let len = Infinity;
            for (const pair of result.pairs) {
                if (pair[text][0] <= index && index < pair[text][1]) {
                    const newLen = pair[text][1] - pair[text][0];
                    if (newLen < len) {
                        len = newLen;
                        pairResult = pair;
                    }
                }
            }
            if (pairResult) pairs.push(pairResult);
            return pairs;
        }
        function highlight(index: number, color: string, matchColor: string, text: boolean ) {
            getContainingPair(index, 'a').forEach(pair => {
                console.log(pair.similarity, pair.match)
                if (pair.match) color = matchColor;
                if(!color) color = COLOR_LIST[index % COLOR_LIST.length];
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
        const matches = result.pairs.filter(pair => pair.match).map(pair => pair.a);

        for (const [index, letter] of Array.from(result.textB).entries()) {
            const ref = React.createRef<HTMLSpanElement>();
            bRefs.push(ref);
            B.push(<span ref={ref} className='show-info' key={index}>{letter}</span>);
        }
        for (const [index, letter] of Array.from(result.textA).entries()) {
            const ref = React.createRef<HTMLSpanElement>();
            aRefs.push(ref);
            A.push(<span ref={ref} className='show-info' key={index+result.textB.length} onMouseOver={()=>{
                highlight(index, '', 'green', true);
            }}
            onMouseLeave={()=>{
                highlight(index, 'white', 'white', false);
            }}>{letter}</span>);
            //highlight(index, 'white', 'green', false);
        }
        return { A, aRefs, B, bRefs };
    }, [result.textA, result.textB]);
    
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
    const ref = React.createRef<HTMLParagraphElement>();
    return (
        <div className='items-center'>
            <h1>Run</h1>
            <form onSubmit={(e)=>{
                ref.current!.innerText = 'Processing...please wait';
                onSubmit(e);
                }}>
                <label>
                    API URL: <input type="text" name="api_url" defaultValue={'http://localhost:8080'} />
                </label>
                <br />
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
                <button type="submit" className='rounded-md py-1 text-center border-black border-4 px-5'>Run</button>
                <p ref={ref}></p>
            </form>
        </div>
    )
}

export default function Run() {
    const [result, setResult] = React.useState<DisplayResultState | null>(null);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const api = new API(formData.get("api_url") as string);
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