"use client"
import React from "react";
import { DisplayResultState } from "../types";
import { ShowDiff } from "../components/displayResult";
import { importFromFile } from "../utils/file-format";
import { Typography } from "@mui/material";

export default function Run() {
  const [project, setProject] = React.useState<DisplayResultState | null>(null);
  React.useEffect(() => {
    if ("launchQueue" in window) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (launchParams.files.length > 0) {
          const fileA = (await launchParams.files[0].getFile()) as File;
          setProject(await importFromFile(fileA));
        }
      });
    }
  }, []);
  if (project === null) {
    return <Typography variant='h4'>Loading the file...</Typography>;
  }
  return <ShowDiff result={project} />;
}