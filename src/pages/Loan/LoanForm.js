import React, { useState, useEffect } from 'react';
import Controls from '../../components/Controls/Controls';
import ZoomInOutlinedIcon from '@material-ui/icons/ZoomInOutlined';
import Popup from '../../components/Popup/Popup';
import BorrowerLookup from '../Borrower/BorrowerLookup';
import { baseiSMLRP } from '../../api/Api';
import { TempForm, Form } from '../../components/Template/TempForm';
import { Grid, Divider, makeStyles } from '@material-ui/core';
import * as loanServices from '../../services/LoanServices';
import * as dateAddVal from '../../services/DateAddVal';

//Theme style alteration
const useStyles = makeStyles((theme) => ({
  formWrapper: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  newButton: {
    top: '20px',
  },
}));

//New record value
const initialFValues = {
  id: 0,
  loanid: '',
  borrowerid: '',
  borrowername: '',
  approveddate: new Date(),
  loanamount: '',
  interestrate: '',
  payableamount: '',
  monthlyinterestpayment: '',
  monthlyprincipalamount: '',
  monthlyvatpayment: '',
  monthlypaymentamount: '',
  payingperiod: '',
  paymentschedule: '',
  paymentindays: '',
  startdate: new Date(),
  maturitydate: new Date(),
  nextduedate: new Date(),
  status: '',
  newloannumber: '',
  principalamountbalance: '',
  interestamountbalance: '',
  payablebalance: '',
  guarantor: '',
  guarantorfor: '',
  comments: '',
  newid: '',
  newnumber: '',
  counter: '',
};

