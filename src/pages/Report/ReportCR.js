import React, { useState } from 'react';
import '../../assets/styelesheets/Report.css';
import Controls from '../../components/Controls/Controls';
import Logo from '../../assets/Images/Logo_Bar.png';
import { useAuth } from '../../contexts/AuthContext';
import Pdf from 'react-to-pdf';
import { baseiSMLRP } from '../../api/Api';
import { Form } from '../../components/Template/TempForm';
import Popup from '../../components/Popup/Popup';
import BorrowerLookup from '../Borrower/BorrowerLookup';
import OpenInBrowserOutlinedIcon from '@material-ui/icons/OpenInBrowserOutlined';
import ZoomInOutlinedIcon from '@material-ui/icons/ZoomInOutlined';
import numberToWords from 'number-to-words';
import {
  Grid,
  makeStyles,
  Container,
  Paper,
  Box,
  LinearProgress,
} from '@material-ui/core';
import Airtable from 'airtable';
import * as dateAddVal from '../../services/DateAddVal';

const ref = React.createRef();

const useStyles = makeStyles((theme) => ({
  formWrapper: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  pageContent: {
    padding: theme.spacing(4),
  },

  searchField: {
    noWrap: true,
    width: '100',
  },

  searchInput: {
    width: '70%',
  },

  newButton: {
    top: '15px',
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

export default function ReportCR() {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const [loanList, setLoanList] = useState();
  const [transList, setTransList] = useState();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedTrans, setSelectedTrans] = useState(null);
  const [loan, setLoan] = useState([]);
  const [transTemp, setTransTemp] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [enableOpen, setEnableOpen] = useState(true);
  const [userName, setUserName] = useState('');
  const [isLoading, setLoading] = useState(false);
  const disabled = true;

  const handleLoanSearch = (e) => {
    setSelectedLoan(e.target.value);
    e.target.value ? setEnableOpen(false) : setEnableOpen(true);
  };

  const handleTransSearch = (e) => {
    setSelectedTrans(e.target.value);
    e.target.value ? setEnableOpen(false) : setEnableOpen(true);
  };

  //Handle popup dialog open event
  const handleClickBorrower = (item) => {
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

  const GetTransactionCollection = async () => {
    if (selectedLoan) {
      setLoading(true);
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
              loanAmount =
                record.get('loanamount') +
                record.get('monthlyinterestpayment') *
                  record.get('payingperiod');
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
              let dList = [];
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
                              ','
                            ),
                            fields: {
                              loanid: record.fields['loanid'],
                              transactionbase: record.fields['transactionbase'],
                              transactionnumber: record.id,
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
                              balancefinal: loanAmount,
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

                  let result2 = [];
                  let prevBal = 0;
                  for (let i5 = 0; i5 < result.length; i5++) {
                    result2.push(result[i5]);

                    if (i5 > 0) {
                      prevBal =
                        prevBal + result2[i5 - 1].fields['totalpayable'];
                    }
                    result2[i5].fields['totalpayable'] =
                      result2[i5].fields['principalamount'];

                    result2[i5].fields['balancefinal'] =
                      result2[i5].fields['balancefinal'] -
                      prevBal -
                      result[i5].fields['totalpayable'];
                  }

                  setTransTemp(result2);

                  for (let i5 = 0; i5 < result.length; i5++) {
                    dList.push({
                      id: result[i5].fields['transactiondate'],
                      title: result[i5].fields['transactiondate'],
                      Name: result[i5].fields['transactiondate'],
                    });
                  }

                  setTransList(dList);

                  setLoading(false);
                  fetchNextPage();
                });
            }
          }
        );
    }
  };

  const GetUserRecord = () => {
    let filter = "AND({userid} = '".concat(currentUser.email, "')");
    baseiSMLRP('user')
      .select({ view: 'Users', filterByFormula: filter })
      .eachPage((records, fetchNextPage) => {
        setUserName(records[0].fields['username']);
        fetchNextPage();
      });
  };

  GetUserRecord();

  const GetLoanCollection = async () => {
    if (selectedLoan) {
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
                startdate: records[i].fields['startdate'],
                maturitydate: records[i].fields['maturitydate'],
                interestrate: records[i].fields['interestrate'],
                loanamount: records[i].fields['loanamount'],
                monthlypaymentamount: records[i].fields['monthlypaymentamount'],
                principalamountbalance:
                  records[i].fields['principalamountbalance'],
              });
            }
          }
          setLoan(lList[0]);
          fetchNextPage();
        });
      await GetTransactionCollection();
    }
  };

  const GetSelectedTransaction = async () => {
    if (selectedTrans) {
      for (let i = 0; i < transTemp.length; i++) {
        if (
          Math.abs(
            new Date(transTemp[i].fields['transactiondate']) -
              new Date(selectedTrans) ===
              0
          )
        ) {
          setTransaction(transTemp[i].fields);
        }
      }
    }
  };

  return (
    <div className={classes.formWrapper}>
      <Container maxWidth="lg">
        <Paper className={classes.pageContent}>
          <Form>
            <Grid container>
              <Grid item xs={12}>
                {isLoading && (
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                    Loading...
                  </Box>
                )}
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={3}>
                <Controls.Input
                  label="Borrower ID "
                  value={selectedBorrower}
                  disabled={disabled}
                  className={classes.searchInput}
                />
              </Grid>
              <Grid item xs={2}>
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
                  name="loanid"
                  options={loanList}
                  onChange={handleLoanSearch}
                />
              </Grid>
              <Grid item xs={4}>
                <Controls.Button
                  text="Open"
                  disabled={enableOpen}
                  variant="outlined"
                  className={classes.newButton}
                  startIcon={<OpenInBrowserOutlinedIcon />}
                  onClick={() => {
                    GetLoanCollection();
                  }}
                />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={3}>
                <Controls.Select
                  className={classes.searchField}
                  label="Transaction Date"
                  name="transactiondate"
                  options={transList}
                  onChange={handleTransSearch}
                />
              </Grid>
              <Grid item xs={9}>
                <Controls.Button
                  text="Select"
                  disabled={enableOpen}
                  variant="outlined"
                  className={classes.newButton}
                  startIcon={<OpenInBrowserOutlinedIcon />}
                  onClick={() => {
                    GetSelectedTransaction();
                  }}
                />
                <Pdf targetRef={ref} filename="CashReceipt.pdf">
                  {({ toPdf }) => (
                    <Controls.Button
                      text="Print"
                      variant="outlined"
                      disabled={enableOpen}
                      className={classes.newButton}
                      onClick={toPdf}
                    />
                  )}
                </Pdf>
              </Grid>
            </Grid>
          </Form>
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
      <div
        className="Report"
        ref={ref}
        style={{
          padding: '10mm',
        }}
      >
        <table className="table-td-left">
          <tr>
            <td width="100%">
              <img src={Logo} alt="Logo" width={120} height={35} />
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-header">
          <tr>
            <td width="100%" className="table-tr-box-center">
              <b>Cash Receipt</b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%" className="table-tr-box-label">
              Loan Number:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>{loan['loanid']}</b>
            </td>
            <td width="20%" className="table-td-left">
              Time of Transaction:{' '}
            </td>
            <td width="20%"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Date:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>
                {Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(
                  transaction['transactiondate']
                    ? new Date(transaction['transactiondate'])
                    : new Date()
                )}
              </b>
            </td>
            <td width="20%" className="table-td-left">
              Cashier #:{' '}
            </td>
            <td width="20%"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Customer Name:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="40%" colSpan="2"></td>
          </tr>
          <tr>
            <td colSpan="4"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Amount:
            </td>
            <td width="51%" colSpan="3" className="table-tr-box-left-amount">
              <b>
                {numberToWords
                  .toWords(
                    (transaction['principalamount']
                      ? transaction['principalamount']
                      : 0) +
                      (transaction['interestamount']
                        ? transaction['interestamount']
                        : 0) +
                      (transaction['penaltyamount']
                        ? transaction['penaltyamount']
                        : 0)
                  )
                  .toUpperCase()}{' '}
                PESOS
              </b>
            </td>
            <td width="29%" className="table-tr-box-right-amount">
              <b>
                (
                {transaction
                  ? (
                      (transaction['principalamount']
                        ? transaction['principalamount']
                        : 0) +
                      (transaction['interestamount']
                        ? transaction['interestamount']
                        : 0) +
                      (transaction['penaltyamount']
                        ? transaction['penaltyamount']
                        : 0)
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
                )
              </b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td colSpan="2" className="table-tr-box-label">
              Payment Details
            </td>
            <td colspan="3" />
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Principal:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['principalamount']
                  ? transaction['principalamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Amount Due:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {(
                  (transaction['balancefinal']
                    ? transaction['balancefinal']
                    : 0) +
                  (transaction['principalamount']
                    ? transaction['principalamount']
                    : 0) +
                  (transaction['interestamount']
                    ? transaction['interestamount']
                    : 0)
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Interest:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['interestamount']
                  ? transaction['interestamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Amount Paid:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {(transaction['principalamount']
                  ? transaction['principalamount']
                  : 0
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Penalty:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['penaltyamount']
                  ? transaction['penaltyamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Balance:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['balancefinal']
                  ? transaction['balancefinal'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              VAT:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['vat']
                  ? transaction['vat'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="55%" colSpan="3" />
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
          <tr>
            <td width="20%">Certified Correct:</td>
            <td width="25%" className="table-tr-line">
              {loan['borrowername']}
            </td>
            <td width="10%"></td>
            <td width="20%">Received By: </td>
            <td width="25%" className="table-tr-line">
              {userName}
            </td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line"></td>
          </tr>
        </table>
        <br />
        <table className="table-td-header">
          <tr>
            <td width="100%" className="table-tr-box-center">
              <b>Cash Receipt</b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%" className="table-tr-box-label">
              Loan Number:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>{loan['loanid']}</b>
            </td>
            <td width="20%" className="table-td-left">
              Time of Transaction:{' '}
            </td>
            <td width="20%"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Date:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>
                {Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(
                  transaction['transactiondate']
                    ? new Date(transaction['transactiondate'])
                    : new Date()
                )}
              </b>
            </td>
            <td width="20%" className="table-td-left">
              Cashier #:{' '}
            </td>
            <td width="20%"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Customer Name:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="40%" colSpan="2"></td>
          </tr>
          <tr>
            <td colSpan="4"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Amount:
            </td>
            <td width="51%" colSpan="3" className="table-tr-box-left-amount">
              <b>
                {numberToWords
                  .toWords(
                    (transaction['principalamount']
                      ? transaction['principalamount']
                      : 0) +
                      (transaction['interestamount']
                        ? transaction['interestamount']
                        : 0) +
                      (transaction['penaltyamount']
                        ? transaction['penaltyamount']
                        : 0)
                  )
                  .toUpperCase()}{' '}
                PESOS
              </b>
            </td>
            <td width="29%" className="table-tr-box-right-amount">
              <b>
                (
                {transaction
                  ? (
                      (transaction['principalamount']
                        ? transaction['principalamount']
                        : 0) +
                      (transaction['interestamount']
                        ? transaction['interestamount']
                        : 0) +
                      (transaction['penaltyamount']
                        ? transaction['penaltyamount']
                        : 0)
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
                )
              </b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td colSpan="2" className="table-tr-box-label">
              Payment Details
            </td>
            <td colspan="3" />
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Principal:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['principalamount']
                  ? transaction['principalamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Amount Due:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {(
                  (transaction['balancefinal']
                    ? transaction['balancefinal']
                    : 0) +
                  (transaction['principalamount']
                    ? transaction['principalamount']
                    : 0) +
                  (transaction['interestamount']
                    ? transaction['interestamount']
                    : 0)
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Interest:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['interestamount']
                  ? transaction['interestamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Amount Paid:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {(
                  (transaction['principalamount']
                    ? transaction['principalamount']
                    : 0) +
                  (transaction['interestamount']
                    ? transaction['interestamount']
                    : 0) +
                  (transaction['penaltyamount']
                    ? transaction['penaltyamount']
                    : 0)
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Penalty:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['penaltyamount']
                  ? transaction['penaltyamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Balance:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['balancefinal']
                  ? transaction['balancefinal'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              VAT:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['vat']
                  ? transaction['vat'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="55%" colSpan="3" />
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
          <tr>
            <td width="20%">Certified Correct:</td>
            <td width="25%" className="table-tr-line">
              {loan['borrowername']}
            </td>
            <td width="10%"></td>
            <td width="20%">Received By: </td>
            <td width="25%" className="table-tr-line">
              {userName}
            </td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line"></td>
          </tr>
        </table>
        <br />
        <table className="table-td-header">
          <tr>
            <td width="100%" className="table-tr-box-center">
              <b>Cash Receipt</b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%" className="table-tr-box-label">
              Loan Number:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>{loan['loanid']}</b>
            </td>
            <td width="20%" className="table-td-left">
              Time of Transaction:{' '}
            </td>
            <td width="20%"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Date:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>
                {Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(
                  transaction['transactiondate']
                    ? new Date(transaction['transactiondate'])
                    : new Date()
                )}
              </b>
            </td>
            <td width="20%" className="table-td-left">
              Cashier #:{' '}
            </td>
            <td width="20%"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Customer Name:
            </td>
            <td width="40%" className="table-tr-box-label">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="40%" colSpan="2"></td>
          </tr>
          <tr>
            <td colSpan="4"></td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Amount:
            </td>
            <td width="51%" colSpan="3" className="table-tr-box-left-amount">
              <b>
                {numberToWords
                  .toWords(
                    (transaction['principalamount']
                      ? transaction['principalamount']
                      : 0) +
                      (transaction['interestamount']
                        ? transaction['interestamount']
                        : 0) +
                      (transaction['penaltyamount']
                        ? transaction['penaltyamount']
                        : 0)
                  )
                  .toUpperCase()}{' '}
                PESOS
              </b>
            </td>
            <td width="29%" className="table-tr-box-right-amount">
              <b>
                (
                {transaction
                  ? (
                      (transaction['principalamount']
                        ? transaction['principalamount']
                        : 0) +
                      (transaction['interestamount']
                        ? transaction['interestamount']
                        : 0) +
                      (transaction['penaltyamount']
                        ? transaction['penaltyamount']
                        : 0)
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
                )
              </b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td colSpan="2" className="table-tr-box-label">
              Payment Details
            </td>
            <td colspan="3" />
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Principal:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['principalamount']
                  ? transaction['principalamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Amount Due:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {(
                  (transaction['balancefinal']
                    ? transaction['balancefinal']
                    : 0) +
                  (transaction['principalamount']
                    ? transaction['principalamount']
                    : 0) +
                  (transaction['interestamount']
                    ? transaction['interestamount']
                    : 0)
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Interest:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['interestamount']
                  ? transaction['interestamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Amount Paid:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {(
                  (transaction['principalamount']
                    ? transaction['principalamount']
                    : 0) +
                  (transaction['interestamount']
                    ? transaction['interestamount']
                    : 0) +
                  (transaction['penaltyamount']
                    ? transaction['penaltyamount']
                    : 0)
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              Penalty:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['penaltyamount']
                  ? transaction['penaltyamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="10%"></td>
            <td width="20%" className="table-tr-box-label">
              Balance:{' '}
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['balancefinal']
                  ? transaction['balancefinal'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-tr-box-label">
              VAT:
            </td>
            <td width="25%" className="table-tr-box-amount">
              <b>
                {transaction['vat']
                  ? transaction['vat'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="55%" colSpan="3" />
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
          <tr>
            <td width="20%">Certified Correct:</td>
            <td width="25%" className="table-tr-line">
              {loan['borrowername']}
            </td>
            <td width="10%"></td>
            <td width="20%">Received By: </td>
            <td width="25%" className="table-tr-line">
              {userName}
            </td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line"></td>
          </tr>
        </table>
      </div>
    </div>
  );
}
