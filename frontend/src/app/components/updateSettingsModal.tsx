import { Box, Button, Modal, Typography } from "@mui/material"
import type { TConfigurationForm } from "./configurationForm"
import ConfigurationForm from "./configurationForm"

export default function UpdateSettingsModal(
  { open, onSubmit, onClose }:
  { open: boolean; onSubmit: (settings: TConfigurationForm) => void; settings: TConfigurationForm, onClose: () => void; }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 450,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}>
        <Typography variant='h6' component='h2'>
          Update Settings
        </Typography>
        <ConfigurationForm onSubmit={onSubmit}>
          {(submit) => (
            <Button onClick={submit} variant='contained' color='primary'>
              Save Changes
            </Button>
          )}
        </ConfigurationForm>
      </Box>
    </Modal >
  )
}