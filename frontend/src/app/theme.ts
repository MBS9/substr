"use client"
import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  components: {
    MuiInputLabel: {
      //Place the label in the center, above the input
      styleOverrides: {
        root: {
          textAlign: "center",
          transform: "translate(0, 0px) scale(0.75)",
          transformOrigin: "top center",
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: "body1",
      },
    },
  },
})

export default theme
