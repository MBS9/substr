"use client"
import React, { useEffect } from 'react';
import * as SubstringAlgorithm from 'algo-wasm';
import { InputForm } from './components/form';
import { DisplayResultState, InputData } from './types';
import { ShowDiff } from './components/displayResult';
import Instructions from './components/instructions';

export default function Run() {
    const [wasmLoading, setWasmLoading] = React.useState(true);
    useEffect(() => {
        SubstringAlgorithm.default().then(() => {
            console.log('Wasm initialized');
            setWasmLoading(false);
        });
    }, []);
    const [result, setResult] = React.useState<DisplayResultState | null>(null);
    const handleSubmit = React.useCallback(async (data: InputData) => {
        // Initialize the wasm module
        const result = SubstringAlgorithm.process(
            await data.fileA.text(),
            await data.fileB.text(),
            data.minLength,
            data.ratio,
            data.maxStrikes
        );
        setResult({
            textA: await data.fileA.text(),
            textB: await data.fileB.text(),
            pairs: result,
        });
        console.log('Result:', result);
    }, []);
    if (result === null) {
        return (
            <div>
                <InputForm onSubmit={handleSubmit} disabled={wasmLoading} />
                <Instructions />
            </div>
        )
    } else {
        return <ShowDiff result={result} />
    }
}