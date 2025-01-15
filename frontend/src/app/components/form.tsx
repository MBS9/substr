import React from "react";
import { InputData } from "../types";

export function InputForm({ onSubmit, disabled }: { onSubmit: (data: InputData) => void, disabled: boolean }) {
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
    return (
        <div className='ml-3'>
            <h1 className='text-3xl mb-2'>Substring Tiler</h1>
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
                <button type="submit" className='rounded-md py-1 text-center border-black border-4 px-5' disabled={disabled}>Run</button>
            </form>
        </div>
    )
}