import React, { useState } from 'react';
import Airtable from 'airtable';
import PageHeader from '../../components/Header/PageHeader';
import Controls from '../../components/Controls/Controls';
import TempTable from '../../components/Template/TempTable';
import Popup from '../../components/Popup/Popup';
import PopupDialog from '../../components/Popup/PopupDialog';
import BorrowerLookup from '../Borrower/BorrowerLookup';
import TransactionForm from './TransactionForm';
import AddIcon from '@material-ui/icons/Add';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined';
import OpenInBrowserOutlinedIcon from '@material-ui/icons/OpenInBrowserOutlined';
import ZoomInOutlinedIcon from '@material-ui/icons/ZoomInOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import CloseIcon from '@material-ui/icons/Close';
import { baseiSMLRP } from '../../api/Api';
import { Navbar } from '../../components/Navbar';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { Form } from '../../components/Template/TempForm';
import {
  ThemeProvider,
  Container,
  Grid,
  CssBaseline,
  Paper,
  Divider,
  makeStyles,
  withStyles,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Box,
  LinearProgress,
} from '@material-ui/core';
import * as transactionService from '../../services/TransactionServices';
import * as dateAddVal from '../../services/DateAddVal';

//Theme style alteration
const useStyles = makeStyles((theme) => ({
  pageContent: {
    padding: theme.spacing(1),
  },

  searchField: {
    width: '100',
  },

  searchInput: {
    width: '70%',
  },

  newButton: {
    top: '20px',
  },

  openButton: {
    position: 'absolute',
    top: '200px',
  },

  divider: {
    margin: theme.spacing(1),
    bakcground: '#000000',
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

//Define Header info
const headerData = {
  title: 'Transaction',
  subtitle: 'Transaction Information',
};

//Table header information
const headCells = [
  { id: 'action', label: ' ', disableSorting: true, minWidth: 30 },
  { id: 'transactiondate', label: 'Transaction Date', minWidth: 190 },
  { id: 'disbursementamount', label: 'Disbursement Amount', minWidth: 230 },
  { id: 'processingfee', label: 'Processing Fee', minWidth: 180 },
  { id: 'principalamount', label: 'Principal Amount', minWidth: 200 },
  { id: 'interestamount', label: 'Interest Amount', minWidth: 190 },
  { id: 'vat', label: 'VAT', minWidth: 150 },
  { id: 'penaltyamount', label: 'Penalty Amount', minWidth: 190 },
  { id: 'remarks', label: 'Remarks', minWidth: 190 },
  { id: 'action2', label: ' ', disableSorting: true, minWidth: 30 },
];

export default function Transaction() {
  //eslint-disable-next-line
  const { currentUser } = useAuth();
  const classes = useStyles();
  const [loanList, setLoanList] = useState();
  const [selectedID, setSelectedID] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loan, setLoan] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const [open, setOpen] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [enableDelete, setEnableDelete] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [openPopupForm, setOpenPopupForm] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [newRecord, setNewRecord] = useState(false);
  const [enableOpen, setEnableOpen] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [enable, setEnable] = useState(true);
  const disabled = true;
  const filterFn = {
    fn: (items) => {
      return items;
    },
  };
  const [totalDisbursementamount, setTotalDisbursementamount] = useState(0);
  const [totalProcessingfee, setTotalProcessingfee] = useState(0);
  const [totalPrincipalamount, setTotalPrincipalamount] = useState(0);
  const [totalInterestamount, setTotalInterestamount] = useState(0);
  const [totalVat, setTotalVat] = useState(0);
  const [totalPenaltyamount, setTotalPenaltyamount] = useState(0);

  //Get current user information and access
  const GetUserCollection = () => {
    let filter = "AND({userid} = '".concat(currentUser.email, "')");
    baseiSMLRP('user')
      .select({ view: 'Users', filterByFormula: filter })
      .eachPage((records, fetchNextPage) => {
        setEnableSave(records[0].fields['transactionsave']);
        setEnableUpdate(records[0].fields['transactionupdate']);
        setEnableDelete(records[0].fields['transactiondelete']);
        fetchNextPage();
      });
  };

  //Call function to load user information
  GetUserCollection();
  //Handle add and update event
  const addOrEdit = async (transData, resetForm) => {
    //setLoading(true);
    if (newRecord)
      await transactionService.insertTransaction(transData, currentUser.email);
    else
      await transactionService.updateTransaction(
        transData,
        currentUser.email,
        loan
      );
    await resetForm();
    await setRecordForEdit(null);
    await setOpenPopupForm(false);
    GetLoanCollection();
    setLoading(false);
  };

  //Handle open add/update form event
  const openInPopup = (item) => {
    setRecordForEdit(item);
    setOpenPopupForm(true);
  };

  //Handle Loan search event
  const handleLoanSearch = (e) => {
    setSelectedLoan(e.target.value);
    e.target.value ? setEnableOpen(false) : setEnableOpen(true);
  };

  //Handle popup dialog open event
  const handleClickBorrower = (item) => {
    setRecordForEdit(item);
    setOpenPopup(true);
  };

  //Handle popup dialog open event
  const handleClickOpen = (loanData) => {
    setSelectedID(loanData.id);
    setOpen(true);
  };

  //Handle popup dialog close event
  const handleClose = () => {
    setOpen(false);
  };

  //Handle delete event
  const handleDelete = () => {
    transactionService.deleteTransaction(selectedID);
    setOpen(false);
  };

  //Handle add and update event
  const lookupData = (loanData) => {
    if (loanData) {
      setSelectedBorrower(loanData.fields['borrowerid']);
      let lList = [];
      let filterText = "AND({borrowerid} = '"
        .concat(loanData.fields['borrowerid'])
        .concat("')");

      baseiSMLRP('loan')
        .select({
          view: 'Loans',
          filterByFormula: filterText,
        })
        .eachPage((records, fetchNextPage) => {
          for (let i = 0; i < records.length; i++) {
            if (records !== undefined) {
              lList.push({
                id: records[i].fields['loanid'],
                title: records[i].fields['loanid'],
                Name: records[i].fields['loanid'],
              });
            }
          }
          setLoanList(lList);
          fetchNextPage();
        });
      setRecordForEdit(null);

      setOpenPopup(false);
    }
  };

  //Get Transaction data from airtable
  const GetTransactionCollection = () => {
    if (selectedLoan) {
      let transDate = '';
      let transYear = '';
      let filter = "AND({loanid} = '".concat(selectedLoan, "')");
      baseiSMLRP('loan')
        .select({ view: 'Loans', filterByFormula: filter })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function (record) {
              transYear = record.get('transactionbase');
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
              return;
            } else {
              const transiSMLRP = new Airtable({
                apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
              }).base(transYear);

              filter = "AND({loanid} = '".concat(selectedLoan, "')");
              let lList = [];
              transiSMLRP('transaction')
                .select({ view: 'Transactions', filterByFormula: filter })
                .eachPage((records, fetchNextPage) => {
                  records.forEach(function (record) {
                    for (let i2 = 1; i2 <= 366; i2++) {
                      transDate = Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }).format(
                        dateAddVal.DateAddVal(
                          '01/01/'.concat(record.fields['year']),
                          i2 - 1,
                          'days'
                        )
                      );
                      if (record.fields['d'.concat(i2)]) {
                        if (
                          parseFloat(record.fields['d'.concat(i2)]) > 0 ||
                          record.fields['d'.concat(i2)] !== '~'
                        ) {
                          lList.push({
                            id: record.fields['loanid'].concat(
                              ',',
                              transDate,
                              ',',
                              transYear,
                              ',',
                              currentUser.email
                            ),
                            fields: {
                              transactionbase: record.fields['transactionbase'],
                              transactionnumber: record.id,
                              currentuser: currentUser.email,
                              transactiondate: transDate,
                              disbursementamount:
                                record.fields['transactiontype'] ===
                                'disbursementamount'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0,
                              processingfee:
                                record.fields['transactiontype'] ===
                                'processingfee'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0,
                              principalamount:
                                record.fields['transactiontype'] ===
                                'principalamount'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0,
                              interestamount:
                                record.fields['transactiontype'] ===
                                'interestamount'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0,
                              vat:
                                record.fields['transactiontype'] === 'vat'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0,
                              penaltyamount:
                                record.fields['transactiontype'] ===
                                'penaltyamount'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0,
                              remarks:
                                record.fields['transactiontype'] === 'remarks'
                                  ? record.fields['d'.concat(i2)]
                                  : ' ',
                            },
                          });
                        }
                      }
                    }
                  });

                  let result = [];
                  let exist = false;
                  let index = 0;
                  for (let i3 = 0; i3 < lList.length; i3++) {
                    exist = false;
                    if (i3 > 0 && result.length >= 0) {
                      for (let i4 = 0; i4 < result.length; i4++) {
                        if (
                          result[i4].fields['transactiondate'] ===
                          lList[i3].fields['transactiondate']
                        ) {
                          exist = true;
                          index = i4;
                          break;
                        }
                      }
                    }

                    if (!exist) {
                      result.push(lList[i3]);
                    } else {
                      result[index].fields['disbursementamount'] +=
                        lList[i3].fields['disbursementamount'];
                      result[index].fields['processingfee'] +=
                        lList[i3].fields['processingfee'];
                      result[index].fields['principalamount'] +=
                        lList[i3].fields['principalamount'];
                      result[index].fields['interestamount'] +=
                        lList[i3].fields['interestamount'];
                      result[index].fields['vat'] += lList[i3].fields['vat'];
                      result[index].fields['penaltyamount'] +=
                        lList[i3].fields['penaltyamount'];
                      result[index].fields['remarks'] =
                        lList[i3].fields['remarks'];
                    }
                  }

                  let totalDisbursementamount = result.reduce(function (
                    prev,
                    cur,
                  ) {
                    let totalAssign = 0;
                    let current = 0;
                    let cur_value = cur.fields['disbursementamount'];

                    if(isNaN(cur_value) === true){
                      cur_value = 0;
                    }
                    current = prev + cur_value;
                   
                    if(current !== 0 && isNaN(current) === false){
                      totalAssign += current;
                    }
                    return totalAssign;    
                  },
                  0);
                  
                  let totalProcessingfee = result.reduce(function (
                    prev,
                    cur,
                  ) {

                    let assignTotal = 0;
                    let current = 0;
                    let cur_value = cur.fields['processingfee'];

                    if(isNaN(cur_value) === true){
                      cur_value = 0;
                    }
                    current = prev + cur_value;
                   
                    if(current !== 0 && isNaN(current) === false){
                      assignTotal += current;
                    }
                    return assignTotal;
                  },
                  0);

                  let totalPrincipalamount = result.reduce(function (
                    prev,
                    cur,
                  ) {
                    let assignTotal = 0;
                    let current = 0;
                    let cur_value = cur.fields['principalamount'];

                    if(isNaN(cur_value) === true){
                      cur_value = 0;
                    }
                    current = prev + cur_value;
                   
                    if(current !== 0 && isNaN(current) === false){
                      assignTotal += current;
                    }
                    return assignTotal;
                  },
                  0);

                  let totalInterestamount = result.reduce(function (prev, cur) {
                    let assignTotal = 0;
                    let current = 0;
                    let cur_value = cur.fields['interestamount'];

                    if(isNaN(cur_value) === true){
                      cur_value = 0;
                    }
                    current = prev + cur_value;
                   
                    if(current !== 0 && isNaN(current) === false){
                      assignTotal += current;
                    }
                    return assignTotal;
                  }, 0);

                  let totalVat = result.reduce(function (prev, cur) {
                    let assignTotal = 0;
                    let current = 0;
                    let cur_value = cur.fields['vat'];

                    if(isNaN(cur_value) === true){
                      cur_value = 0;
                    }
                    current = prev + cur_value;
                   
                    if(current !== 0 && isNaN(current) === false){
                      assignTotal += current;
                    }
                    return assignTotal;
                  }, 0);
                  
                  let totalPenaltyamount = result.reduce(function (prev, cur) {
                    let assignTotal = 0;
                    let current = 0;
                    let cur_value = cur.fields['penaltyamount'];

                    if(isNaN(cur_value) === true){
                      cur_value = 0;
                    }
                    current = prev + cur_value;
                   
                    if(current !== 0 && isNaN(current) === false){
                      assignTotal += current;
                    }
                    return assignTotal;
                  }, 0);

                  setTotalDisbursementamount(totalDisbursementamount);
                  setTotalProcessingfee(totalProcessingfee);
                  setTotalPrincipalamount(totalPrincipalamount);
                  setTotalInterestamount(totalInterestamount);
                  setTotalVat(totalVat);
                  setTotalPenaltyamount(totalPenaltyamount);
                  setTransaction(result);
                  setLoading(false);
                  fetchNextPage();
                });
            }
          }
        );
    }
  };

  //Get Loan data from airtable
  const GetLoanCollection = async () => {
    if (selectedLoan) {
      setLoading(true);
      let filter = "AND({loanid} = '".concat(selectedLoan, "')");
      let lList = [];
      baseiSMLRP('loan')
        .select({ view: 'Loans', filterByFormula: filter })
        .eachPage((records, fetchNextPage) => {
          for (let i = 0; i < records.length; i++) {
            if (records !== undefined) {   

              lList.push(
                {
                id: records[i].id,
                loanid: records[i].fields['loanid'],
                borrowername: records[i].fields['borrowername'],
                approveddate: records[i].fields['approveddate'],
                maturitydate: records[i].fields['maturitydate'],
                payingperiod: records[i].fields['payingperiod'],
                loanamount: records[i].fields['loanamount'],
                payableamount: records[i].fields['payableamount'],
                monthlyinterestpayment:
                  records[i].fields['monthlyinterestpayment'],
                monthlyprincipalamount:
                  records[i].fields['monthlyprincipalamount'],
                monthlyvatpayment: records[i].fields['monthlyvatpayment'],
                principalamountbalance:
                  records[i].fields['principalamountbalance'],
                payablebalance: records[i].fields['payablebalance'],
                interestamountbalance:
                  records[i].fields['interestamountbalance'],
                guarantor: records[i].fields['guarantor'],
                guarantorfor: records[i].fields['guarantorfor'],
                paymentschedule: records[i].fields['paymentschedule'],
                paymentindays: records[i].fields['paymentindays'],
                status: records[i].fields['status'],
                transactionbase: records[i].fields['transactionbase'],
              });
            }
          }
          setLoan(lList[0]);
          lList.length > 0 ? setEnable(false) : setEnable(true);
          fetchNextPage();
        });
    }

    await GetTransactionCollection();
  };

  //Load Transaction Table
  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    TempTable(transaction, headCells, filterFn);

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Container maxWidth="lg" component="main">
          <Container maxWidth="lg">
            <PageHeader
              {...headerData}
              icon={<MonetizationOnOutlinedIcon fontSize="large" />}
            />
            <Paper className={classes.pageContent}>
              <TableContainer className={classes.tableContainer}>
                <Form variant="dense">
                  <Grid container spacing={1}>
                    <Grid item xs={3}>
                      <Controls.Input
                        label="Borrower ID "
                        value={selectedBorrower}
                        disabled={disabled}
                        className={classes.searchInput}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <Controls.Button
                        text="Browse"
                        variant="outlined"
                        className={classes.newButton}
                        startIcon={<ZoomInOutlinedIcon />}
                        onClick={() => {
                          handleClickBorrower();
                        }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Controls.Select
                        className={classes.searchField}
                        label="Loan Number"
                        name="loannumber"
                        options={loanList}
                        onChange={handleLoanSearch}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <Controls.Button
                        text="Open"
                        disabled={enableOpen}
                        variant="outlined"
                        className={classes.newButton}
                        startIcon={<OpenInBrowserOutlinedIcon />}
                        onClick={() => {
                          GetLoanCollection();
                          //GetTransactionCollection();
                        }}
                      />
                      <Controls.Button
                        text="Clear"
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
                        disabled={!enable ? !enableSave : true}
                        className={classes.newButton}
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setOpenPopupForm(true);
                          setRecordForEdit(loan);
                          setNewRecord(true);
                        }}
                      />
                    </Grid>
                    <Divider className={classes.divider} />
                    <Grid container>
                      <Grid container>
                        <Grid item xs={6}>
                          <Controls.Input
                            label="Borrower Name"
                            name="borrowername"
                            value={
                              loan
                                ? loan['borrowername']
                                  ? loan['borrowername']
                                  : ''
                                : ''
                            }
                            disabled={disabled}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controls.DatePicker
                            label="Date Granted"
                            name="approveddate"
                            value={loan ? loan['approveddate'] : new Date()}
                            disabled={disabled}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controls.DatePicker
                            label="Maturity Date"
                            name="maturitydate"
                            value={loan ? loan['maturitydate'] : new Date()}
                            disabled={disabled}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controls.Input
                            label="Payment Schedule"
                            name="paymentschedule"
                            value={
                              loan
                                ? loan['paymentschedule']
                                  ? loan['paymentschedule']
                                  : ''
                                : ''
                            }
                            disabled={disabled}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controls.Input
                            label="Payment in Days - Others"
                            name="paymentindays"
                            value={
                              loan
                                ? loan['paymentindays']
                                  ? loan['paymentindays']
                                  : ''
                                : ''
                            }
                            disabled={disabled}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controls.Input
                            label="Paying Period"
                            name="payingperiod"
                            value={
                              loan
                                ? loan['payingperiod']
                                  ? loan['payingperiod']
                                  : ''
                                : ''
                            }
                            disabled={disabled}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Controls.Input
                            label="Status"
                            name="status"
                            value={
                              loan ? (loan['status'] ? loan['status'] : '') : ''
                            }
                            disabled={disabled}
                          />
                        </Grid>
                        <Divider className={classes.divider} />
                        <Grid container>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Loan Amount"
                              name="loanamount"
                              value={
                                loan
                                  ? loan['loanamount']
                                    ? loan['loanamount'].toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'Php',
                                        }
                                      )
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Payable Amount"
                              name="payableamount"
                              value={
                                loan
                                  ? loan['payableamount']
                                    ? loan['payableamount'].toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'Php',
                                        }
                                      )
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Monthly Interest Payment"
                              name="monthlyinterestpayment"
                              value={
                                loan
                                  ? loan['monthlyinterestpayment']
                                    ? loan[
                                        'monthlyinterestpayment'
                                      ].toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Monthly Principal Amount"
                              name="monthlyprincipalamount"
                              value={
                                loan
                                  ? loan['monthlyprincipalamount']
                                    ? loan[
                                        'monthlyprincipalamount'
                                      ].toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                        </Grid>
                        <Grid container>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Principal Amount Balance"
                              name="principalamountbalance"
                              value={
                                loan
                                  ? loan['principalamountbalance']
                                    ? loan[
                                        'principalamountbalance'
                                      ].toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Payable Amount Balance"
                              name="payablebalance"
                              value={
                                loan
                                  ? loan['payablebalance']
                                    ? loan['payablebalance'].toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'Php',
                                        }
                                      )
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Payable Interest Balance"
                              name="interestamountbalance"
                              value={
                                loan
                                  ? loan['interestamountbalance']
                                    ? loan[
                                        'interestamountbalance'
                                      ].toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Monthly VAT Payment"
                              name="monthlyvatpayment"
                              value={
                                loan
                                  ? loan['monthlyvatpayment']
                                    ? loan['monthlyvatpayment'].toLocaleString(
                                        'en-US',
                                        {
                                          style: 'currency',
                                          currency: 'Php',
                                        }
                                      )
                                    : '0'.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'Php',
                                      })
                                  : '0'.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: 'Php',
                                    })
                              }
                              disabled={disabled}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Form>
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
                          <TableCell component="th" scope="row">
                            {Intl.DateTimeFormat('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            }).format(new Date(item.fields['transactiondate']))}
                          </TableCell>
                          <TableCell align="right">
                            {item.fields['disbursementamount']
                              ? parseFloat(
                                  item.fields['disbursementamount']
                                ).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })
                              : parseFloat('0').toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })}
                          </TableCell>
                          <TableCell align="right">
                            {item.fields['processingfee']
                              ? parseFloat(
                                  item.fields['processingfee']
                                ).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })
                              : parseFloat('0').toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })}
                          </TableCell>
                          <TableCell align="right">
                            {item.fields['principalamount']
                              ? parseFloat(
                                  item.fields['principalamount']
                                ).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })
                              : parseFloat('0').toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })}
                          </TableCell>
                          <TableCell align="right">
                            {item.fields['interestamount']
                              ? parseFloat(
                                  item.fields['interestamount']
                                ).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })
                              : parseFloat('0').toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })}
                          </TableCell>
                          <TableCell align="right">
                            {item.fields['vat']
                              ? parseFloat(item.fields['vat']).toLocaleString(
                                  'en-US',
                                  {
                                    style: 'currency',
                                    currency: 'Php',
                                  }
                                )
                              : parseFloat('0').toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })}
                          </TableCell>
                          <TableCell align="right">
                            {item.fields['penaltyamount']
                              ? parseFloat(
                                  item.fields['penaltyamount']
                                ).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })
                              : parseFloat('0').toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'Php',
                                })}
                          </TableCell>
                          <TableCell align="left">
                            {item.fields['remarks']
                              ? item.fields['remarks']
                              : ''}
                          </TableCell>
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
                      <StyledTableRow>
                        <TableCell></TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell align="right">
                          {parseFloat(totalDisbursementamount).toLocaleString(
                            'en-US',
                            {
                              style: 'currency',
                              currency: 'Php',
                            }
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {parseFloat(totalProcessingfee).toLocaleString(
                            'en-US',
                            {
                              style: 'currency',
                              currency: 'Php',
                            }
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {parseFloat(totalPrincipalamount).toLocaleString(
                            'en-US',
                            {
                              style: 'currency',
                              currency: 'Php',
                            }
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {parseFloat(totalInterestamount).toLocaleString(
                            'en-US',
                            {
                              style: 'currency',
                              currency: 'Php',
                            }
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {parseFloat(totalVat).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'Php',
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {parseFloat(totalPenaltyamount).toLocaleString(
                            'en-US',
                            {
                              style: 'currency',
                              currency: 'Php',
                            }
                          )}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </StyledTableRow>
                    </TableBody>
                  </TblContainer>
                )}
                <TblPagination />
              </TableContainer>
            </Paper>
            <Popup
              title="Borrower List"
              openPopup={openPopup}
              setOpenPopup={setOpenPopup}
            >
              <BorrowerLookup
                recordForEdit={recordForEdit}
                lookupData={lookupData}
              />
            </Popup>
            <Popup
              title="Transaction Form"
              openPopup={openPopupForm}
              setOpenPopup={setOpenPopupForm}
            >
              <TransactionForm
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
          </Container>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
}
