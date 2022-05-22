import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@material-ui/core';
import Controls from '../Controls/Controls';

export default function PopupDialog(props) {
  const { title, children, open, handleClose, handleDelete } = props;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Controls.Button
          autoFocus
          onClick={handleClose}
          text="Cancel"
          variant="outlined"
          color="primary"
        />
        <Controls.Button onClick={handleDelete} text="Delete" color="primary" />
      </DialogActions>
    </Dialog>
  );
}
