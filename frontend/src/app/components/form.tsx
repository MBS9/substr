import React from "react";
import { InputData, DisplayResultState } from "../types";

type Props = { onSubmit: (data: InputData) => void, disabled: boolean, onImport: (data: DisplayResultState) => void }

export function InputForm({ onSubmit, disabled, onImport }:
    Props) {
    const submitCallback = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fileA = formData.get("a") as File;
        const fileB = formData.get("b") as File;
        const minLength = parseInt(formData.get("min_length") as string);
        const ratio = parseFloat(formData.get("ratio") as string);
        const maxStrikes = parseInt(formData.get("strikes") as string);
        onSubmit({ fileA, fileB, minLength, ratio, maxStrikes });
    }, [onSubmit]);
    const importCallback = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            alert('No file selected');
            return;
        };
        const input = await file.text();
        onImport(JSON.parse(input) as DisplayResultState);
    }, [onImport]);
    return (
        <div className='ml-3'>
            <h2 className='text-xl mt-5'>Upload files for a new project</h2>
            <form onSubmit={submitCallback}>
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
                    Ratio: <input type="number" name="ratio" min={0} max={1} step={0.001} />
                </label>
                <br />
                <label>
                    Max Strikes: <input type="number" name="strikes" />
                </label>
                <br />
                <button type="submit" className='rounded-md py-1 text-center border-black border-4 px-5' disabled={disabled}>
                    Create new project
                </button>
            </form>
            <h2 className='text-xl mt-5'>Or, open an existing project</h2>
            <input type="file" accept="*.tile" onChange={importCallback} />
        </div>
    )
}