export default function LoanForm(props) {
  const classes = useStyles();
  const { addOrEdit, recordForEdit, newRecord } = props;
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [selectedBorrowerName, setSelectedBorrowerName] = useState('');
  const [openPopup, setOpenPopup] = useState(false);
  const [recordForLookup, setRecordForLookup] = useState(null);
  const [conField, setConField] = useState(true);
  const disabled = true;
  const boolTrue = true;

  //Validate record on change
  const validate = (fieldValues = values) => {
    let temp = { ...errors };
    if ('borrowerid' in fieldValues)
      temp['borrowerid'] = fieldValues['borrowerid']
        ? ''
        : 'This field is required.';
    if ('loanamount' in fieldValues)
      temp['loanamount'] = fieldValues['loanamount']
        ? ''
        : 'This field is required.';
    if ('interestrate' in fieldValues)
      temp['interestrate'] = fieldValues['interestrate']
        ? ''
        : 'This field is required.';
    if ('paymentschedule' in fieldValues)
      temp['paymentschedule'] = fieldValues['paymentschedule']
        ? ''
        : 'This field is required.';
    if ('paymentschedule' in fieldValues)
      if (fieldValues['paymentschedule'] === 'Others') {
        if ('paymentindays' in fieldValues)
          temp['paymentindays'] = fieldValues['paymentindays']
            ? parseFloat(fieldValues['paymentindays']) > 0
              ? ''
              : 'This field should be greater than 0.'
            : 'This field is required.';
      } else temp['paymentindays'] = '';

    if ('payingperiod' in fieldValues)
      temp['payingperiod'] = fieldValues['payingperiod']
        ? ''
        : 'This field is required.';
    setErrors({
      ...temp,
    });
    if (fieldValues === values) {
      return Object.values(temp).every((x) => x === '');
    }
  };

  //Handle popup dialog open event
  const handleClickOpen = (item) => {
    setRecordForLookup(item);
    setOpenPopup(true);
  };

  //Handle add and update event
  const lookupData = (loanData) => {
    if (loanData) {
      setSelectedBorrower(loanData.fields['borrowerid']);
      setSelectedBorrowerName(loanData.fields['borrowername']);
      //values['newnumber'] = values['newnumber'].concat(
      //  loanData.fields['borrowerid']
      //);
      values['borrowerid'] = loanData.id;
      setOpenPopup(false);
    }
  };

  //Calculate record on change
  const calculate = (fieldValues = values) => {
    let loanAmount = parseFloat(
      fieldValues['loanamount']
        ? fieldValues['loanamount']
        : values['loanamount']
        ? values['loanamount']
        : 0
    );

    let interestRate = parseFloat(
      fieldValues['interestrate']
        ? fieldValues['interestrate']
        : values['interestrate']
        ? values['interestrate']
        : 0
    );

    let payingPeriod = parseFloat(
      fieldValues['payingperiod']
        ? fieldValues['payingperiod']
        : values['payingperiod']
        ? values['payingperiod']
        : 0
    );

    let pAmountBalance = parseFloat(
      fieldValues['principalamountbalance']
        ? fieldValues['principalamountbalance']
        : values['principalamountbalance']
        ? values['principalamountbalance']
        : 0
    );

    let iAmountBalance = parseFloat(
      fieldValues['interestamountbalance']
        ? fieldValues['interestamountbalance']
        : values['interestamountbalance']
        ? values['interestamountbalance']
        : 0
    );

    let paymentSchedule = fieldValues['paymentschedule']
      ? fieldValues['paymentschedule']
      : values['paymentschedule']
      ? values['paymentschedule']
      : '';

    let sDate = new Date(
      fieldValues['startdate']
        ? fieldValues['startdate']
        : values['startdate']
        ? values['startdate']
        : Date.now()
    );

    if (paymentSchedule === 'Others') {
      setConField(false);
    } else if (paymentSchedule === 'Monthly') {
      setConField(true);
      values['paymentindays'] = 0;
    } else if (paymentSchedule === 'Bi-Monthly') {
      setConField(true);
      values['paymentindays'] = 0;
    }

    values['nextduedate'] = sDate;

    if (newRecord) {
      values['loanid'] = values['newnumber'];
      pAmountBalance = loanAmount;
      iAmountBalance = loanAmount * (interestRate / 100) * payingPeriod;
      values['payableamount'] =
        loanAmount + loanAmount * (interestRate / 100) * payingPeriod;
      values['monthlyinterestpayment'] = loanAmount * (interestRate / 100);
      values['monthlyprincipalamount'] = loanAmount / payingPeriod;
      values['monthlyvatpayment'] = loanAmount * (interestRate / 100) * 0.12;
      values['monthlypaymentamount'] =
        loanAmount / payingPeriod + loanAmount * (interestRate / 100);
      values['principalamountbalance'] = pAmountBalance;
      values['interestamountbalance'] = iAmountBalance;
      values['payablebalance'] = pAmountBalance + iAmountBalance;
      values['maturitydate'] = dateAddVal.DateAddVal(
        sDate,
        payingPeriod - 1,
        'month'
      );
    }
  };

  //Handle submit button
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      addOrEdit(values, resetForm);
    }
  };

  //Get Loan nextnumber
  const GetLoanNextNumber = () => {
    useEffect(() => {
      let filter = "AND({tablename} = 'Loan')";
      baseiSMLRP('nextnumber')
        .select({ view: 'Next Number', filterByFormula: filter })
        .eachPage((records, fetchNextPage) => {
          if (newRecord)
            setValues({
              ...values,
              newid: records[0].id,
              newnumber: records[0].fields['newnumber'],
              counter: records[0].fields['counter'],
            });
          fetchNextPage();
        });
    }, []);
  };

  //Call function to retrieve next number
  GetLoanNextNumber();

  //Refresh record on change
  useEffect(() => {
    if (recordForEdit != null) {
      setValues({
        ...recordForEdit.fields,
        ...recordForEdit,
      });
    }
    // eslint-disable-next-line
  }, [recordForEdit]);

  //Load Loan Table
  const { values, setValues, errors, setErrors, handleInputChange, resetForm } =
    TempForm(initialFValues, true, validate, calculate);

  return (
    <div className={classes.formWrapper}>
      <Form onSubmit={handleSubmit}>
        <Grid container>
          <Grid item xs={8}>
            <Controls.Input
              name="loanid"
              label="Loan Number"
              value={newRecord ? values['newnumber'] : values['loanid']}
              disabled={disabled}
              error={errors['loanid']}
            />
          </Grid>
          <Grid item xs={4}>
            <Controls.DatePicker
              label="Approved Date"
              name="approveddate"
              disabled={!newRecord}
              onChange={handleInputChange}
              value={values['approveddate']}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container>
          <Grid item xs={3}>
            <Controls.Input
              label="Borrower ID "
              name="borrowerid"
              value={newRecord ? selectedBorrower : values['borrowerid']}
              disabled={disabled}
              className={classes.searchInput}
              error={errors['borrowerid']}
            />
          </Grid>
          <Grid item xs={2}>
            <Controls.Button
              text="Browse"
              variant="outlined"
              disabled={newRecord ? false : true}
              className={classes.newButton}
              startIcon={<ZoomInOutlinedIcon />}
              onClick={() => {
                handleClickOpen();
              }}
            />
          </Grid>
          <Grid item xs={7}>
            <Controls.Input
              label="Borrower Name"
              name="borrowername"
              disabled={disabled}
              value={
                selectedBorrowerName
                  ? selectedBorrowerName
                  : values['borrowername']
              }
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Loan Amount"
              name="loanamount"
              disabled={!newRecord}
              value={values['loanamount'] ? values['loanamount'] : ''}
              onChange={handleInputChange}
              error={errors['loanamount']}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Percentage
              label="Interest Rate"
              name="interestrate"
              disabled={!newRecord}
              value={
                !newRecord
                  ? values['interestrate'] * 100
                  : values['interestrate']
                  ? values['interestrate']
                  : ''
              }
              onChange={handleInputChange}
              error={errors['interestrate']}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Numeric
              label="Paying Period"
              name="payingperiod"
              disabled={!newRecord}
              value={values['payingperiod'] ? values['payingperiod'] : ''}
              onChange={handleInputChange}
              error={errors['payingperiod']}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Payable Amount"
              name="payableamount"
              disabled={disabled}
              value={values['payableamount'] ? values['payableamount'] : ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Select
              label="Payment Schedule"
              name="paymentschedule"
              disabled={!newRecord}
              value={values['paymentschedule'] ? values['paymentschedule'] : ''}
              options={loanServices.getPaySchedCollection()}
              onChange={handleInputChange}
              error={errors['paymentschedule']}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Numeric
              label="Payment In Days"
              name="paymentindays"
              disabled={!newRecord ? !newRecord : conField}
              value={values['paymentindays'] ? values['paymentindays'] : ''}
              onChange={handleInputChange}
              error={errors['paymentindays']}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Select
              label="Status"
              name="status"
              onChange={handleInputChange}
              options={loanServices.getstatusCollection()}
              value={newRecord ? 'New' : values['status']}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Input
              label="New Loan Number"
              name="newloannumber"
              onChange={handleInputChange}
              value={values['newloannumber'] ? values['newloannumber'] : ''}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Monthly Interest Payment"
              name="monthlyinterestpayment"
              disabled={disabled}
              value={
                values['monthlyinterestpayment']
                  ? values['monthlyinterestpayment']
                  : ''
              }
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Monthly Principal Amount"
              name="monthlyprincipalamount"
              disabled={disabled}
              value={
                values['monthlyprincipalamount']
                  ? values['monthlyprincipalamount']
                  : ''
              }
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Monthly VAT Payment"
              name="monthlyvatpayment"
              disabled={disabled}
              value={
                values['monthlyvatpayment'] ? values['monthlyvatpayment'] : ''
              }
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Monthly Payment Amount"
              name="monthlypaymentamount"
              disabled={disabled}
              value={
                values['monthlypaymentamount']
                  ? values['monthlypaymentamount']
                  : ''
              }
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.DatePicker
              label="Start Date"
              name="startdate"
              disabled={!newRecord}
              value={values['startdate']}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.DatePicker
              label="Maturity Date"
              name="maturitydate"
              disabled={disabled}
              value={values['maturitydate']}
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.DatePicker
              label="Next Due Date"
              name="nextduedate"
              onChange={handleInputChange}
              value={values['nextduedate']}
            />
          </Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Principal Amount Balance"
              name="principalamountbalance"
              disabled={disabled}
              value={
                values['principalamountbalance']
                  ? values['principalamountbalance']
                  : ''
              }
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Interest Amount Balance"
              name="interestamountbalance"
              disabled={disabled}
              value={
                values['interestamountbalance']
                  ? values['interestamountbalance']
                  : ''
              }
            />
          </Grid>
          <Grid item xs={3}>
            <Controls.Currency
              label="Payable Balance"
              name="payablebalance"
              disabled={disabled}
              value={values['payablebalance'] ? values['payablebalance'] : ''}
            />
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container>
          <Grid item xs={6}>
            <Controls.Input
              label="Guarantor"
              name="guarantor"
              disabled={!newRecord}
              onChange={handleInputChange}
              value={values['guarantor'] ? values['guarantor'] : ''}
            />
          </Grid>
          <Grid item xs={6}>
            <Controls.Input
              label="Guarantor For"
              name="guarantorfor"
              disabled={!newRecord}
              onChange={handleInputChange}
              value={values['guarantorfor'] ? values['guarantorfor'] : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <Controls.Input
              label="Comments"
              name="comments"
              onChange={handleInputChange}
              value={values['comments'] ? values['comments'] : ''}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container>
          <Grid item xs={12}>
            <Controls.Button
              type="submit"
              text="Submit"
              color="primary"
              fullWidth={boolTrue}
            />
          </Grid>
        </Grid>
      </Form>
      <Popup
        title="Borrower List"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <BorrowerLookup
          recordForEdit={recordForLookup}
          lookupData={lookupData}
        />
      </Popup>
    </div>
  );
}
