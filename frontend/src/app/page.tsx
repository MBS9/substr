"use client"
import React, { useEffect } from 'react';
import * as SubstringAlgorithm from 'algo-wasm';
import { InputForm } from './components/form';
import { DisplayResultState, InputData } from './types';
import { ShowDiff } from './components/displayResult';
import Instructions from './components/instructions';

export default function Run() {
    const [wasmLoading, setWasmLoading] = React.useState(true);
    const [statusMessage, setStatusMessage] = React.useState('Loading wasm module...');
    useEffect(() => {
        SubstringAlgorithm.default().then(() => {
            console.log('Wasm initialized');
            setWasmLoading(false);
            setStatusMessage('Ready');
        });
    }, []);
    const [result, setResult] = React.useState<DisplayResultState | null>(null);
    const handleSubmit = React.useCallback(async (data: InputData) => {
        setStatusMessage('Processing... please wait');
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
    }, []);
    if (result === null) {
        return (
            <div>
                <h1 className='text-3xl mb-2'>Substring Tiler</h1>
                <p>Status: {statusMessage}</p>
                <InputForm onSubmit={handleSubmit} disabled={wasmLoading} onImport={setResult} />
                <Instructions />
            </div>
        )
    } else {
        return <ShowDiff result={result} />
    }
}