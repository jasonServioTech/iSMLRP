import { baseiSMLRP } from '../api/Api';

//Get Borrower Access
export function GetAccess(currentUser) {
  let filter = "AND({userid}='".concat(currentUser, "')");
  baseiSMLRP('user')
    .select({ view: 'Users', filterByFormula: filter })
    .eachPage((records, fetchNextPage) => {
      records.forEach(function (record) {
        return record.get('borrowersave');
      });
      fetchNextPage();
    });
}
