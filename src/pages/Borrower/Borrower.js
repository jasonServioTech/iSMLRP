import React, { useState, useEffect } from 'react';
import { baseiSMLRP } from '../../api/Api';
import { Navbar } from '../../components/Navbar';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { Search } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import PageHeader from '../../components/Header/PageHeader';
import Controls from '../../components/Controls/Controls';
import TempTable from '../../components/Template/TempTable';
import Popup from '../../components/Popup/Popup';
import PopupDialog from '../../components/Popup/PopupDialog';
import BorrowerForm from './BorrowerForm';
import AddIcon from '@material-ui/icons/Add';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import CloseIcon from '@material-ui/icons/Close';
import PeopleOutlineTwoToneIcon from '@material-ui/icons/PeopleOutlineTwoTone';
import * as borrowerService from '../../services/BorrowerServices';
import {
  ThemeProvider,
  Container,
  Grid,
  CssBaseline,
  Paper,
  makeStyles,
  withStyles,
  TableBody,
  TableRow,
  TableCell,
  Toolbar,
  InputAdornment,
  TableContainer,
  IconButton,
  LinearProgress,
  Box,
  Dialog,
} from '@material-ui/core';

//Theme style alteration
const useStyles = makeStyles((theme) => ({
  pageContent: {
    padding: theme.spacing(2),
  },

  searchField: {
    position: 'absolute',
    left: '1px',
  },

  searchInput: {
    width: '75%',
  },

  tableRow: {
    '&$selected, &$selected:hover': {
      backgroundColor: '#e6f5ec',
    },
  },

  selected: {},

  status: {
    marginTop: '18px',
    fontSize: '0.75rem',
    backgroundColor: 'grey',
    borderRadius: 10,
    padding: '3px 10px',
    display: 'block',
  },
}));

//Alternate row color layout
const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },

    '&$selected, &$selected:hover': {
      backgroundColor: '#e6f5ec',
    },
  },

  selected: {},
}))(TableRow);

//Table header information
const headCells = [
  { id: 'actions', label: 'Actions', disableSorting: true, minWidth: 115 },
  { id: 'borrowerid', label: 'Borrower ID', minWidth: 160 },
  { id: 'borrowername', label: 'Borrower Name', minWidth: 200 },
  { id: 'contactnumber', label: 'Contact Number', minWidth: 200 },
  { id: 'address', label: 'Address', minWidth: 200 },
  { id: 'company', label: 'Company', minWidth: 200 },
  { id: 'companyaddress', label: 'Company Address', minWidth: 200 },
  { id: 'membershipdate', label: 'Membership Date', minWidth: 200 },
  { id: 'emailaddress', label: 'Email Address', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 120 },
  { id: 'comments', label: 'Comments', minWidth: 200 },
  { id: 'actions2', label: 'Actions', disableSorting: true, minWidth: 115 },
];

