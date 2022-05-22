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
import numberToWords from 'number-to-words';
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
    top: '-15px',
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

export default function ReportPromisory() {
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
                approveddate: records[i].fields['approveddate'],
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
                <Pdf targetRef={ref} filename="PromisoryNote.pdf">
                  {({ toPdf }) => (
                    <Controls.Button
                      text="Print"
                      variant="outlined"
                      className={classes.newButton}
                      disabled={enableOpen}
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
              <b>NON-NEGOTIABLE PROMISSORY NOTE</b>
            </td>
          </tr>
          <tr>
            <td width="100%">
              <b>WITH DEED OF ASSIGNMENT</b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details">
          <tr>
            <td>PRINCIPAL BORROWER</td>
          </tr>
        </table>
        <br />
        <table>
          <tr>
            <td width="50%" className="table-td-left-nopad">
              Loan Amount:{' '}
              <b>
                {loan['loanamount']
                  ? loan['loanamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
              </b>
            </td>
            <td width="50%" className="table-td-right">
              Date:{' '}
              <b>
                {Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(new Date())}
              </b>
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details">
          <tr>
            <td width="50px" />
            <td width="170px">For the value received, I</td>
            <td className="table-tr-line">
              <b>{loan['borrowername']}</b>
            </td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td width="115px">an employee of</td>
            <td className="table-tr-line">
              <b>{borrower['company']}</b>
            </td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td width="115px">and resident of</td>
            <td className="table-tr-line">
              <b>{borrower['address']}</b>
            </td>
            <td width="120px">, promise to pay </td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td width="260px">
              <b>ISMLRP LENDING CORP</b> the sum of
            </td>
            <td className="table-tr-line">
              <b>
                {numberToWords
                  .toWords(
                    parseFloat(loan['loanamount'] ? loan['loanamount'] : 0)
                  )
                  .toUpperCase()}{' '}
                PESOS (
                {loan['loanamount']
                  ? loan['loanamount'].toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'Php',
                    })
                  : 0}
                )
              </b>
            </td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td width="80px">starting on</td>
            <td className="table-tr-line">
              <b>
                {Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }).format(
                  loan['startdate'] ? new Date(loan['startdate']) : new Date()
                )}{' '}
                -{' '}
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
            <td width="210px">with interest rate thereon of</td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td width="200px" className="table-tr-line">
              <b>
                {loan['interestrate']
                  ? numberToWords.toWords(
                      parseFloat(loan['interestrate'] * 100)
                    )
                  : ''}{' '}
                percent ({loan['interestrate'] * 100}%)
              </b>
            </td>
            <td>per month, subject to the following terms and conditions: </td>
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-details">
          <tr>
            <td width="720px" colSpan="3">
              1. For the payment of all installments or amounts due and
              demandable under this Promissory Note, I
            </td>
          </tr>
          <tr>
            <td width="270px">hereby assign my ATM Card Number</td>
            <td width="200px" className="table-tr-line"></td>
            <td width="250px">under Savings Account Number</td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td width="200px" className="table-tr-line"></td>
            <td>in</td>
            <td width="200px" className="table-tr-line"></td>
            <td width="320px">where my salaries and wages from my</td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td width="90px">employer, at</td>
            <td width="200px" className="table-tr-line"></td>
            <td width="430px">are being credited;</td>
          </tr>
        </table>
        <table className="table-td-details">
          <tr>
            <td />
          </tr>
          <tr>
            <td>
              2. Penalty of One Percent (1%) every 15 days or a total of Two
              Percent (2%) per month based on the principal amount will be
              applied in case payments are not made on the due dates.
            </td>
          </tr>
          <tr>
            <td />
          </tr>
          <tr>
            <td>
              3. Payments made for interests, penalties and processing fee are
              subject for 12% VAT;
            </td>
          </tr>
          <tr>
            <td />
          </tr>
          <tr>
            <td>
              4. Upon release and signing of this agreement, the borrower shall
              pay One Percent (1%) of the principal as processing fee and VAT;
            </td>
          </tr>
          <tr>
            <td />
          </tr>
          <tr>
            <td>
              5. In case of separation from my present employer and failure to
              continue my obligation, I agree that any amount due in this
              Promissory Note shall become due and demandable.
            </td>
          </tr>
        </table>
        <br />
        <table className="table-td-details">
          <tr>
            <td width="130px">I do hereby grant</td>
            <td width="200px" className="table-tr-line"></td>
            <td width="390px">
              ,the full power and authority to collect and receive
            </td>
          </tr>
          <tr>
            <td colSpan="3">
              and give acquittance for the same or any part thereof, in my name
              or otherwise.
            </td>
          </tr>
        </table>
        <br />
        <br />
        <table className="table-td-details">
          <tr>
            <td colSpan="5">Conforme:</td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td width="10%"></td>
            <td width="40%" className="table-tr-line">
              <b>{loan['borrowername']}</b>
            </td>
            <td width="10%"></td>
            <td width="30%" className="table-tr-line">
              <b>ISMLRP LENDING CORP</b>
            </td>
            <td width="10%"></td>
          </tr>
          <tr>
            <td width="10%"></td>
            <td width="40%" align="center">
              Signature Over Printed Name
            </td>
            <td width="50%" colSpan="3"></td>
          </tr>
        </table>
        <br />
        <table className="table-td-details">
          <tr>
            <td colSpan="5">Witnesses:</td>
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td colSpan="5" />
          </tr>
          <tr>
            <td width="10%"></td>
            <td width="40%" className="table-tr-line"></td>
            <td width="10%"></td>
            <td width="30%" className="table-tr-line"></td>
            <td width="10%"></td>
          </tr>
        </table>
      </div>
    </div>
  );
}
