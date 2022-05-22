import { baseiSMLRP } from '../api/Api';

//List status field criteria
export const getstatusCollection = () => [
  { id: 'New', title: 'New' },
  { id: 'Completed', title: 'Completed' },
  { id: 'Paying', title: 'Paying' },
  { id: 'Overdue', title: 'Overdue' },
];

//List search field criteria
export const getBorrowerSearch = () => [
  { id: 'borrowerid', title: 'Borrower ID' },
  { id: 'borrowername', title: 'Borrower Name' },
  { id: 'status', title: 'Status' },
];

//Create new Borrower record
export async function insertBorrower(data, currentuser) {
  let memDate = new Date(
    data['membershipdate'] === undefined || data['membershipdate'] === ''
      ? '1/1/1900'
      : data['membershipdate']
  );
  baseiSMLRP('borrower').create(
    [
      {
        fields: {
          borrowerid: data['borrowerid'],
          firstname: data['firstname'],
          middlename: data['middlename'],
          lastname: data['lastname'],
          contactnumber: data['contactnumber'],
          membershipdate: Intl.DateTimeFormat('en-US').format(memDate),
          emailaddress: data['emailaddress'],
          address: data['address'],
          company: data['company'],
          companyaddress: data['companyaddress'],
          status: 'New',
          comments: data['comments'],
          modifiedby: currentuser,
        },
      },
    ],
    function (err) {
      if (err) {
        console.error(err);
        return;
      }
    }
  );

  await updateNextID(data);
}

//Update Borrower record
export function updateBorrower(data, currentuser) {
  let memDate = new Date(
    data['membershipdate'] === undefined || data['membershipdate'] === ''
      ? '1/1/1900'
      : data['membershipdate']
  );
  baseiSMLRP('borrower').update(
    [
      {
        id: data.id,
        fields: {
          firstname: data['firstname'],
          middlename: data['middlename'],
          lastname: data['lastname'],
          contactnumber: data['contactnumber'],
          address: data['address'],
          company: data['company'],
          companyaddress: data['companyaddress'],
          membershipdate: Intl.DateTimeFormat('en-US').format(memDate),
          emailaddress: data['emailaddress'],
          status: data['status'],
          comments: data['comments'],
          modifiedby: currentuser,
        },
      },
    ],
    function (err) {
      if (err) {
        console.error(err);
        return;
      } else {
        window.location.reload();
      }
    }
  );
}

//Delete Borrower record
export function deleteBorrower(borrowerId) {
  baseiSMLRP('borrower').destroy(borrowerId, function (err) {
    if (err) {
      console.error(err);
      return;
    } else {
      window.location.reload();
    }
  });
}

//Update next id for borrower
const updateNextID = (data) => {
  baseiSMLRP('nextnumber').update(
    [
      {
        id: data['newid'],
        fields: {
          counter: data['counter'] + 1,
        },
      },
    ],
    function (err) {
      if (err) {
        console.error(err);
        return;
      } else {
        window.location.reload();
      }
    }
  );
};
