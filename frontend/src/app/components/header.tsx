import type React from "react"
import { AppBar, Toolbar, Typography } from "@mui/material"

export function Header(props: { children: React.ReactNode }) {
  return (
    <AppBar position='sticky' component='header'>
      <Toolbar variant='dense'>
        <Typography
          variant='h6'
          color='inherit'
          component='div'
          sx={{ mr: 4 }}
        >
          Substring Tiler
        </Typography>
        {props.children}
      </Toolbar>
    </AppBar>
  )
}
