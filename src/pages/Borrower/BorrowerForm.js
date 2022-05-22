import React, { useEffect } from 'react';
import Controls from '../../components/Controls/Controls';
import * as borrowerService from '../../services/BorrowerServices';
import { baseiSMLRP } from '../../api/Api';
import { TempForm, Form } from '../../components/Template/TempForm';
import { Grid, Divider, makeStyles } from '@material-ui/core';

//Theme style alteration
const useStyles = makeStyles((theme) => ({
  formWrapper: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
}));

//New record value
const initialFValues = {
  id: 0,
  borrowerid: '',
  lastname: '',
  firstname: '',
  middlename: '',
  contactnumber: '',
  address: '',
  company: '',
  companyaddress: '',
  membershipdate: new Date(),
  emailaddress: '',
  status: '',
  comments: '',
  newid: '',
  newnumber: '',
  counter: '',
};

export default function BorrowerForm(props) {
  const classes = useStyles();
  const { addOrEdit, recordForEdit, newRecord } = props;
  const disabled = true;
  const boolTrue = true;

  //Validate record on change
  const validate = (fieldValues = values) => {
    let temp = { ...errors };
    if ('lastname' in fieldValues)
      temp['lastname'] = fieldValues['lastname']
        ? ''
        : 'This field is required.';
    if ('emailaddress' in fieldValues)
      temp['emailaddress'] = /$^|.+@.+..+/.test(fieldValues['emailaddress'])
        ? ''
        : 'Email is not valid.';
    setErrors({
      ...temp,
    });

    if (fieldValues === values) {
      return Object.values(temp).every((x) => x === '');
    }
  };

  //Calculate record on change
  const calculate = (fieldValues = values) => {
    console.log(newRecord)
    values['newnumber'] = newRecord
      ? values['address'].includes('Puerto Princesa') ? (values['newnumber'].substring(0, 3).concat('M', values['newnumber'].substring(4,  values['newnumber'].length))) : values['newnumber']
      : values['borrowerid'];
    //values['borrowerid'] = newRecord
    //  ? values['newnumber']
    //  : values['borrowerid'];
  };

  //Handle submit button
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      addOrEdit(values, resetForm);
    }
  };

  //Refresh record on change
  useEffect(() => {
    if (recordForEdit != null)
      setValues({
        ...recordForEdit.fields,
        ...recordForEdit,
      });
    // eslint-disable-next-line
  }, [recordForEdit]);

  //Load Borrower Table
  const { values, setValues, errors, setErrors, handleInputChange, resetForm } =
    TempForm(initialFValues, true, validate, calculate);

  //Get Borrower next number
  const GetBorrowerNextNumber = () => {
    useEffect(() => {
      let filter = "AND({tablename} = 'Borrower')";
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
  GetBorrowerNextNumber();

  return (
    <div className={classes.formWrapper}>
      <Form onSubmit={handleSubmit}>
        <Grid container>
          <Grid item xs={8}>
            <Controls.Input
              name="borrowerid"
              label="Borrower ID"
              disabled={disabled}
              value={newRecord ? values['newnumber'] : values['borrowerid']}
            />
          </Grid>
          <Grid item xs={4}>
            <Controls.DatePicker
              name="membershipdate"
              label="Membership Date"
              onChange={handleInputChange}
              value={values['membershipdate']}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container>
          <Grid item xs={4}>
            <Controls.Input
              name="lastname"
              label="Last Name"
              value={values['lastname'] ? values['lastname'] : ''}
              onChange={handleInputChange}
              error={errors['lastname']}
            />
          </Grid>
          <Grid item xs={4}>
            <Controls.Input
              name="firstname"
              label="First Name"
              value={values['firstname'] ? values['firstname'] : ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={4}>
            <Controls.Input
              name="middlename"
              label="Middle Name"
              value={values['middlename'] ? values['middlename'] : ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={4}>
            <Controls.Input
              name="contactnumber"
              label="Contact Number"
              value={values['contactnumber'] ? values['contactnumber'] : ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={4}>
            <Controls.Input
              name="emailaddress"
              label="Email Address"
              value={values['emailaddress'] ? values['emailaddress'] : ''}
              onChange={handleInputChange}
              error={errors['emailaddress']}
            />
          </Grid>
          <Grid item xs={4}>
            <Controls.Select
              label="Status"
              name="status"
              onChange={handleInputChange}
              options={borrowerService.getstatusCollection()}
              value={newRecord ? 'New' : values['status']}
            />
          </Grid>
          <Grid item xs={12}>
            <Controls.Input
              name="address"
              label="Address"
              value={values['address'] ? values['address'] : ''}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider} />
        <Grid container>
          <Grid item xs={6}>
            <Controls.Input
              name="company"
              label="Company"
              value={values['company'] ? values['company'] : ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Controls.Input
              name="companyaddress"
              label="Company Address"
              value={values['companyaddress'] ? values['companyaddress'] : ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Controls.Input
              label="Comments"
              name="comments"
              value={values['comments'] ? values['comments'] : ''}
              onChange={handleInputChange}
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
    </div>
  );
}
