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
import * as dateAddVal from '../../services/DateAddVal'; 
import {
  Grid,
  makeStyles,
  Container,
  Paper,
  Box,
  LinearProgress,
} from '@material-ui/core';

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

export default function ReportAmortization() {
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
  const [userName, setUserName] = useState('');
  const [isLoading, setLoading] = useState(false);
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

  const GetTransactionCollection = async () => {
    if (loan)
      {
        let result = [];
        let sDate = loan.startdate;
        let iYear = new Date(sDate).getFullYear();
        let iMonth = new Date(sDate).getMonth();
        let dTotal = parseFloat(loan.loanamount)-parseFloat(loan.monthlyprincipalamount);
        for (let i = 0; i < parseInt(loan.payingperiod); i++) {
          result.push({
            id: i,
            fields: {
              year: iYear,
              month: new Date(sDate).toLocaleString('en-us',{month:'short'}).toUpperCase(),
              principalamount: parseFloat(loan.monthlyprincipalamount).toFixed(2),
              interestamount: parseFloat(loan.monthlyinterestpayment).toFixed(2),
              vat: parseFloat(loan.monthlyvatpayment).toFixed(2),
              totalpayable: parseFloat(loan.monthlyprincipalamount) + parseFloat(loan.monthlyinterestpayment) + parseFloat(loan.monthlyvatpayment),
              balancefinal: parseFloat(dTotal) <= 0 ? 0 : parseFloat(dTotal)
            }
          });
          dTotal = parseFloat(dTotal)-parseFloat(loan.monthlyprincipalamount);
          sDate = dateAddVal.DateAddVal(
            '01/01/'.concat(iYear),iMonth + 1,
            'month'
          );

          iYear = new Date(sDate).getFullYear();
          iMonth = new Date(sDate).getMonth();
        }
        setTransTemp(result);
        setLoading(false);
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
              <b>Amortization Schedule</b>
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
            <td width="10%" className="table-tr-box-center">
              Year
            </td>
            <td width="10%" className="table-tr-box-center">
              Month
            </td>
            <td width="15%" className="table-tr-box-center">
              Principal
            </td>
            <td width="15%" className="table-tr-box-center">
              Interest
            </td>
            <td width="15%" className="table-tr-box-center">
              VAT
            </td>
            <td width="15%" className="table-tr-box-center">
              Total Payment
            </td>
            <td width="20%" className="table-tr-box-center">
              Balance
            </td>
          </tr>
          {transTemp.map((item) => (
            <tr>
              <td width="10%" className="table-tr-box-center">
                {item.fields['year']}
              </td>
              <td width="10%" className="table-tr-box-center">
                {item.fields['month']}
              </td>
              <td width="15%" className="table-tr-box-center">
                {item.fields['principalamount']
                  ? item.fields['principalamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </td>
              <td width="15%" className="table-tr-box-center">
                {item.fields['interestamount']
                  ? item.fields['interestamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </td>
              <td width="15%" className="table-tr-box-center">
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
              <td width="20%" className="table-tr-box-center">
                {item.fields['balancefinal']
                  ? item.fields['balancefinal'].toLocaleString('en-US', {
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
