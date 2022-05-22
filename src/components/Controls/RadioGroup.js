import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
});

export default function RadioGroup(props) {
  const { name, label, value, onChange, items } = props;
  const classes = useStyles();

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <MuiRadioGroup
        row
        size="small"
        name={name}
        value={value}
        onChange={onChange}
      >
        {items.map((item) => (
          <FormControlLabel
            key={item.id}
            value={item.id}
            control={
              <Radio className={classes.root} disableRipple color="default" />
            }
            label={item.title}
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
}
