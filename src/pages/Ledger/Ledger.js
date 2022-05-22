import React, { useState } from 'react';
import Airtable from 'airtable';
import PageHeader from '../../components/Header/PageHeader';
import Controls from '../../components/Controls/Controls';
import TempTable from '../../components/Template/TempTable';
import Popup from '../../components/Popup/Popup';
import BorrowerLookup from '../Borrower/BorrowerLookup';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import OpenInBrowserOutlinedIcon from '@material-ui/icons/OpenInBrowserOutlined';
import LibraryBooksOutlinedIcon from '@material-ui/icons/LibraryBooksOutlined';
import ZoomInOutlinedIcon from '@material-ui/icons/ZoomInOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
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
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Box,
  LinearProgress,
  Collapse,
  TableHead,
} from '@material-ui/core';
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
  title: 'Ledger',
  subtitle: 'Ledger Information',
};

//Table header information
const headCells = [
  { id: 'action', label: ' ', disableSorting: true, minWidth: 30 },
  { id: 'year', label: 'Year', minWidth: 100 },
  { id: 'month', label: 'Month', minWidth: 100 },
  { id: 'principalamount', label: 'Principal Amount', minWidth: 120 },
  { id: 'interestamount', label: 'Interest Amount', minWidth: 120 },
  { id: 'penaltyamount', label: 'Penalty Amount', minWidth: 150 },
  { id: 'totalpayable', label: 'Total Payable', minWidth: 150 },
  { id: 'action2', label: ' ', disableSorting: true, minWidth: 30 },
];

