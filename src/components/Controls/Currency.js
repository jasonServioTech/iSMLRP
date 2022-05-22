import React from 'react';
import { TextField } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';

export default function Currency(props) {
  const {
    name,
    label,
    value,
    disabled,
    error = null,
    onChange,
    ...other
  } = props;
  return (
    <TextField
      type={'number'}
      InputProps={{
        startAdornment: <InputAdornment position="start">Php</InputAdornment>,
      }}
      size="small"
      variant="standard"
      label={label}
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      {...other}
      {...(error && { error: true, helperText: error })}
    />
  );
}
