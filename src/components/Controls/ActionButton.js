import React from 'react';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 0,
    margin: theme.spacing(0.2),
    height: 25,
  },
  secondary: {
    backgroundColor: '#f5d3d3',
    '& .MuiButton-label': {
      color: theme.palette.secondary.main,
    },
  },
  primary: {
    backgroundColor: '#dbdbdb',
    '& .MuiButton-label': {
      color: theme.palette.primary.main,
    },
  },
}));

export default function ActionButton(props) {
  const { color, children, onClick } = props;
  const classes = useStyles();

  return (
    <Button className={`${classes.root} ${classes[color]}`} onClick={onClick}>
      {children}
    </Button>
  );
}
