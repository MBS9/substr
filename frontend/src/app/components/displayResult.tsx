import type { ConfigurationOptions } from "../types"
import {
  useCallback,
  useState,
} from "react"
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material"
import { useResultAnalytics } from "../utils/useResultAnalytics"
import { Header } from "./header"
import { DisplayHighlighting } from "./displayHighlighting"
import SettingsIcon from "@mui/icons-material/Settings"
import SaveAsIcon from "@mui/icons-material/SaveAs"
import UndoIcon from "@mui/icons-material/Undo"
import UpdateSettingsModal from "./updateSettingsModal"
import React from "react"
import useExportResult from "../utils/useExportResult"
import { useAddSynonym } from "../utils/synonyms"
import { useNotification } from "./showNotification"
import { useProject } from "../utils/useProject"

export function ShowDiff() {
  const { project, setOptions: updateConfiguration, undoConfigChange } = useProject()
  const result = project!
  const resultAnalytics = useResultAnalytics(result)
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const showNotification = useNotification()
  const openModal = useCallback(() => {
    setModalOpen(true)
  }, [])
  const onSettingsChange = useCallback(
    (settings: ConfigurationOptions) => {
      setModalOpen(false)
      updateConfiguration(settings)
      showNotification("Settings have been updated, and the texts have been reanalyzed.", "success")
    },
    [showNotification, updateConfiguration],
  )

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null)

  const handleContextMenu = useCallback((index: number, event: React.MouseEvent) => {
    event.preventDefault()

    const selection = document.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      setSelectedRange(range.cloneRange())

      setTimeout(() => {
        selection.addRange(range)
      })
    }
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        :  // Close context menu if it is already open
        null,
    )
  }, [contextMenu])

  const { addSynonym, removeSynonym } = useAddSynonym()

  const handleAddSynonym = useCallback(() => {
    if (!selectedRange) {
      showNotification("No word selected. Please select a word to add a synonym.", "warning")
      return
    }
    addSynonym(selectedRange)
    setContextMenu(null)
  }, [addSynonym, selectedRange, showNotification])

  const handleRemoveSynonym = useCallback(() => {
    if (!selectedRange) {
      showNotification("No word selected. Please select a word to remove a synonym.", "warning")
      return
    }
    removeSynonym(selectedRange)
    setContextMenu(null)
  }, [removeSynonym, selectedRange, showNotification])

  const handleClose = useCallback(() => {
    setContextMenu(null)
  }, [])

  const exportResult = useExportResult()

  return (
    <>
      <Header>
        <IconButton
          onClick={() => {
            void exportResult()
          }}
          type='button'
          color='inherit'
        >
          <SaveAsIcon color="inherit" />
        </IconButton>
        <IconButton onClick={openModal} color='inherit'>
          <SettingsIcon color="inherit" />
        </IconButton>
        <IconButton onClick={undoConfigChange} color='inherit'>
          <UndoIcon color="inherit" />
        </IconButton>
        <Typography sx={headingStyle}>
          Minimum Length: {result.minLength}
        </Typography>
        <Typography sx={headingStyle}>
          Ratio: {result.ratio}
        </Typography>
        <Typography sx={headingStyle}>
          Max Strikes: {result.maxStrikes}
        </Typography>
        <Typography sx={headingStyle}>
          Kernel Size: {result.kernelSize}
        </Typography>
        <Typography sx={headingStyle}>
          Base Match Size: {result.baseMatchSize}
        </Typography>
      </Header>
      <UpdateSettingsModal settings={result} onSubmit={onSettingsChange} open={modalOpen} onClose={() => setModalOpen(false)} />
      <Box component='main'>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant='h5'>Quick Summary of Results</Typography>
          <Typography>
            Number of Levenshtein Matches:{" "}
            {resultAnalytics.numberOfLevenshteinMatches}
          </Typography>
          <Typography>
            Mean Levenshtein Match:{" "}
            {resultAnalytics.avarageLevenshteinMatch.toPrecision(4)}
          </Typography>
          <Typography>
            Mean Cosine Similarity:{" "}
            {resultAnalytics.avarageCosineSimilarity.toPrecision(4)}
          </Typography>
          <Typography>
            Overall Levenshtein Similarity:{" "}
            {result.overallLevensteinSimilarity.toPrecision(4)}
          </Typography>
          <Typography>
            Overall Cosine Similarity:{" "}
            {result.overallCosineSimilarity.toPrecision(4)}
          </Typography>
        </Box>
        <DisplayHighlighting onContextMenu={(index, e) => { handleContextMenu(index, e as any) }} />
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
        <MenuItem onClick={handleRemoveSynonym}>Remove Synonym</MenuItem>
      </Menu>
    </>
  )
}

const headingStyle = { ml: 2 }