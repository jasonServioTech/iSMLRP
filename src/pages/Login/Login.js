import React, { useRef, useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
} from '@material-ui/core';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  //Login interface
  const paperStyle = {
    padding: 20,
    height: '70vh',
    width: 350,
    margin: '20px auto',
  };
  const avatarStyle = { backgroundColor: '#1bbd7e' };
  const btnstyle = { margin: '8px 0' };

  //Handle Submit
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      history.push('/');
    } catch {
      setError('Failed to log in');
    }

    setLoading(false);
  }

  return (
    <>
      <Grid>
        <Paper elevation={0} style={paperStyle}>
          <Grid align="center">
            <Avatar style={avatarStyle}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
          </Grid>

          {error && <Alert severity="error">{error}</Alert>}
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              inputRef={passwordRef}
            />
            <Button
              disabled={loading}
              color="primary"
              type="submit"
              fullWidth
              variant="contained"
              style={btnstyle}
            >
              Sign In
            </Button>
            <Typography>
              <Link to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </>
  );
}
