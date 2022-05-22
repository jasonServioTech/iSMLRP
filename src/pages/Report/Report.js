import React, { useState } from 'react';
import { baseiSMLRP } from '../../api/Api';
import { Navbar } from '../../components/Navbar';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import Controls from '../../components/Controls/Controls';
import PageHeader from '../../components/Header/PageHeader';
import ReportBorrower from './ReportBorrower';
import ReportLoan from './ReportLoan';
import ReportLedger from './ReportLedger';
import ReportTransaction from './ReportTransaction';
import ReportTransactionAll from './ReportTransactionAll';
import ReportDisclosure from './ReportDisclosure';
import ReportAmortization from './ReportAmortization';
import ReportStatement from './StatementOfAccount';
import ReportPromisory from './ReportPromisory';
import ReportCR from './ReportCR';
import Popup from '../../components/Popup/Popup';
import * as reportServices from '../../services/ReportServices';
import ReceiptOutlinedIcon from '@material-ui/icons/ReceiptOutlined';
import AllInboxOutlinedIcon from '@material-ui/icons/AllInboxOutlined';
import {
  ThemeProvider,
  Container,
  Grid,
  CssBaseline,
  Paper,
  makeStyles,
} from '@material-ui/core';

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
    top: '14px',
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

const headerData = {
  title: 'Reports',
};

export default function Report() {
  //eslint-disable-next-line
  const { currentUser } = useAuth();
  const [selectedReport, setSelectedReport] = useState('borrower');
  const classes = useStyles();
  const [enableView, setEnableView] = useState(false);
  const [openBorrower, setOpenBorrower] = useState(false);
  const [openLoan, setOpenLoan] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openTransactionAll, setOpenTransactionAll] = useState(false);
  const [openLedger, setOpenLedger] = useState(false);
  const [openDisclosure, setOpenDisclosure] = useState(false);
  const [openAmortization, setOpenAmortization] = useState(false);
  const [openStatement, setOpenstatement] = useState(false);
  const [openPromisory, setOpenPromisory] = useState(false);
  const [openCR, setOpenCR] = useState(false);

  const GetUserCollection = () => {
    let filter = "AND({userid} = '".concat(currentUser.email, "')");
    baseiSMLRP('user')
      .select({ view: 'Users', filterByFormula: filter })
      .eachPage((records, fetchNextPage) => {
        setEnableView(records[0].fields['reportview']);
        fetchNextPage();
      });
  };

  GetUserCollection();

  const GenerateReport = () => {
    switch (selectedReport) {
      case 'loan':
        setOpenLoan(true);
        break;
      case 'transactionall':
        setOpenTransactionAll(true);
        break;
      case 'transaction':
        setOpenTransaction(true);
        break;
      case 'ledger':
        setOpenLedger(true);
        break;
      case 'disclosure':
        setOpenDisclosure(true);
        break;
      case 'amortization':
        setOpenAmortization(true);
        break;
      case 'statement':
        setOpenstatement(true);
        break;
      case 'promisory':
        setOpenPromisory(true);
        break;
      case 'cash':
        setOpenCR(true);
        break;
      default:
        setOpenBorrower(true);
    }
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
                icon={<ReceiptOutlinedIcon fontSize="large" />}
              />
              <Paper className={classes.pageContent}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Controls.Select
                      className={classes.searchField}
                      value={selectedReport}
                      label="Report"
                      name="report"
                      disabled={!enableView}
                      options={reportServices.getReportCollection()}
                      onChange={(e) => {
                        setSelectedReport(e.target.value);
                      }}
                    />{' '}
                    <Controls.Button
                      text="Generate"
                      variant="outlined"
                      className={classes.newButton}
                      disabled={!enableView}
                      startIcon={<AllInboxOutlinedIcon />}
                      onClick={() => {
                        GenerateReport();
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              <Popup
                title="Borrower Summary Sheet"
                openPopup={openBorrower}
                setOpenPopup={setOpenBorrower}
              >
                <ReportBorrower />
              </Popup>
              <Popup
                title="Loan Summary Sheet"
                openPopup={openLoan}
                setOpenPopup={setOpenLoan}
              >
                <ReportLoan />
              </Popup>
              <Popup
                title="Transactions"
                openPopup={openTransactionAll}
                setOpenPopup={setOpenTransactionAll}
              >
                <ReportTransactionAll />
              </Popup>
              <Popup
                title="Transaction Sheet"
                openPopup={openTransaction}
                setOpenPopup={setOpenTransaction}
              >
                <ReportTransaction />
              </Popup>
              <Popup
                title="Borrower's Individual Ledger"
                openPopup={openLedger}
                setOpenPopup={setOpenLedger}
              >
                <ReportLedger />
              </Popup>
              <Popup
                title="Disclosure Sheet"
                openPopup={openDisclosure}
                setOpenPopup={setOpenDisclosure}
              >
                <ReportDisclosure />
              </Popup>
              <Popup
                title="Statement of Account"
                openPopup={openStatement}
                setOpenPopup={setOpenstatement}
              >
                <ReportStatement />
              </Popup>
              <Popup
                title="Amortization Table"
                openPopup={openAmortization}
                setOpenPopup={setOpenAmortization}
              >
                <ReportAmortization />
              </Popup>
              <Popup
                title="Promisory Note"
                openPopup={openPromisory}
                setOpenPopup={setOpenPromisory}
              >
                <ReportPromisory />
              </Popup>
              <Popup
                title="Cash Receipt"
                openPopup={openCR}
                setOpenPopup={setOpenCR}
              >
                <ReportCR />
              </Popup>
            </Container>
          </Grid>
        </Container>
      </ThemeProvider>
    </React.Fragment>
  );
}