export default function Borrower() {
  //eslint-disable-next-line
  const { currentUser } = useAuth();
  const classes = useStyles();
  const [selectedID, setSelectedID] = useState(null);
  const [enableSave, setEnableSave] = useState(false);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [enableDelete, setEnableDelete] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alert, setAlert] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchField, setSearchField] = useState('borrowerid');
  const [borrower, setBorrower] = useState([]);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });

  //Handle search event
  const handleSearch = (e) => {
    let target = e.target;

    setFilterFn({
      fn: (items) => {
        if (target.value === '') return items;
        else
          return items.filter((x) =>
            x.fields[searchField]
              .toLowerCase()
              .includes(target.value.toLowerCase())
          );
      },
    });
  };

  //Handle popup dialog close event
  const handleClose = () => {
    setOpen(false);
  };

  //Handle delete event
  const handleDelete = async () => {
    await borrowerService.deleteBorrower(selectedID);
    await setOpen(false);
    await setAlert('Deleted successfully.');
    await handleOpenAlert(true);
  };

  //Handle popup dialog open event
  const handleClickOpen = (borrowerData) => {
    setSelectedID(borrowerData.id);
    setOpen(true);
  };

  //Handle add and update event
  const addOrEdit = async (borrowerData, resetForm) => {
    if (borrowerData.id === 0) {
      await borrowerService.insertBorrower(borrowerData, currentUser.email);
      await setAlert('Saved successfully.');
    } else {
      await borrowerService.updateBorrower(borrowerData, currentUser.email);
      await setAlert('Updated successfully.');
    }
    await resetForm();
    await setRecordForEdit(null);
    await setOpenPopup(false);
    await handleOpenAlert(true);
  };

  //Handle open add/update form event
  const openInPopup = (item) => {
    setRecordForEdit(item);
    setOpenPopup(true);
  };

  //Open alert message
  const handleOpenAlert = () => {
    setOpenAlert(true);
  };

  //Close alert message
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  
  //Get current user information and access
  const GetUserCollection = () => {
    let filter = "AND({userid} = '".concat(currentUser.email, "')");
    baseiSMLRP('user')
      .select({ view: 'Users', filterByFormula: filter })
      .eachPage((records, fetchNextPage) => {
        setEnableSave(records[0].fields['borrowersave']);
        setEnableUpdate(records[0].fields['borrowerupdate']);
        setEnableDelete(records[0].fields['borrowerdelete']);
        fetchNextPage();
      });
  };

  //Call function to load user information
  GetUserCollection();

  //Get Borrower data from airtable
  const GetBorrowerCollection = () => {
    let myRecords = [];
    useEffect(() => {
      baseiSMLRP('borrower')
        .select({ view: 'Borrower' })

        .eachPage(
          (records, fetchNextPage) => {
            // eslint-disable-next-line
            myRecords = [...myRecords, ...records];
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
              return;
            } else {
              setBorrower(myRecords);
              setLoading(false);
            }
          }
        );
    }, []);
  };

  //Call function to load list in the table
  GetBorrowerCollection();

  //Load Borrower Table
  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    TempTable(borrower, headCells, filterFn);

  //Define Header info
  const headerData = {
    title: 'Borrower',
    subtitle: 'Borrower Information',
  };

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Container maxWidth="lg" component="main">
          <Grid
            style={{ marginTop: 5 }}
            container
            spacing={2}
            alignItems="flex-end"
          >
            <Container maxWidth="lg">
              <PageHeader
                {...headerData}
                icon={<PeopleOutlineTwoToneIcon fontSize="large" />}
              />
              <Paper className={classes.pageContent}>
                <Dialog
                  open={openAlert}
                  onClose={handleCloseAlert}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setOpenAlert(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                  >
                    {alert}
                  </Alert>
                </Dialog>
                <TableContainer className={classes.tableContainer}>
                  <Toolbar variant="dense">
                    <Controls.Select
                      label=""
                      name="Search Field"
                      className={classes.searchField}
                      value={searchField}
                      options={borrowerService.getBorrowerSearch()}
                      onChange={(e) => {
                        setSearchField(e.target.value);
                      }}
                    />
                    <Controls.Input
                      label=" "
                      className={classes.searchInput}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      onChange={handleSearch}
                    />
                    <Controls.Button
                      text="Refresh"
                      variant="outlined"
                      className={classes.newButton}
                      startIcon={<AutorenewIcon />}
                      onClick={() => {
                        window.location.reload();
                      }}
                    />
                    <Controls.Button
                      text="New"
                      variant="outlined"
                      disabled={!enableSave}
                      className={classes.newButton}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setOpenPopup(true);
                        setRecordForEdit(null);
                        setNewRecord(true);
                      }}
                    />
                  </Toolbar>
                  {isLoading ? (
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress />
                      Loading...
                    </Box>
                  ) : (
                    <TblContainer>
                      <TblHead />
                      <TableBody>
                        {recordsAfterPagingAndSorting().map((item) => (
                          <StyledTableRow
                            key={item.id}
                            onClick={() => {
                              setSelectedID(item.id);
                            }}
                            selected={selectedID === item.id}
                            classes={{ selected: classes.selected }}
                            className={classes.tableRow}
                          >
                            <TableCell>
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={!enableUpdate}
                                onClick={() => {
                                  openInPopup(item);
                                  setNewRecord(false);
                                }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                disabled={!enableDelete}
                                onClick={() => {
                                  handleClickOpen(item);
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                            <TableCell
                              className={classes.status}
                              style={{
                                backgroundColor:
                                  (item.fields['status'] === 'New' &&
                                    '#74ed74') ||
                                  (item.fields['status'] === 'Completed' &&
                                    '#7998fc') ||
                                  (item.fields['status'] === 'Paying' &&
                                    '#f5de98') ||
                                  (item.fields['status'] === 'Overdue' &&
                                    '#f5c4cb'),
                              }}
                            >
                              {item.fields['borrowerid']}
                            </TableCell>
                            <TableCell>{item.fields['borrowername']}</TableCell>
                            <TableCell>
                              {item.fields['contactnumber']}
                            </TableCell>
                            <TableCell>{item.fields['address']}</TableCell>
                            <TableCell>{item.fields['company']}</TableCell>
                            <TableCell>
                              {item.fields['companyaddress']}
                            </TableCell>
                            <TableCell>
                              {Intl.DateTimeFormat('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              }).format(
                                new Date(item.fields['membershipdate'])
                              )}
                            </TableCell>
                            <TableCell>{item.fields['emailaddress']}</TableCell>
                            <TableCell
                              className={classes.status}
                              style={{
                                backgroundColor:
                                  (item.fields['status'] === 'New' &&
                                    '#74ed74') ||
                                  (item.fields['status'] === 'Completed' &&
                                    '#7998fc') ||
                                  (item.fields['status'] === 'Paying' &&
                                    '#f5de98') ||
                                  (item.fields['status'] === 'Overdue' &&
                                    '#f5c4cb'),
                              }}
                            >
                              {item.fields['status']}
                            </TableCell>
                            <TableCell>{item.fields['comments']}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={!enableUpdate}
                                onClick={() => {
                                  openInPopup(item);
                                  setNewRecord(false);
                                }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                disabled={!enableDelete}
                                onClick={() => {
                                  handleClickOpen(item);
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </TblContainer>
                  )}
                  <TblPagination />
                </TableContainer>
              </Paper>
              <Popup
                title="Borrower Form"
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
              >
                <BorrowerForm
                  recordForEdit={recordForEdit}
                  addOrEdit={addOrEdit}
                  newRecord={newRecord}
                />
              </Popup>
              <PopupDialog
                title="Delete Record"
                open={open}
                handleClose={handleClose}
                handleDelete={handleDelete}
              >
                Are you sure you want to delete this record?
              </PopupDialog>
              <Dialog
                open={openAlert}
                onClose={handleCloseAlert}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <Alert
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => {
                        setOpenAlert(false);
                      }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                  sx={{ mb: 2 }}
                >
                  {alert}
                </Alert>
              </Dialog>
            </Container>
          </Grid>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
}
