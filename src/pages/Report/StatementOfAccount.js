import React, { useState } from 'react';
import '../../assets/styelesheets/Report.css';
import Logo from '../../assets/Images/Logo_Bar.png';
import { useAuth } from '../../contexts/AuthContext';
import Controls from '../../components/Controls/Controls';
import Pdf from 'react-to-pdf';
import { baseiSMLRP } from '../../api/Api';
import { Form } from '../../components/Template/TempForm';
import Popup from '../../components/Popup/Popup';
import BorrowerLookup from '../Borrower/BorrowerLookup';
import OpenInBrowserOutlinedIcon from '@material-ui/icons/OpenInBrowserOutlined';
import ZoomInOutlinedIcon from '@material-ui/icons/ZoomInOutlined';
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

export default function ReportStatement() {
  const { currentUser } = useAuth();
  const classes = useStyles();
  const [loanList, setLoanList] = useState();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loan, setLoan] = useState([]);
  const [transTemp, setTransTemp] = useState([]);
  const [borrower, setBorrower] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [enableOpen, setEnableOpen] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const disabled = true;

  const handleLoanSearch = (e) => {
    setSelectedLoan(e.target.value);
    e.target.value ? setEnableOpen(false) : setEnableOpen(true);
  };

  //Handle popup dialog open event
  const handleClickBorrower = (item) => {
    setRecordForEdit(item);
    setOpenPopup(true);
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
                  exist = false;
                  index = 0;
                  for (let i3 = 0; i3 < result.length; i3++) {
                    exist = false;
                    if (i3 > 0 && result2.length >= 0) {
                      for (let i4 = 0; i4 < result2.length; i4++) {
                        if (
                          result2[i4].fields['month'].concat(
                            result2[i4].fields['year']
                          ) ===
                          result[i3].fields['month'].concat(
                            result[i3].fields['year']
                          )
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
                      prevBal =
                        prevBal + result3[i5 - 1].fields['totalpayable'];
                    }
                    result3[i5].fields['totalpayable'] =
                      result3[i5].fields['principalamount'] +
                      result2[i5].fields['interestamount'];

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
                        result3[i6].fields['month'].concat(
                          result3[i6].fields['year']
                        ) ===
                        result[i7].fields['month'].concat(
                          result[i7].fields['year']
                        )
                      ) {
                        if (result[i7].fields['totalpayable'] > 0) {
                          result4details.push({
                            transactiontype:
                              result[i7].fields['transactiontype'],
                            transactiondate:
                              result[i7].fields['transactiondate'],
                            principalamount:
                              result[i7].fields['principalamount'],
                            interestamount: result[i7].fields['interestamount'],
                            disbursementamount:
                              result[i7].fields['disbursementamount'],
                            processingfee: result[i7].fields['processingfee'],
                            vat: result[i7].fields['vat'],
                            penaltyamount: result[i7].fields['penaltyamount'],
                          });
                        }
                      }
                    }

                    if (result3[i6].fields['totalpayable'] > 0) {
                      result4.push({
                        id: result3[i6].id,
                        fields: {
                          transactiondate:
                            result3[i6].fields['transactiondate'],
                          year: result3[i6].fields['year'],
                          month: result3[i6].fields['month'],
                          principalamount:
                            result3[i6].fields['principalamount'],
                          interestamount: result3[i6].fields['interestamount'],
                          penaltyamount: result3[i6].fields['penaltyamount'],
                          totalpayable: result3[i6].fields['totalpayable'],
                          balancefinal: result3[i6].fields['balancefinal'],
                          transactions: result4details,
                        },
                      });
                    }
                  }

                  setTransTemp(result4);

                  setLoading(false);
                  fetchNextPage();
                });
            }
          }
        );
    }
  };

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
                borrowerid: records[i].fields['borrowerid'],
                borrowername: records[i].fields['borrowername'],
                approveddate: records[i].fields['approveddate'],
                startdate: records[i].fields['startdate'],
                maturitydate: records[i].fields['maturitydate'],
                interestrate: records[i].fields['interestrate'],
                payingperiod: records[i].fields['payingperiod'],
                paymentindays: records[i].fields['paymentindays'],
                paymentschedule: records[i].fields['paymentschedule'],
                loanamount: records[i].fields['loanamount'],
                monthlyprincipalamount:
                  records[i].fields['monthlyprincipalamount'],
                monthlyinterestpayment:
                  records[i].fields['monthlyinterestpayment'],
                monthlyvatpayment: records[i].fields['monthlyvatpayment'],
                monthlypaymentamount: records[i].fields['monthlypaymentamount'],
              });
            }
          }
          setLoan(lList[0]);
          fetchNextPage();
        });
      await GetBorrowerCollection();
      await GetTransactionCollection();
    }
  };

  const GetBorrowerCollection = async () => {
    if (selectedLoan) {
      let filter = "AND({borrowerid} = '".concat(selectedBorrower, "')");
      let lList = [];
      baseiSMLRP('borrower')
        .select({ view: 'Borrower', filterByFormula: filter })
        .eachPage((records, fetchNextPage) => {
          for (let i = 0; i < records.length; i++) {
            if (records !== undefined) {
              lList.push({
                id: records[i].id,
                borrowerid: records[i].fields['borrowerid'],
                address: records[i].fields['address'],
                company: records[i].fields['company'],
                contactnumber: records[i].fields['contactnumber'],
                companyaddress: records[i].fields['companyaddress'],
              });
            }
          }
          setBorrower(lList[0]);
          fetchNextPage();
        });
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
                <Pdf targetRef={ref} filename="Amortization.pdf">
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
            <td width="100%">
              <b>Statement of Account</b>
            </td>
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%" className="table-td-left">
              Customer Name:
            </td>
            <td width="25%">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="10%" />
            <td width="20%">Loan Number:</td>
            <td width="25%">
              <b>{loan['loanid']}</b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-td-left">
              Customer Number:
            </td>
            <td width="25%">
              <b>{loan['borrowerid']}</b>
            </td>
            <td width="10%" />
            <td width="20%">Address:</td>
            <td width="25%" rowSpan="2">
              <b>{borrower['address']}</b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-td-left">
              Contact Number:
            </td>
            <td width="25%">
              <b>{borrower['contactnumber']}</b>
            </td>
            <td width="10%" />
            <td width="20%" />
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line" />
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%" className="table-td-left">
              Date Granted:
            </td>
            <td width="25%">
              <b>
                {Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(
                  loan['approveddate']
                    ? new Date(loan['approveddate'])
                    : new Date()
                )}
              </b>
            </td>
            <td width="10%" />
            <td width="20%">Principal Amount:</td>
            <td width="25%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? loan['loanamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-td-left">
              Maturity Date:
            </td>
            <td width="25%">
              <b>
                {Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(
                  loan['maturitydate']
                    ? new Date(loan['maturitydate'])
                    : new Date()
                )}
              </b>
            </td>
            <td width="10%" />
            <td width="20%">Interest Amount:</td>
            <td width="25%" className="table-tr-amount">
              <b>
                {(
                  loan['monthlyinterestpayment'] * loan['payingperiod']
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%" className="table-td-left">
              Paying Period:
            </td>
            <td width="25%">
              <b>
                {loan['paymentschedule']
                  ? loan['paymentschedule'] === 'Monthly'
                    ? String(loan['payingperiod']).concat(' Month(s)')
                    : loan['paymentschedule'] === 'Bi-Monthly'
                    ? String(loan['payingperiod']).concat(' Bi-Month(s)')
                    : loan['paymentindays'].concat(' Days')
                  : ''}
              </b>
            </td>
            <td width="10%" />
            <td width="20%">VAT Amount:</td>
            <td width="25%" className="table-tr-amount">
              <b>
                {(
                  loan['monthlyvatpayment'] * loan['payingperiod']
                ).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'Php',
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line" />
          </tr>
        </table>
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="30%" className="table-td-left">
              Monthly Principal Payment:
            </td>
            <td width="25%" className="table-tr-amount">
              <b>
                {loan['monthlyprincipalamount']
                  ? loan['monthlyprincipalamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="45%" />
          </tr>
          <tr>
            <td width="30%" className="table-td-left">
              Monthly Interest Payment:
            </td>
            <td width="25%" className="table-tr-amount">
              <b>
                {loan['monthlyinterestpayment']
                  ? loan['monthlyinterestpayment'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="45%" />
          </tr>
          <tr>
            <td width="30%" className="table-td-left">
              Monthly VAT Payment:
            </td>
            <td width="25%" className="table-tr-amount">
              <b>
                {loan['monthlyvatpayment']
                  ? loan['monthlyvatpayment'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="45%" />
          </tr>
          <tr>
            <td width="30%" className="table-td-left">
              Total Monthly Payment:
            </td>
            <td width="25%" className="table-tr-amount">
              <b>
                {loan['monthlypaymentamount']
                  ? loan['monthlypaymentamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="45%" />
          </tr>
          <tr>
            <td colSpan="3" />
          </tr>
          <tr>
            <td colSpan="3" className="table-tr-line" />
          </tr>
        </table>
        <br />
        <table className="table-td-center">
          <tr width="100%" className="table-tr-box-center">
            <td colSpan="7">Payments</td>
          </tr>
          <tr>
            <td width="13%" className="table-tr-box-center">
              Year
            </td>
            <td width="13%" className="table-tr-box-center">
              Month
            </td>
            <td width="13%" className="table-tr-box-center">
              Principal
            </td>
            <td width="13%" className="table-tr-box-center">
              Interest
            </td>
            <td width="13%" className="table-tr-box-center">
              Penalty
            </td>
            <td width="20%" className="table-tr-box-center">
              VAT
            </td>
            <td width="15%" className="table-tr-box-center">
              Total
            </td>
          </tr>
          {transTemp.map((item) => (
            <tr>
              <td width="13%" className="table-tr-box-center">
                {new Date(item.fields['transactiondate']).getFullYear()}
              </td>
              <td width="13%" className="table-tr-box-center">
                {dateAddVal
                  .GetMonthName(new Date(item.fields['transactiondate']))
                  .substring(0, 3)
                  .toUpperCase()}
              </td>
              <td width="13%" className="table-tr-box-center">
                {item.fields['principalamount']
                  ? item.fields['principalamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </td>
              <td width="13%" className="table-tr-box-center">
                {item.fields['interestamount']
                  ? item.fields['interestamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </td>
              <td width="13%" className="table-tr-box-center">
                {item.fields['penaltyamount']
                  ? item.fields['penaltyamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </td>
              <td width="20%" className="table-tr-box-center">
                {item.fields['vat']
                  ? item.fields['vat'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </td>
              <td width="15%" className="table-tr-box-center">
                {item.fields['totalpayable']
                  ? item.fields['totalpayable'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </td>
            </tr>
          ))}
        </table>
        <br />
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%">Released By:</td>
            <td width="25%"></td>
            <td width="10%"></td>
            <td width="20%">Received By: </td>
            <td width="25%"></td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td width="20%"></td>
            <td width="25%" className="table-tr-line">
              {userName}
            </td>
            <td width="10%"></td>
            <td width="20%"></td>
            <td width="25%" className="table-tr-line">
              {loan['borrowername']}
            </td>
          </tr>
          <tr>
            <td width="20%"></td>
            <td width="25%" className="table-td-center">
              iSMLRP Representative
            </td>
            <td width="10%"></td>
            <td width="20%"></td>
            <td width="25%" className="table-td-center">
              Borrower
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
}
