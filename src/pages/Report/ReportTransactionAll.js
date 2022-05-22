import React, { useState } from 'react';
import '../../assets/styelesheets/Report.css';
import Controls from '../../components/Controls/Controls';
import { baseiSMLRP } from '../../api/Api';
import Popup from '../../components/Popup/Popup';
import { Form } from '../../components/Template/TempForm';
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
  Divider,
} from '@material-ui/core';
import Airtable from 'airtable';
import * as dateAddVal from '../../services/DateAddVal';
import MaterialTable from 'material-table';

//Table header information
const headCells = [
  { field: 'fields.transactiondate', title: 'Transaction Date' },
  { field: 'fields.loanid', title: 'Loan Number' },
  {
    field: 'fields.disbursementamount',
    title: 'Disbursement Amount',
    type: 'currency',
    currencySetting: { currencyCode: 'Php' },
  },
  {
    field: 'fields.processingfee',
    title: 'Processing Fee',
    type: 'currency',
    currencySetting: { currencyCode: 'Php' },
  },
  {
    field: 'fields.principalamount',
    title: 'Principal Amount',
    type: 'currency',
    currencySetting: { currencyCode: 'Php' },
  },
  {
    field: 'fields.interestamount',
    title: 'Interest Amount',
    type: 'currency',
    currencySetting: { currencyCode: 'Php' },
  },
  {
    field: 'fields.penaltyamount',
    title: 'Penalty Amount',
    type: 'currency',
    currencySetting: { currencyCode: 'Php' },
  },
  {
    field: 'fields.vat',
    title: 'VAT',
    type: 'currency',
    currencySetting: { currencyCode: 'Php' },
  },
  { field: 'fields.remarks', title: 'Remarks' },
];

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

export default function ReportTransactionAll() {
  const classes = useStyles();
  const [loanList, setLoanList] = useState();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [transaction, setTransaction] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [enableOpen, setEnableOpen] = useState(true);
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

  const GetTransactionCollection = async () => {
    if (selectedLoan) {
      setLoading(true);
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
                          record.fields['d'.concat(i2)] !== ' '
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
                      result[index].fields['disbursementamount'] =
                        result[index].fields['disbursementamount'] > 0
                          ? result[index].fields['disbursementamount']
                          : lList[i3].fields['disbursementamount'];
                      result[index].fields['processingfee'] =
                        result[index].fields['processingfee'] > 0
                          ? result[index].fields['processingfee']
                          : lList[i3].fields['processingfee'];
                      result[index].fields['principalamount'] =
                        result[index].fields['principalamount'] > 0
                          ? result[index].fields['principalamount']
                          : lList[i3].fields['principalamount'];
                      result[index].fields['interestamount'] +=
                        result[index].fields['interestamount'] > 0
                          ? result[index].fields['interestamount']
                          : lList[i3].fields['interestamount'];
                      result[index].fields['vat'] =
                        result[index].fields['vat'] > 0
                          ? result[index].fields['vat']
                          : lList[i3].fields['vat'];
                      result[index].fields['penaltyamount'] =
                        result[index].fields['penaltyamount'] > 0
                          ? result[index].fields['penaltyamount']
                          : lList[i3].fields['penaltyamount'];
                      result[index].fields['remarks'] =
                        lList[i3].fields['remarks'];
                    }
                  }
                  setTransaction(result);
                  setLoading(false);
                  fetchNextPage();
                });
            }
          }
        );
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
                    GetTransactionCollection();
                  }}
                />
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
      <br />
      {isLoading && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          Loading...
        </Box>
      )}
      <div ref={ref}>
        <MaterialTable
          columns={headCells}
          data={transaction}
          options={{
            exportButton: true,
            sorting: true,
            searchFieldAlignment: 'right',
            searchAutoFocus: true,
            searchFieldVariant: 'standard',
            filtering: true,
            exportAllData: true,
            exportFileName: 'Transaction Sheet',
            rowStyle: (data, index) =>
              index % 2 === 0 ? { background: '#f5f5f5' } : null,
            headerStyle: { background: '#27ae61', color: '#fff' },
          }}
          title=""
        />
      </div>
    </div>
  );
}
