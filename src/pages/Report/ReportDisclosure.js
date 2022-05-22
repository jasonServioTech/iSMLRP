import React, { useState } from 'react';
import Pdf from 'react-to-pdf';
import Logo from '../../assets/Images/Logo_Bar.png';
import '../../assets/styelesheets/Report.css';
import Controls from '../../components/Controls/Controls';
import { baseiSMLRP } from '../../api/Api';
import Popup from '../../components/Popup/Popup';
import { Form } from '../../components/Template/TempForm';
import BorrowerLookup from '../Borrower/BorrowerLookup';
import OpenInBrowserOutlinedIcon from '@material-ui/icons/OpenInBrowserOutlined';
import ZoomInOutlinedIcon from '@material-ui/icons/ZoomInOutlined';
import { Grid, makeStyles, Container, Paper, Divider } from '@material-ui/core';

const ref = React.createRef();

const useStyles = makeStyles((theme) => ({
  formWrapper: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  pageContent: {
    padding: theme.spacing(1),
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

export default function ReportDisclosure() {
  const classes = useStyles();
  const [loanList, setLoanList] = useState();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loan, setLoan] = useState([]);
  const [borrower, setBorrower] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [enableOpen, setEnableOpen] = useState(true);
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
                payingperiod: records[i].fields['payingperiod'],
                startdate: records[i].fields['startdate'],
                maturitydate: records[i].fields['maturitydate'],
                interestrate: records[i].fields['interestrate'],
                loanamount: records[i].fields['loanamount'],
              });
            }
          }
          setLoan(lList[0]);
          fetchNextPage();
        });
      GetBorrowerCollection();
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
            <Grid container spacing={1}>
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
              <Grid item xs={3}>
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
                <Pdf targetRef={ref} filename="DisclosureSheet.pdf">
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
              <Divider className={classes.divider} />
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
        <br></br>
        <table className="table-td-header">
          <tr>
            <td width="100%">
              <b>Disclosure Statement and Acknowledgement Receipt</b>
            </td>
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%">Customer Number:</td>
            <td width="30%">
              <b>{borrower['borrowerid']}</b>
            </td>
            <td width="5%"></td>
            <td width="20%">Loan Amount: </td>
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
            <td width="20%">Customer Name:</td>
            <td width="30%">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="5%"></td>
            <td width="20%">Term Duration (Days): </td>
            <td width="25%">
              <b>
                {Math.ceil(
                  Math.abs(
                    new Date(loan['maturitydate']) - new Date(loan['startdate'])
                  ) /
                    (1000 * 60 * 60 * 24)
                )}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%">Loan Processing Fee:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (loan['loanamount'] * 0.01).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td width="20%">Insurance:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (
                      (loan['loanamount'] / 1000) *
                      6.14 *
                      ((loan['payingperiod'] * 30) / 366)
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td width="20%">VAT:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (loan['loanamount'] * 0.01 * 0.12).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
        </table>
        <table className="table-td-details2">
          <tr>
            <td width="20%">Net Proceeds of Loan:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (
                      loan['loanamount'] -
                      loan['loanamount'] * 0.01 -
                      (loan['loanamount'] / 1000) *
                        6.14 *
                        ((loan['payingperiod'] * 30) / 366) -
                      loan['loanamount'] * 0.01 * 0.12
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="5%"></td>
            <td width="15%">Received By: </td>
            <td width="30%">
              <b>{loan['borrowername']}</b>
            </td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line" />
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-header">
          <tr>
            <td width="100%">
              <b>Disclosure Statement and Acknowledgement Receipt</b>
            </td>
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%">Customer Number:</td>
            <td width="30%">
              <b>{borrower['borrowerid']}</b>
            </td>
            <td width="5%"></td>
            <td width="20%">Loan Amount: </td>
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
            <td width="20%">Customer Name:</td>
            <td width="30%">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="5%"></td>
            <td width="20%">Term Duration (Days): </td>
            <td width="25%">
              <b>
                {Math.ceil(
                  Math.abs(
                    new Date(loan['maturitydate']) - new Date(loan['startdate'])
                  ) /
                    (1000 * 60 * 60 * 24)
                )}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%">Loan Processing Fee:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (loan['loanamount'] * 0.01).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td width="20%">Insurance:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (
                      (loan['loanamount'] / 1000) *
                      6.14 *
                      ((loan['payingperiod'] * 30) / 366)
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td width="20%">VAT:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (loan['loanamount'] * 0.01 * 0.12).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
        </table>
        <table className="table-td-details2">
          <tr>
            <td width="20%">Net Proceeds of Loan:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (
                      loan['loanamount'] -
                      loan['loanamount'] * 0.01 -
                      (loan['loanamount'] / 1000) *
                        6.14 *
                        ((loan['payingperiod'] * 30) / 366) -
                      loan['loanamount'] * 0.01 * 0.12
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="5%"></td>
            <td width="15%">Received By: </td>
            <td width="30%">
              <b>{loan['borrowername']}</b>
            </td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line" />
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-header">
          <tr>
            <td width="100%">
              <b>Disclosure Statement and Acknowledgement Receipt</b>
            </td>
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-details2">
          <tr>
            <td width="20%">Customer Number:</td>
            <td width="30%">
              <b>{borrower['borrowerid']}</b>
            </td>
            <td width="5%"></td>
            <td width="20%">Loan Amount: </td>
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
            <td width="20%">Customer Name:</td>
            <td width="30%">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="5%"></td>
            <td width="20%">Term Duration (Days): </td>
            <td width="25%">
              <b>
                {Math.ceil(
                  Math.abs(
                    new Date(loan['maturitydate']) - new Date(loan['startdate'])
                  ) /
                    (1000 * 60 * 60 * 24)
                )}
              </b>
            </td>
          </tr>
          <tr>
            <td width="20%">Loan Processing Fee:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (loan['loanamount'] * 0.01).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td width="20%">Insurance:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (
                      (loan['loanamount'] / 1000) *
                      6.14 *
                      ((loan['payingperiod'] * 30) / 366)
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td width="20%">VAT:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (loan['loanamount'] * 0.01 * 0.12).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td colSpan="5"></td>
          </tr>
        </table>
        <table className="table-td-details2">
          <tr>
            <td width="20%">Net Proceeds of Loan:</td>
            <td width="30%" className="table-tr-amount">
              <b>
                {loan['loanamount']
                  ? (
                      loan['loanamount'] -
                      loan['loanamount'] * 0.01 -
                      (loan['loanamount'] / 1000) *
                        6.14 *
                        ((loan['payingperiod'] * 30) / 366) -
                      loan['loanamount'] * 0.01 * 0.12
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="5%"></td>
            <td width="15%">Received By: </td>
            <td width="30%">
              <b>{loan['borrowername']}</b>
            </td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" className="table-tr-line" />
          </tr>
        </table>
      </div>
    </div>
  );
}
