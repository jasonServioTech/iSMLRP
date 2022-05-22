import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  makeStyles,
  Typography,
  IconButton,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  dialogWrapper: {
    padding: theme.spacing(1),
    position: 'static',
    top: theme.spacing(15),
  },
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}));

export default function Popup(props) {
  const { title, children, openPopup, setOpenPopup } = props;
  const classes = useStyles();

  return (
    <Dialog
      open={openPopup}
      maxWidth="lg"
      classes={{ paper: classes.dialogWrapper }}
    >
      <DialogTitle className={classes.dialogTitle}>
        <div
          style={{
            display: 'flex',
            backgroundColor: '#256ce1',
            color: '#ffffff',
            paddingLeft: 20,
          }}
        >
          <Typography variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="h6" component="div" style={{ flexGrow: 1 }} />
          <div>
            <IconButton
              size="small"
              color="default"
              onClick={() => {
                setOpenPopup(false);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
