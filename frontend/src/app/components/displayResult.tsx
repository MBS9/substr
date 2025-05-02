import { ConfigurationOptions, DisplayResultState } from "../types";
import {
  useState,
  useCallback,
} from "react";
import {
  Typography,
  Box,
  IconButton,
  Snackbar,
  Menu,
  MenuItem,
} from "@mui/material";
import { useResultAnalytics } from "../utils/useResultAnalytics";
import { Header } from "./header";
import { DisplayHighlighting } from './displayHighlighting';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CloseIcon from '@mui/icons-material/Close';
import UpdateSettingsModal from "./updateSettingsModal";
import React from "react";
import useExportResult from "../utils/useExportResult";
import { useAddSynonym } from "../utils/add-synoym";

export function ShowDiff({ result, updateConfiguration }: { result: DisplayResultState, updateConfiguration: (result: ConfigurationOptions) => void }) {
  const resultAnalytics = useResultAnalytics(result);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);
  const onSettingsChange = useCallback(
    (settings: ConfigurationOptions) => {
      setModalOpen(false);
      updateConfiguration(settings);
      setSnackbarOpen(true);
    },
    [updateConfiguration]
  );

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = useCallback((index: number, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedIndex(index);
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

  const addSynonym = useAddSynonym(result, updateConfiguration);

  const handleAddSynonym = useCallback(() => {
    addSynonym(selectedIndex);
    setContextMenu(null);
  }, [addSynonym, selectedIndex]);

  const handleClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const exportResult = useExportResult(result);

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
        <Typography variant='body1' sx={{ ml: 4 }}>
          Minimum Length: {result.minLength}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Ratio: {result.ratio}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Max Strikes: {result.maxStrikes}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Kernel Size: {result.kernelSize}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Base Match Size: {result.baseMatchSize}
        </Typography>
        <Typography variant='body1' sx={{ ml: 2 }}>
          Algorithm: {result.algorithmSelection}
        </Typography>
      </Header>
      <UpdateSettingsModal settings={result} onSubmit={onSettingsChange} open={modalOpen} onClose={() => setModalOpen(false)} />
      <Snackbar
        message="Settings updated successfully"
        autoHideDuration={10000}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <CloseIcon />
          </IconButton>
        }
      />
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
        <DisplayHighlighting result={result} onContextMenu={(index, e) => { handleContextMenu(index, e as any) }} />
      </Box>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
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
