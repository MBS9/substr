import { ConfigurationOptions } from "../types";
import {
  useState,
  useCallback,
} from "react";
import {
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useResultAnalytics } from "../utils/useResultAnalytics";
import { Header } from "./header";
import { DisplayHighlighting } from './displayHighlighting';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import UpdateSettingsModal from "./updateSettingsModal";
import React from "react";
import useExportResult from "../utils/useExportResult";
import { useAddSynonym } from "../utils/add-synonym";
import { useNotification } from './showNotification';
import { useProject } from '../utils/useProject';

export function ShowDiff() {
  const { project, setOptions: updateConfiguration } = useProject();
  const result = project!;
  const resultAnalytics = useResultAnalytics(result);
  const [modalOpen, setModalOpen] = useState(false);
  const showNotification = useNotification();
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);
  const onSettingsChange = useCallback(
    (settings: ConfigurationOptions) => {
      setModalOpen(false);
      updateConfiguration(settings);
      showNotification("Settings updated and analysis has been re-run.");
    },
    [showNotification, updateConfiguration]
  );

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = useCallback((index: number, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        :  // Close context menu if it is already open
        null,
    );

    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      setTimeout(() => {
        selection.addRange(range);
      });
    }
  }, [contextMenu]);

  const addSynonym = useAddSynonym();

  const handleAddSynonym = useCallback(() => {
    addSynonym();
    setContextMenu(null);
  }, [addSynonym]);

  const handleClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const exportResult = useExportResult();

  return (
    <>
      <Header>
        <IconButton
          onClick={exportResult}
          type='button'
          color='inherit'
        >
          <SaveAsIcon color="inherit" />
        </IconButton>
        <IconButton onClick={openModal} color='inherit'>
          <SettingsIcon color="inherit" />
        </IconButton>
        <Typography variant='body1' sx={headingStyle}>
          Minimum Length: {result.minLength}
        </Typography>
        <Typography variant='body1' sx={headingStyle}>
          Ratio: {result.ratio}
        </Typography>
        <Typography variant='body1' sx={headingStyle}>
          Max Strikes: {result.maxStrikes}
        </Typography>
        <Typography variant='body1' sx={headingStyle}>
          Kernel Size: {result.kernelSize}
        </Typography>
        <Typography variant='body1' sx={headingStyle}>
          Base Match Size: {result.baseMatchSize}
        </Typography>
        <Typography variant='body1' sx={headingStyle}>
          Algorithm: {result.algorithmSelection}
        </Typography>
      </Header>
      <UpdateSettingsModal settings={result} onSubmit={onSettingsChange} open={modalOpen} onClose={() => setModalOpen(false)} />
      <Box>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant='h5'>Quick Summary of Results</Typography>
          <Typography variant='body1'>
            Number of Levenshtein Matches:{" "}
            {resultAnalytics.numberOfLevenshteinMatches}
          </Typography>
          <Typography variant='body1'>
            Mean Levenshtein Match:{" "}
            {resultAnalytics.avarageLevenshteinMatch.toPrecision(4)}
          </Typography>
          <Typography variant='body1'>
            Mean Cosine Similarity:{" "}
            {resultAnalytics.avarageCosineSimilarity.toPrecision(4)}
          </Typography>
        </Box>
        <DisplayHighlighting onContextMenu={(index, e) => { handleContextMenu(index, e as any) }} />
      </Box>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        autoFocus={false}
        disableAutoFocus
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleAddSynonym}>Add Synonym</MenuItem>
      </Menu>
    </>
  );
}

const headingStyle = { ml: 2 };