//Populate table
function Row(props) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <StyledTableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            color="primary"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.fields['year']}</TableCell>
        <TableCell>{row.fields['month']}</TableCell>
        <TableCell align="right">
          {row.fields['principalamount']
            ? row.fields['principalamount'].toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })
            : '0'.toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })}
        </TableCell>
        <TableCell align="right">
          {row.fields['interestamount']
            ? row.fields['interestamount'].toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })
            : '0'.toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })}
        </TableCell>
        <TableCell align="right">
          {row.fields['penaltyamount']
            ? row.fields['penaltyamount'].toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })
            : '0'.toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })}
        </TableCell>
        <TableCell align="right">
          {row.fields['totalpayable']
            ? row.fields['totalpayable'].toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })
            : '0'.toLocaleString('en-US', {
                style: 'currency',
                currency: 'Php',
              })}
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            color="primary"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </StyledTableRow>
      <StyledTableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="100">Date</TableCell>
                    <TableCell width="130">Disb. Amount</TableCell>
                    <TableCell width="130">Processing Fee</TableCell>
                    <TableCell width="135">Principal Amount</TableCell>
                    <TableCell width="130">Interest Amount</TableCell>
                    <TableCell width="130">Penalty Amount</TableCell>
                    <TableCell width="120">VAT</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {row.fields['transactions']
                    ? row.fields['transactions'].map((transRow, index) => (
                        <TableRow key={transRow}>
                          <TableCell width="100" component="th" scope="row">
                            {transRow.transactiondate}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(
                              transRow.disbursementamount
                            ).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'Php',
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(transRow.processingfee).toLocaleString(
                              'en-US',
                              {
                                style: 'currency',
                                currency: 'Php',
                              }
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(
                              transRow.principalamount
                            ).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'Php',
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(transRow.interestamount).toLocaleString(
                              'en-US',
                              {
                                style: 'currency',
                                currency: 'Php',
                              }
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(transRow.penaltyamount).toLocaleString(
                              'en-US',
                              {
                                style: 'currency',
                                currency: 'Php',
                              }
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(transRow.vat).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'Php',
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    : ''}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </StyledTableRow>
    </React.Fragment>
  );
}

export default function Ledger() {
  //eslint-disable-next-line
  const { currentUser } = useAuth();
  const classes = useStyles();
  const [loanList, setLoanList] = useState();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loan, setLoan] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [enableOpen, setEnableOpen] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const disabled = true;
  const filterFn = {
    fn: (items) => {
      return items;
    },
  };

  const [totalPrincipalamount, setTotalPrincipalamount] = useState(0);
  const [totalInterestamount, setTotalInterestamount] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [totalPenalty, setTotalPenalty] = useState(0);

  //Handle search event
  const handleLoanSearch = (e) => {
    setSelectedLoan(e.target.value);
    e.target.value ? setEnableOpen(false) : setEnableOpen(true);
  };

  //Handle popup dialog open event
  const handleClickOpen = (item) => {
    setRecordForEdit(item);
    setOpenPopup(true);
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

  //Get Loan data from airtable
  const GetLoanCollection = () => {
    setLoading(true);
    let filter = "AND({loanid} = '".concat(selectedLoan, "')");
    let lList = [];
    baseiSMLRP('loan')
      .select({ view: 'Loans', filterByFormula: filter })
      .eachPage((records, fetchNextPage) => {
        for (let i = 0; i < records.length; i++) {
          if (records !== undefined) {
            lList.push({
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
              interestamountbalance: records[i].fields['interestamountbalance'],
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
        fetchNextPage();
      });
  };

  //Get Ledger data based from loan information
  const GetLedgerCollection = async () => {
    if (selectedLoan) {
      let transDate = '';
      let transYear = '';
      let loanAmount = 0;
      let filter = "AND({loanid} = '".concat(selectedLoan, "')");
      baseiSMLRP('loan')
        .select({ view: 'Loans', filterByFormula: filter })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function (record) {
              transYear = record.get('transactionbase');
              loanAmount = record.get('loanamount');
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
                          console.log(
                            parseFloat(record.fields['d'.concat(i2)])
                          );
                          lList.push({
                            id: record.id.concat('-', i2),
                            fields: {
                              transactiontype: record.fields['transactiontype'],
                              transactionnumber: record.id,
                              currentuser: currentUser.email,
                              transactiondate: transDate,
                              year: record.fields['year'],
                              month: dateAddVal
                                .GetMonthName(
                                  dateAddVal.DateAddVal(
                                    '01/01/'.concat(record.fields['year']),
                                    i2 - 1,
                                    'days'
                                  )
                                )
                                .substring(0, 3)
                                .toUpperCase(),
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
                              totalpayable:
                                (record.fields['transactiontype'] ===
                                'principalamount'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0) +
                                (record.fields['transactiontype'] ===
                                'interestamount'
                                  ? parseFloat(record.fields['d'.concat(i2)])
                                  : 0),
                              balancefinal: loanAmount,
                            },
                          });
                        }
                      }
                    }
                  });
                  console.log(lList);
                  ProcessMonthlyLedgerCollection(lList);
                  fetchNextPage();
                });
            }
          }
        );
    }
  };

  //Distribute the monthly transaction amount
  const ProcessMonthlyLedgerCollection = async (ledgerList) => {
    let result = [];
    let exist = false;
    let index = 0;
    for (let i3 = 0; i3 < ledgerList.length; i3++) {
      exist = false;
      if (i3 > 0 && result.length >= 0) {
        for (let i4 = 0; i4 < result.length; i4++) {
          if (
            result[i4].fields['transactiondate'] ===
            ledgerList[i3].fields['transactiondate']
          ) {
            exist = true;
            index = i4;
            break;
          }
        }
      }

      if (!exist) {
        result.push(ledgerList[i3]);
      } else {
        result[index].fields['disbursementamount'] +=
          ledgerList[i3].fields['disbursementamount'];
        result[index].fields['processingfee'] +=
          ledgerList[i3].fields['processingfee'];
        result[index].fields['principalamount'] +=
          ledgerList[i3].fields['principalamount'];
        result[index].fields['interestamount'] +=
          ledgerList[i3].fields['interestamount'];
        result[index].fields['vat'] += ledgerList[i3].fields['vat'];
        result[index].fields['penaltyamount'] +=
          ledgerList[i3].fields['penaltyamount'];
        result[index].fields['remarks'] = ledgerList[i3].fields['remarks'];
      }
    }

    let result2 = [];
    exist = false;
    index = 0;
    for (let i3 = 0; i3 < result.length; i3++) {
      exist = false;
      if (i3 > 0 && result2.length >= 0) {
        for (let i4 = 0; i4 < result2.length; i4++) {
          if (
            result2[i4].fields['month'].concat(result2[i4].fields['year']) ===
            result[i3].fields['month'].concat(result[i3].fields['year'])
          ) {
            exist = true;
            index = i4;
            break;
          }
        }
      }
      if (!exist) {
        result2.push({
          id: result[i3].id,
          fields: {
            transactiondate: result[i3].fields['transactiondate'],
            year: result[i3].fields['year'],
            month: result[i3].fields['month'],
            principalamount: result[i3].fields['principalamount'],
            interestamount: result[i3].fields['interestamount'],
            penaltyamount: result[i3].fields['penaltyamount'],
            totalpayable: result[i3].fields['totalpayable'],
            balancefinal: result[i3].fields['balancefinal'],
          },
        });
      } else {
        result2[index].fields['principalamount'] =
          result2[index].fields['principalamount'] +
          result[i3].fields['principalamount'];
        result2[index].fields['interestamount'] =
          result2[index].fields['interestamount'] +
          result[i3].fields['interestamount'];
        result2[index].fields['penaltyamount'] =
          result2[index].fields['penaltyamount'] +
          result[i3].fields['penaltyamount'];
        result2[index].fields['totalpayable'] =
          result2[index].fields['totalpayable'] +
          result[i3].fields['totalpayable'];
      }
    }

    let result3 = [];
    let prevBal = 0;
    for (let i5 = 0; i5 < result2.length; i5++) {
      result3.push(result2[i5]);

      if (i5 > 0) {
        prevBal = prevBal + result3[i5 - 1].fields['totalpayable'];
      }
      result3[i5].fields['totalpayable'] =
        result3[i5].fields['principalamount']; //+
      //result2[i5].fields['interestamount'];

      result3[i5].fields['balancefinal'] =
        result3[i5].fields['balancefinal'] -
        prevBal -
        result2[i5].fields['totalpayable'];
    }

    let result4 = [];
    let result4details = [];
    for (let i6 = 0; i6 < result3.length; i6++) {
      result4details = [];
      for (let i7 = 0; i7 < result.length; i7++) {
        if (
          result3[i6].fields['month'].concat(result3[i6].fields['year']) ===
          result[i7].fields['month'].concat(result[i7].fields['year'])
        ) {
          result4details.push({
            transactiontype: result[i7].fields['transactiontype'],
            transactiondate: result[i7].fields['transactiondate'],
            principalamount: result[i7].fields['principalamount'],
            interestamount: result[i7].fields['interestamount'],
            disbursementamount: result[i7].fields['disbursementamount'],
            processingfee: result[i7].fields['processingfee'],
            vat: result[i7].fields['vat'],
            penaltyamount: result[i7].fields['penaltyamount'],
          });
        }
      }
      result4.push({
        id: result3[i6].id,
        fields: {
          transactiondate: result3[i6].fields['transactiondate'],
          year: result3[i6].fields['year'],
          month: result3[i6].fields['month'],
          principalamount: result3[i6].fields['principalamount'],
          interestamount: result3[i6].fields['interestamount'],
          penaltyamount: result3[i6].fields['penaltyamount'],
          totalpayable: result3[i6].fields['totalpayable'],
          balancefinal: result3[i6].fields['balancefinal'],
          transactions: result4details,
        },
      });
    }

    let totalPrincipalamount = result4.reduce(function (prev, cur) {
      return prev + cur.fields['principalamount'];
    }, 0);
    let totalInterestamount = result4.reduce(function (prev, cur) {
      return prev + cur.fields['interestamount'];
    }, 0);
    let totalPenalty = result4.reduce(function (prev, cur) {
      return prev + cur.fields['penaltyamount'];
    }, 0);
    let totalPayable = result4.reduce(function (prev, cur) {
      return prev + cur.fields['totalpayable'];
    }, 0);

    setTotalPrincipalamount(totalPrincipalamount);
    setTotalInterestamount(totalInterestamount);
    setTotalPenalty(totalPenalty);
    setTotalPayable(totalPayable);

    setLedger(result4);
    setLoading(false);
  };

  //Load Ledger Table
  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    TempTable(ledger, headCells, filterFn);

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
                icon={<LibraryBooksOutlinedIcon fontSize="large" />}
              />
              <Paper className={classes.pageContent}>
                <TableContainer className={classes.tableContainer}>
                  <Form>
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
                            handleClickOpen();
                          }}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <Controls.Select
                          className={classes.searchField}
                          label="Loan Number"
                          name="loanid"
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
                            GetLedgerCollection();
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
                      </Grid>
                      <Divider className={classes.divider} />
                      <Grid container>
                        <Grid container>
                          <Grid item xs={6}>
                            <Controls.Input
                              label="Borrower Name"
                              name="borrowername"
                              value={
                                loan['borrowername'] ? loan['borrowername'] : ''
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.DatePicker
                              label="Date Granted"
                              name="approveddate"
                              value={loan['approveddate']}
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.DatePicker
                              label="Maturity Date"
                              name="maturitydate"
                              value={loan['maturitydate']}
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Payment Schedule"
                              name="paymentschedule"
                              value={
                                loan['paymentschedule']
                                  ? loan['paymentschedule']
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
                                loan['paymentindays']
                                  ? loan['paymentindays']
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
                                loan['payingperiod'] ? loan['payingperiod'] : ''
                              }
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Controls.Input
                              label="Status"
                              name="status"
                              value={loan['status'] ? loan['status'] : ''}
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
                                  loan['loanamount']
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
                                }
                                disabled={disabled}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Controls.Input
                                label="Payable Amount"
                                name="payableamount"
                                value={
                                  loan['payableamount']
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
                                }
                                disabled={disabled}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Controls.Input
                                label="Monthly Interest Payment"
                                name="monthlyinterestpayment"
                                value={
                                  loan['monthlyinterestpayment']
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
                                }
                                disabled={disabled}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Controls.Input
                                label="Monthly Principal Amount"
                                name="monthlyprincipalamount"
                                value={
                                  loan['monthlyprincipalamount']
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
                                  loan['principalamountbalance']
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
                                }
                                disabled={disabled}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Controls.Input
                                label="Payable Amount Balance"
                                name="payablebalance"
                                value={
                                  loan['payablebalance']
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
                                }
                                disabled={disabled}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Controls.Input
                                label="Payable Interest Balance"
                                name="interestamountbalance"
                                value={
                                  loan['interestamountbalance']
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
                                }
                                disabled={disabled}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Controls.Input
                                label="Monthly VAT Payment"
                                name="monthlyvatpayment"
                                value={
                                  loan['monthlyvatpayment']
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
                      <Table aria-label="collapsible table">
                        <TblHead />
                        <TableBody>
                          {recordsAfterPagingAndSorting().map((item) => (
                            <Row key={item.fields['ledgerid']} row={item} />
                          ))}
                        </TableBody>
                      </Table>
                    </TblContainer>
                  )}
                  <StyledTableRow>
                    <TableCell width={250} align="right">
                      Total Amount
                    </TableCell>
                    <TableCell width={290} align="right">
                      {parseFloat(totalPrincipalamount).toLocaleString(
                        'en-US',
                        {
                          style: 'currency',
                          currency: 'Php',
                        }
                      )}
                    </TableCell>
                    <TableCell width={215} align="right">
                      {parseFloat(totalInterestamount).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'Php',
                      })}
                    </TableCell>
                    <TableCell width={205} align="right">
                      {parseFloat(totalPenalty).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'Php',
                      })}
                    </TableCell>
                    <TableCell width={180} align="right">
                      {parseFloat(totalPayable).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'Php',
                      })}
                    </TableCell>
                    <TableCell width={75}></TableCell>
                  </StyledTableRow>
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
            </Container>
          </Grid>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
}
