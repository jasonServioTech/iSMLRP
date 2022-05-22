import React, { useState, useEffect } from 'react';
import { baseiSMLRP } from '../../api/Api';
import MaterialTable from 'material-table';
import '../../assets/styelesheets/App.css';

//Table header information
const headCells = [
  { field: 'fields.borrowerid', title: 'Borrower ID' },
  { field: 'fields.firstname', title: 'First Name' },
  { field: 'fields.middlename', title: 'Middle Name' },
  { field: 'fields.lastname', title: 'Last Name' },
  { field: 'fields.contactnumber', title: 'Contact Number' },
  { field: 'fields.address', title: 'Address' },
  { field: 'fields.company', title: 'Company' },
  { field: 'fields.companyaddress', title: 'Company Address' },
  { field: 'fields.membershipdate', title: 'Membership Date' },
  { field: 'fields.emailaddress', title: 'Email Address' },
  { field: 'fields.status', title: 'Status' },
  { field: 'fields.comments', title: 'Comments' },
];

export default function ReportBorrower() {
  const [borrower, setBorrower] = useState([]);

  const GetBorrowerCollection = async () => {
    let myRecords = [];
    useEffect(() => {
      baseiSMLRP('borrower')
        .select({ view: 'Borrower' })

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
              setBorrower(myRecords);
            }
          }
        );
    }, []);
  };

  GetBorrowerCollection();

  return (
    <div>
      <MaterialTable
        columns={headCells}
        data={borrower}
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
