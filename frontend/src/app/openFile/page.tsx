"use client"
import React from "react";
import { DisplayResultState } from "../types";
import { ShowDiff } from "../components/displayResult";
import { importFromFile } from "../utils/file-format";

export default function Run() {
    const [project, setProject] = React.useState<DisplayResultState | null>(null);
    React.useEffect(() => {
        if ('launchQueue' in window) {
            window.launchQueue.setConsumer(async (launchParams) => {
                if (launchParams.files.length > 0) {
                    const fileA = await launchParams.files[0].getFile() as File;
                    setProject(await importFromFile(fileA));
                }
            })
        }
    }, []);
    if (project === null) {
        return <p className="text-xl m-3">Loading the file...</p>
    }
    return (
        <ShowDiff result={project} />
    )
}