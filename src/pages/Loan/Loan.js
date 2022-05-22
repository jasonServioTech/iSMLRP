import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/Header/PageHeader';
import Controls from '../../components/Controls/Controls';
import TempTable from '../../components/Template/TempTable';
import Popup from '../../components/Popup/Popup';
import PopupDialog from '../../components/Popup/PopupDialog';
import LoanForm from './LoanForm';
import AddIcon from '@material-ui/icons/Add';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import CloseIcon from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import { Search } from '@material-ui/icons';
import { baseiSMLRP } from '../../api/Api';
import { Navbar } from '../../components/Navbar';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
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
import * as loanService from '../../services/LoanServices';

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
  { id: 'loanid', label: 'Loan Number', minWidth: 170 },
  { id: 'borrowerid', label: 'Borrower ID', minWidth: 160 },
  { id: 'borrowername', label: 'Borrower Name', minWidth: 300 },
  { id: 'approveddate', label: 'Approved Date', minWidth: 180 },
  { id: 'loanamount', label: 'Loan Amount', minWidth: 180 },
  { id: 'interestrate', label: 'Interest Rate', minWidth: 160 },
  { id: 'payablesmount', label: 'Payable Amount', minWidth: 190 },
  {
    id: 'monthlyinterestpayment',
    label: 'Monthly Interest Payment',
    minWidth: 260,
  },
  {
    id: 'monthlyprincipalsmount',
    label: 'Monthly Principal Amount',
    minWidth: 260,
  },
  { id: 'monthlyvatpayment', label: 'Monthly VAT Payment', minWidth: 230 },
  {
    id: 'monthlypaymentamount',
    label: 'Monthly Payment Amount',
    minWidth: 260,
  },
  { id: 'payingperiod', label: 'Paying Period', minWidth: 200 },
  { id: 'paymentschedule', label: 'Payment Schedule', minWidth: 200 },
  { id: 'startdate', label: 'Start Date', minWidth: 150 },
  { id: 'maturitydate', label: 'Maturity Date', minWidth: 170 },
  { id: 'nextduedate', label: 'Next Due Date', minWidth: 180 },
  { id: 'status', label: 'Status', minWidth: 120 },
  { id: 'newloannumber', label: 'New Loan Number', minWidth: 200 },
  {
    id: 'principalamountbalance',
    label: 'Principal Amount Balance',
    minWidth: 260,
  },
  {
    id: 'interestamountbalance',
    label: 'Interest Amount Balance',
    minWidth: 250,
  },
  { id: 'payablebalance', label: 'Payable Balance', minWidth: 200 },
  { id: 'guarantor', label: 'Guarantor', minWidth: 200 },
  { id: 'guarantorfor', label: 'Guarantor For', minWidth: 200 },
  { id: 'comments', label: 'Comments', minWidth: 200 },
  { id: 'actions2', label: 'Actions', disableSorting: true, minWidth: 115 },
];

