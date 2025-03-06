import { AppBar, Button, Link, Toolbar, Typography } from "@mui/material";

export function Header(props: { children: React.ReactNode }) {
  return (
    <header>
      <AppBar position='static'>
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
    </header>
  );
}
