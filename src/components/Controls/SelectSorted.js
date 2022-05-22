import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
} from '@material-ui/core';

export default function Select(props) {
  const fontColor = {
    style: { color: 'rgb(50, 50, 50)' },
  };

  const {
    name,
    label,
    value,
    error = null,
    onChange,
    disabled,
    options,
  } = props;

  return options !== undefined ? (
    <FormControl variant="standard" {...(error && { error: true })}>
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        label={label}
        name={name}
        size="small"
        value={value}
        inputProps={fontColor}
        disabled={disabled}
        onChange={onChange}
      >
        {options
          .sort((a, b) => (a.title > b.title ? 1 : -1))
          .map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.title}
            </MenuItem>
          ))}
      </MuiSelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  ) : (
    <FormControl variant="standard" {...(error && { error: true })}>
      <InputLabel>{label}</InputLabel>

      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