export default function Loan() {
  //eslint-disable-next-line
  const { currentUser } = useAuth();
  const classes = useStyles();
  const [selectedID, setSelectedID] = useState(null);
  const [searchField, setSearchField] = useState('loanid');
  const [loan, setLoan] = useState([]);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alert, setAlert] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [open, setOpen] = useState(false);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [enableDelete, setEnableDelete] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });

  //Handle search event
  const handleSearch = (e) => {
    let target = e.target;
    let search = searchField ? searchField : 'loanid';
    setFilterFn({
      fn: (items) => {
        if (target.value === '') return items;
        else {
          if (search === 'borrowerid') {
            return items.filter((x) =>
              x.fields['borrowerid'][0]
                .toLowerCase()
                .includes(target.value.toLowerCase())
            );
          } else if (search === 'borrowername') {
            return items.filter((x) =>
              x.fields['borrowername'][0]
                .toLowerCase()
                .includes(target.value.toLowerCase())
            );
          } else {
            return items.filter((x) =>
              x.fields[searchField]
                .toLowerCase()
                .includes(target.value.toLowerCase())
            );
          }
        }
      },
    });
  };

  //Handle popup dialog close event
  const handleClose = () => {
    setOpen(false);
  };

  //Handle delete event
  const handleDelete = () => {
    loanService.deleteLoans(selectedID);
    setOpen(false);
  };

  //Handle popup dialog open event
  const handleClickOpen = (loanData) => {
    setSelectedID(loanData.id);
    setOpen(true);
  };

  //Open alert message
  const handleOpenAlert = () => {
    setOpenAlert(true);
  };

  //Close alert message
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  //Handle add and update event
  const addOrEdit = async (loanData, resetForm) => {
    if (loanData.id === 0) {
      await loanService.insertLoans(loanData, currentUser.email);
      await setAlert('Saved successfully.');
    } else {
      await loanService.updateLoans(loanData, currentUser.email);
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

  //Get current user information and access
  const GetUserCollection = () => {
    let filter = "AND({userid} = '".concat(currentUser.email, "')");
    baseiSMLRP('user')
      .select({ view: 'Users', filterByFormula: filter })
      .eachPage((records, fetchNextPage) => {
        setEnableSave(records[0].fields['loansave']);
        setEnableUpdate(records[0].fields['loanupdate']);
        setEnableDelete(records[0].fields['loandelete']);
        fetchNextPage();
      });
  };

  //Call function to load user information
  GetUserCollection();

  //Get Loan data from airtable
  const GetLoanCollection = () => {
    let myRecords = [];
    useEffect(() => {
      baseiSMLRP('loan')
        .select({ view: 'Loans' })
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
              setLoan(myRecords);
              setLoading(false);
            }
          }
        );
    }, []);
  };

  //Call function to load list in the table
  GetLoanCollection();

  //Load Loan Table
  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    TempTable(loan, headCells, filterFn);

  //Define Header info
  const headerData = {
    title: 'Loans',
    subtitle: 'Loan Information',
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
                icon={<AccountBalanceWalletOutlinedIcon fontSize="large" />}
              />
              <Paper className={classes.pageContent}>
                <TableContainer className={classes.tableContainer}>
                  <Toolbar variant="dense">
                    <Controls.Select
                      label=""
                      name="Search Field"
                      className={classes.searchField}
                      value={searchField}
                      options={loanService.getLoanSearch()}
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
                                  (item.fields['status'] === 'Reamortization' &&
                                    '#74ed74') ||
                                  (item.fields['status'] === 'Completed' &&
                                    '#7998fc') ||
                                  (item.fields['status'] === 'Checked' &&
                                    '#f5de98') ||
                                  (item.fields['status'] === 'Uploaded' &&
                                    '#f5c4cb'),
                              }}
                            >
                              {item.fields['loanid']}
                            </TableCell>
                            <TableCell>{item.fields['borrowerid']}</TableCell>
                            <TableCell>{item.fields['borrowername']}</TableCell>
                            <TableCell>
                              {item.fields['approveddate']
                                ? Intl.DateTimeFormat('en-US').format(
                                    new Date(item.fields['approveddate'])
                                  )
                                : ''}
                            </TableCell>
                            <TableCell>
                              {item.fields['loanamount']
                                ? item.fields['loanamount'].toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'Php',
                                    }
                                  )
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['interestrate']
                                ? item.fields['interestrate'].toLocaleString(
                                    'en-US',
                                    {
                                      style: 'percent',
                                    }
                                  )
                                : '0'.toLocaleString('en-US', {
                                    style: 'percent',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['payableamount']
                                ? item.fields['payableamount'].toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'Php',
                                    }
                                  )
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['monthlyinterestpayment']
                                ? item.fields[
                                    'monthlyinterestpayment'
                                  ].toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['monthlyprincipalamount']
                                ? item.fields[
                                    'monthlyprincipalamount'
                                  ].toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['monthlyvatpayment']
                                ? item.fields[
                                    'monthlyvatpayment'
                                  ].toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['monthlypaymentamount']
                                ? item.fields[
                                    'monthlypaymentamount'
                                  ].toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>{item.fields['payingperiod']}</TableCell>
                            <TableCell>
                              {item.fields['paymentschedule']}
                            </TableCell>
                            <TableCell>
                              {item.fields['startdate']
                                ? Intl.DateTimeFormat('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  }).format(new Date(item.fields['startdate']))
                                : ''}
                            </TableCell>
                            <TableCell>
                              {item.fields['maturitydate']
                                ? Intl.DateTimeFormat('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  }).format(
                                    new Date(item.fields['maturitydate'])
                                  )
                                : ''}
                            </TableCell>
                            <TableCell>
                              {item.fields['nextduedate']
                                ? Intl.DateTimeFormat('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  }).format(
                                    new Date(item.fields['nextduedate'])
                                  )
                                : ''}
                            </TableCell>
                            <TableCell
                              className={classes.status}
                              style={{
                                backgroundColor:
                                  (item.fields['status'] === 'New' &&
                                    '#74ed74') ||
                                  (item.fields['status'] === 'Reamortization' &&
                                    '#74ed74') ||
                                  (item.fields['status'] === 'Completed' &&
                                    '#7998fc') ||
                                  (item.fields['status'] === 'Checked' &&
                                    '#f5de98') ||
                                  (item.fields['status'] === 'Uploaded' &&
                                    '#f5c4cb'),
                              }}
                            >
                              {item.fields['status']}
                            </TableCell>
                            <TableCell>
                              {item.fields['newloannumber']}
                            </TableCell>
                            <TableCell>
                              {item.fields['principalamountbalance']
                                ? item.fields[
                                    'principalamountbalance'
                                  ].toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['interestamountbalance']
                                ? item.fields[
                                    'interestamountbalance'
                                  ].toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>
                              {item.fields['payablebalance']
                                ? item.fields['payablebalance'].toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'Php',
                                    }
                                  )
                                : '0'.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'Php',
                                  })}
                            </TableCell>
                            <TableCell>{item.fields['guarantor']}</TableCell>
                            <TableCell>{item.fields['guarantorfor']}</TableCell>
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
                title="Loan Form"
                openPopup={openPopup}
                setOpenPopup={setOpenPopup}
              >
                <LoanForm
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
