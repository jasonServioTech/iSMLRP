import React, { useRef, useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
} from '@material-ui/core';

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  //Login interface
  const paperStyle = {
    padding: 20,
    height: '70vh',
    width: 350,
    margin: '20px auto',
  };
  const btnstyle = { margin: '8px 0' };

  //Handle Submit
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox for further instructions.');
    } catch {
      setError('Failed to reset password.');
    }

    setLoading(false);
  }

  return (
    <>
      <Grid>
        <Paper elevation={0} style={paperStyle}>
          <Grid align="center">
            <Typography component="h1" variant="h5">
              Password Reset
            </Typography>
          </Grid>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              inputRef={emailRef}
              autoFocus
            />
            <Button
              disabled={loading}
              color="primary"
              type="submit"
              fullWidth
              variant="contained"
              style={btnstyle}
            >
              Reset Password
            </Button>
            <Typography>
              <Link to="/login">Login</Link>
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </>
  );
}
