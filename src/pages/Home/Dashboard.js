import React from 'react';
import { Navbar } from '../../components/Navbar';
import { theme } from '../../theme';
import Logo from '../../assets/Images/loan.jpg';
import { CssBaseline, ThemeProvider, Container, Grid } from '@material-ui/core';

export default function Dashboard() {
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Container maxWidth="lg" component="main">
          <Grid style={{ marginTop: 100 }} align="center">
            <img src={Logo} alt="Logo" />
          </Grid>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
}
