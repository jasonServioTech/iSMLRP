import React from 'react';
import { TextField } from '@material-ui/core';

export default function Input(props) {
  const fontColor = {
    style: { color: 'rgb(50, 50, 50)' },
  };

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
      variant="standard"
      label={label}
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      inputProps={fontColor}
      {...other}
      {...(error && { error: true, helperText: error })}
    />
  );
}
