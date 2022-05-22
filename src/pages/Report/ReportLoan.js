import React, { useState, useEffect } from 'react';
import { baseiSMLRP } from '../../api/Api';
import MaterialTable from 'material-table';
import '../../assets/styelesheets/App.css';

//Table header information
const headCells = [
  { field: 'fields.loanid', title: 'Loan Number' },
  { field: 'fields.borrowerid', title: 'Borrower ID' },
  { field: 'fields.borrowername', title: 'Borrower Name' },
  { field: 'fields.approveddate', title: 'Approved Date' },
  { field: 'fields.loanamount', title: 'Loan Amount' },
  { field: 'fields.interestrate', title: 'Interest Rate' },
  { field: 'fields.payablesmount', title: 'Payable Amount' },
  {
    field: 'fields.monthlyinterestpayment',
    title: 'Monthly Interest Payment',
  },

  {
    field: 'fields.monthlyprincipalsmount',
    title: 'Monthly Principal Amount',
  },

  { field: 'fields.monthlyvatpayment', title: 'Monthly VAT Payment' },
  {
    field: 'fields.monthlypaymentamount',
    title: 'Monthly Payment Amount',
  },
  { field: 'fields.payingperiod', title: 'Paying Period' },
  { field: 'fields.paymentschedule', title: 'Payment Schedule' },
  { field: 'fields.startdate', title: 'Start Date' },
  { field: 'fields.maturitydate', title: 'Maturity Date' },
  { field: 'fields.nextduedate', title: 'Next Due Date' },
  { field: 'fields.status', title: 'Status' },
  { field: 'fields.newloannumber', title: 'New Loan Number' },
  {
    field: 'fields.principalamountbalance',
    title: 'fields.Principal Amount Balance',
  },
  {
    field: 'fields.interestamountbalance',
    title: 'fields.Interest Amount Balance',
  },
  { field: 'fields.payablebalance', title: 'Payable Balance' },
  { field: 'fields.guarantor', title: 'Guarantor' },
  { field: 'fields.guarantorfor', title: 'Guarantor For' },
  { field: 'fields.comments', title: 'Comments' },
];

export default function ReportLoan() {
  const [loan, setLoan] = useState([]);

  //Get Loan data from airtable
  const GetLoanCollection = () => {
    let myRecords = [];
    useEffect(() => {
      baseiSMLRP('loan')
        .select({ view: 'Loans' })
        .eachPage(
          (records, fetchNextPage) => {
            // eslint-disable-next-line
            myRecords = [...myRecords, ...records];
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              console.error(err);
              return;
            } else {
              setLoan(myRecords);
            }
          }
        );
    }, []);
  };

  GetLoanCollection();

  return (
    <div>
      <MaterialTable
        columns={headCells}
        data={loan}
        options={{
          exportButton: true,
          sorting: true,
          searchFieldAlignment: 'right',
          searchAutoFocus: true,
          searchFieldVariant: 'standard',
          filtering: true,
          exportAllData: true,
          exportFileName: 'Borrower List',
          rowStyle: (data, index) =>
            index % 2 === 0 ? { background: '#f5f5f5' } : null,
          headerStyle: { background: '#27ae61', color: '#fff' },
        }}
        title=""
      />
    </div>
  );
}
