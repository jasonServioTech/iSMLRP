import { baseiSMLRP } from '../api/Api';
import Airtable from 'airtable';

//List status field criteria
export const getstatusCollection = () => [
  { id: 'New', title: 'New' },
  { id: 'Completed', title: 'Completed' },
  { id: 'Reamortization', title: 'Reamortization' },
  { id: 'Checked', title: 'Checked' },
  { id: 'Uploaded', title: 'Uploaded' },
];

//List Loan search criteria
export const getLoanSearch = () => [
  { id: 'loanid', title: 'Loan Number' },
  { id: 'borrowerid', title: 'Borrower ID' },
  { id: 'borrowername', title: 'Borrower Name' },
  { id: 'status', title: 'Status' },
];

//List paymentschedule criteria
export const getPaySchedCollection = () => [
  { id: 'Monthly', title: 'Monthly' },
  { id: 'Bi-Monthly', title: 'Bi-Monthly' },
  { id: 'Others', title: 'Others' },
];

//Get Transaction Base Key
const getTransactionBase = (loanYear) => {
  let baseAPI = '';
  switch (loanYear) {
    case 2022:
      baseAPI = process.env.REACT_APP_AIRTABLE_TRANSACTION_BASE_API_KEY_2022;
      break;
    case 2021:
      baseAPI = process.env.REACT_APP_AIRTABLE_TRANSACTION_BASE_API_KEY_2021;
      break;
    case 2020:
      baseAPI = process.env.REACT_APP_AIRTABLE_TRANSACTION_BASE_API_KEY_2020;
      break;
    case 2019:
      baseAPI = process.env.REACT_APP_AIRTABLE_TRANSACTION_BASE_API_KEY_2019;
      break;
    default:
      baseAPI = process.env.REACT_APP_AIRTABLE_TRANSACTION_BASE_API_KEY_2018;
      break;
  }

  return baseAPI;
};

//Create new Loan record
export async function insertLoans(data, currentuser) {
  console.log(data);
  let appDate = new Date(
    data['approveddate'] === undefined || data['approveddate'] === ''
      ? '1/1/1900'
      : data['approveddate']
  );
  let startDate = new Date(
    data['startdate'] === undefined || data['startdate'] === ''
      ? '1/1/1900'
      : data['startdate']
  );
  let nextDate = new Date(
    data['nextduedate'] === undefined || data['nextduedate'] === ''
      ? '1/1/1900'
      : data['nextduedate']
  );
  let maturitydate = new Date(
    data['maturitydate'] === undefined || data['maturitydate'] === ''
      ? '1/1/1900'
      : data['maturitydate']
  );

  let loanYear = startDate.getFullYear();
  baseiSMLRP('loan').create(
    [
      {
        fields: {
          loanid: data['loanid'],
          newloannumber: data['newloannumber'],
          approveddate: Intl.DateTimeFormat('en-US').format(appDate),
          loanamount: parseFloat(data['loanamount']),
          interestrate: parseFloat(data['interestrate']) / 100,
          payingperiod: parseFloat(data['payingperiod']),
          paymentschedule: data['paymentschedule'],
          paymentindays: parseFloat(data['paymentindays']),
          startdate: Intl.DateTimeFormat('en-US').format(startDate),
          maturitydate: Intl.DateTimeFormat('en-US').format(maturitydate),
          nextduedate: Intl.DateTimeFormat('en-US').format(nextDate),
          status: data['status'] ? data['status'] : 'New',
          guarantor: data['guarantor'],
          guarantorfor: data['guarantorfor'],
          comments: data['comments'],
          principalamountbalance: parseFloat(
            data['principalamountbalance'] === ''
              ? 0
              : data['principalamountbalance']
          ),
          interestamountbalance: parseFloat(
            data['interestamountbalance'] === ''
              ? 0
              : data['interestamountbalance']
          ),
          borrowerrefid: [data['borrowerid']],
          transactionbase: getTransactionBase(loanYear),
          modifiedby: currentuser,
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return;
      } else {
        //createLedger(data);
        let iYear =
          data['maturitydate'].getFullYear() - data['startdate'].getFullYear();
        for (let i = 0; i <= iYear; i++) {
          console.log('start');
          initializeTransaction(records, data, currentuser, i);
        }
      }
    }
  );

  await updateNextID(data);
}

//Update Loan record
export function updateLoans(data, currentuser) {
  console.log(data);
  baseiSMLRP('loan').update(
    [
      {
        id: data.id,
        fields: {
          status: data['status'],
          newloannumber: data['newloannumber'],
          nextduedate: data['nextduedate'],
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

//Delete Loan record
export function deleteLoans(loanId) {
  baseiSMLRP('loan').destroy(loanId, function (err) {
    if (err) {
      console.error(err);
      return;
    } else {
      window.location.reload();
    }
  });
}

//Initialized Transaction Records
const initializeTransaction = async (records, data, currentuser, iYear) => {
  const transiSMLRP = new Airtable({
    apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
  }).base(records[0].fields['transactionbase']);

  await createTransaction(
    transiSMLRP,
    records[0].fields,
    'disbursementamount',
    1,
    'disbursementamount',
    currentuser,
    iYear
  );
  await createTransaction(
    transiSMLRP,
    records[0].fields,
    'processingfee',
    2,
    'processingfee',
    currentuser,
    iYear
  );
  await createTransaction(
    transiSMLRP,
    records[0].fields,
    'principalamount',
    3,
    'principalamount',
    currentuser,
    iYear
  );
  await createTransaction(
    transiSMLRP,
    records[0].fields,
    'interestamount',
    4,
    'interestamount',
    currentuser,
    iYear
  );
  await createTransaction(
    transiSMLRP,
    records[0].fields,
    'vat',
    5,
    'vat',
    currentuser,
    iYear
  );
  await createTransaction(
    transiSMLRP,
    records[0].fields,
    'penaltyamount',
    6,
    'penaltyamount',
    currentuser,
    iYear
  );
  await createTransaction(
    transiSMLRP,
    records[0].fields,
    'remarks',
    7,
    'remarks',
    currentuser,
    iYear
  );
};

//Create Transaction in Airtable
const createTransaction = (
  transiSMLRP,
  data,
  transType,
  ctr,
  transCol,
  currentuser,
  iYear
) => {
  let tDate = new Date(
    data['transactiondate'] === undefined || data['transactiondate'] === ''
      ? new Date(data['startdate'])
      : data['transactiondate']
  );
  let diffInDays = parseInt(
    Math.abs(
      tDate - new Date(new Date(data['startdate']).getFullYear(), 0, 1)
    ) /
      (1000 * 60 * 60 * 24) +
      1
  );

  transiSMLRP('transaction').create(
    [
      {
        fields: {
          transactionid: 'T'.concat(
            tDate.getFullYear() + iYear,
            data['loanid'],
            '-',
            ctr
          ),
          loanid: data['loanid'],
          year: tDate.getFullYear() + iYear,
          transactiontype: transType,
          modifiedby: currentuser,
          d1: diffInDays === 1 ? data[transCol] : '~',
          d2: diffInDays === 2 ? data[transCol] : '~',
          d3: diffInDays === 3 ? data[transCol] : '~',
          d4: diffInDays === 4 ? data[transCol] : '~',
          d5: diffInDays === 5 ? data[transCol] : '~',
          d6: diffInDays === 6 ? data[transCol] : '~',
          d7: diffInDays === 7 ? data[transCol] : '~',
          d8: diffInDays === 8 ? data[transCol] : '~',
          d9: diffInDays === 9 ? data[transCol] : '~',
          d10: diffInDays === 10 ? data[transCol] : '~',
          d11: diffInDays === 11 ? data[transCol] : '~',
          d12: diffInDays === 12 ? data[transCol] : '~',
          d13: diffInDays === 13 ? data[transCol] : '~',
          d14: diffInDays === 14 ? data[transCol] : '~',
          d15: diffInDays === 15 ? data[transCol] : '~',
          d16: diffInDays === 16 ? data[transCol] : '~',
          d17: diffInDays === 17 ? data[transCol] : '~',
          d18: diffInDays === 18 ? data[transCol] : '~',
          d19: diffInDays === 19 ? data[transCol] : '~',
          d20: diffInDays === 20 ? data[transCol] : '~',
          d21: diffInDays === 21 ? data[transCol] : '~',
          d22: diffInDays === 22 ? data[transCol] : '~',
          d23: diffInDays === 23 ? data[transCol] : '~',
          d24: diffInDays === 24 ? data[transCol] : '~',
          d25: diffInDays === 25 ? data[transCol] : '~',
          d26: diffInDays === 26 ? data[transCol] : '~',
          d27: diffInDays === 27 ? data[transCol] : '~',
          d28: diffInDays === 28 ? data[transCol] : '~',
          d29: diffInDays === 29 ? data[transCol] : '~',
          d30: diffInDays === 30 ? data[transCol] : '~',
          d31: diffInDays === 31 ? data[transCol] : '~',
          d32: diffInDays === 32 ? data[transCol] : '~',
          d33: diffInDays === 33 ? data[transCol] : '~',
          d34: diffInDays === 34 ? data[transCol] : '~',
          d35: diffInDays === 35 ? data[transCol] : '~',
          d36: diffInDays === 36 ? data[transCol] : '~',
          d37: diffInDays === 37 ? data[transCol] : '~',
          d38: diffInDays === 38 ? data[transCol] : '~',
          d39: diffInDays === 39 ? data[transCol] : '~',
          d40: diffInDays === 40 ? data[transCol] : '~',
          d41: diffInDays === 41 ? data[transCol] : '~',
          d42: diffInDays === 42 ? data[transCol] : '~',
          d43: diffInDays === 43 ? data[transCol] : '~',
          d44: diffInDays === 44 ? data[transCol] : '~',
          d45: diffInDays === 45 ? data[transCol] : '~',
          d46: diffInDays === 46 ? data[transCol] : '~',
          d47: diffInDays === 47 ? data[transCol] : '~',
          d48: diffInDays === 48 ? data[transCol] : '~',
          d49: diffInDays === 49 ? data[transCol] : '~',
          d50: diffInDays === 50 ? data[transCol] : '~',
          d51: diffInDays === 51 ? data[transCol] : '~',
          d52: diffInDays === 52 ? data[transCol] : '~',
          d53: diffInDays === 53 ? data[transCol] : '~',
          d54: diffInDays === 54 ? data[transCol] : '~',
          d55: diffInDays === 55 ? data[transCol] : '~',
          d56: diffInDays === 56 ? data[transCol] : '~',
          d57: diffInDays === 57 ? data[transCol] : '~',
          d58: diffInDays === 58 ? data[transCol] : '~',
          d59: diffInDays === 59 ? data[transCol] : '~',
          d60: diffInDays === 60 ? data[transCol] : '~',
          d61: diffInDays === 61 ? data[transCol] : '~',
          d62: diffInDays === 62 ? data[transCol] : '~',
          d63: diffInDays === 63 ? data[transCol] : '~',
          d64: diffInDays === 64 ? data[transCol] : '~',
          d65: diffInDays === 65 ? data[transCol] : '~',
          d66: diffInDays === 66 ? data[transCol] : '~',
          d67: diffInDays === 67 ? data[transCol] : '~',
          d68: diffInDays === 68 ? data[transCol] : '~',
          d69: diffInDays === 69 ? data[transCol] : '~',
          d70: diffInDays === 70 ? data[transCol] : '~',
          d71: diffInDays === 71 ? data[transCol] : '~',
          d72: diffInDays === 72 ? data[transCol] : '~',
          d73: diffInDays === 73 ? data[transCol] : '~',
          d74: diffInDays === 74 ? data[transCol] : '~',
          d75: diffInDays === 75 ? data[transCol] : '~',
          d76: diffInDays === 76 ? data[transCol] : '~',
          d77: diffInDays === 77 ? data[transCol] : '~',
          d78: diffInDays === 78 ? data[transCol] : '~',
          d79: diffInDays === 79 ? data[transCol] : '~',
          d80: diffInDays === 80 ? data[transCol] : '~',
          d81: diffInDays === 81 ? data[transCol] : '~',
          d82: diffInDays === 82 ? data[transCol] : '~',
          d83: diffInDays === 83 ? data[transCol] : '~',
          d84: diffInDays === 84 ? data[transCol] : '~',
          d85: diffInDays === 85 ? data[transCol] : '~',
          d86: diffInDays === 86 ? data[transCol] : '~',
          d87: diffInDays === 87 ? data[transCol] : '~',
          d88: diffInDays === 88 ? data[transCol] : '~',
          d89: diffInDays === 89 ? data[transCol] : '~',
          d90: diffInDays === 90 ? data[transCol] : '~',
          d91: diffInDays === 91 ? data[transCol] : '~',
          d92: diffInDays === 92 ? data[transCol] : '~',
          d93: diffInDays === 93 ? data[transCol] : '~',
          d94: diffInDays === 94 ? data[transCol] : '~',
          d95: diffInDays === 95 ? data[transCol] : '~',
          d96: diffInDays === 96 ? data[transCol] : '~',
          d97: diffInDays === 97 ? data[transCol] : '~',
          d98: diffInDays === 98 ? data[transCol] : '~',
          d99: diffInDays === 99 ? data[transCol] : '~',
          d100: diffInDays === 100 ? data[transCol] : '~',
          d101: diffInDays === 101 ? data[transCol] : '~',
          d102: diffInDays === 102 ? data[transCol] : '~',
          d103: diffInDays === 103 ? data[transCol] : '~',
          d104: diffInDays === 104 ? data[transCol] : '~',
          d105: diffInDays === 105 ? data[transCol] : '~',
          d106: diffInDays === 106 ? data[transCol] : '~',
          d107: diffInDays === 107 ? data[transCol] : '~',
          d108: diffInDays === 108 ? data[transCol] : '~',
          d109: diffInDays === 109 ? data[transCol] : '~',
          d110: diffInDays === 110 ? data[transCol] : '~',
          d111: diffInDays === 111 ? data[transCol] : '~',
          d112: diffInDays === 112 ? data[transCol] : '~',
          d113: diffInDays === 113 ? data[transCol] : '~',
          d114: diffInDays === 114 ? data[transCol] : '~',
          d115: diffInDays === 115 ? data[transCol] : '~',
          d116: diffInDays === 116 ? data[transCol] : '~',
          d117: diffInDays === 117 ? data[transCol] : '~',
          d118: diffInDays === 118 ? data[transCol] : '~',
          d119: diffInDays === 119 ? data[transCol] : '~',
          d120: diffInDays === 120 ? data[transCol] : '~',
          d121: diffInDays === 121 ? data[transCol] : '~',
          d122: diffInDays === 122 ? data[transCol] : '~',
          d123: diffInDays === 123 ? data[transCol] : '~',
          d124: diffInDays === 124 ? data[transCol] : '~',
          d125: diffInDays === 125 ? data[transCol] : '~',
          d126: diffInDays === 126 ? data[transCol] : '~',
          d127: diffInDays === 127 ? data[transCol] : '~',
          d128: diffInDays === 128 ? data[transCol] : '~',
          d129: diffInDays === 129 ? data[transCol] : '~',
          d130: diffInDays === 130 ? data[transCol] : '~',
          d131: diffInDays === 131 ? data[transCol] : '~',
          d132: diffInDays === 132 ? data[transCol] : '~',
          d133: diffInDays === 133 ? data[transCol] : '~',
          d134: diffInDays === 134 ? data[transCol] : '~',
          d135: diffInDays === 135 ? data[transCol] : '~',
          d136: diffInDays === 136 ? data[transCol] : '~',
          d137: diffInDays === 137 ? data[transCol] : '~',
          d138: diffInDays === 138 ? data[transCol] : '~',
          d139: diffInDays === 139 ? data[transCol] : '~',
          d140: diffInDays === 140 ? data[transCol] : '~',
          d141: diffInDays === 141 ? data[transCol] : '~',
          d142: diffInDays === 142 ? data[transCol] : '~',
          d143: diffInDays === 143 ? data[transCol] : '~',
          d144: diffInDays === 144 ? data[transCol] : '~',
          d145: diffInDays === 145 ? data[transCol] : '~',
          d146: diffInDays === 146 ? data[transCol] : '~',
          d147: diffInDays === 147 ? data[transCol] : '~',
          d148: diffInDays === 148 ? data[transCol] : '~',
          d149: diffInDays === 149 ? data[transCol] : '~',
          d150: diffInDays === 150 ? data[transCol] : '~',
          d151: diffInDays === 151 ? data[transCol] : '~',
          d152: diffInDays === 152 ? data[transCol] : '~',
          d153: diffInDays === 153 ? data[transCol] : '~',
          d154: diffInDays === 154 ? data[transCol] : '~',
          d155: diffInDays === 155 ? data[transCol] : '~',
          d156: diffInDays === 156 ? data[transCol] : '~',
          d157: diffInDays === 157 ? data[transCol] : '~',
          d158: diffInDays === 158 ? data[transCol] : '~',
          d159: diffInDays === 159 ? data[transCol] : '~',
          d160: diffInDays === 160 ? data[transCol] : '~',
          d161: diffInDays === 161 ? data[transCol] : '~',
          d162: diffInDays === 162 ? data[transCol] : '~',
          d163: diffInDays === 163 ? data[transCol] : '~',
          d164: diffInDays === 164 ? data[transCol] : '~',
          d165: diffInDays === 165 ? data[transCol] : '~',
          d166: diffInDays === 166 ? data[transCol] : '~',
          d167: diffInDays === 167 ? data[transCol] : '~',
          d168: diffInDays === 168 ? data[transCol] : '~',
          d169: diffInDays === 169 ? data[transCol] : '~',
          d170: diffInDays === 170 ? data[transCol] : '~',
          d171: diffInDays === 171 ? data[transCol] : '~',
          d172: diffInDays === 172 ? data[transCol] : '~',
          d173: diffInDays === 173 ? data[transCol] : '~',
          d174: diffInDays === 174 ? data[transCol] : '~',
          d175: diffInDays === 175 ? data[transCol] : '~',
          d176: diffInDays === 176 ? data[transCol] : '~',
          d177: diffInDays === 177 ? data[transCol] : '~',
          d178: diffInDays === 178 ? data[transCol] : '~',
          d179: diffInDays === 179 ? data[transCol] : '~',
          d180: diffInDays === 180 ? data[transCol] : '~',
          d181: diffInDays === 181 ? data[transCol] : '~',
          d182: diffInDays === 182 ? data[transCol] : '~',
          d183: diffInDays === 183 ? data[transCol] : '~',
          d184: diffInDays === 184 ? data[transCol] : '~',
          d185: diffInDays === 185 ? data[transCol] : '~',
          d186: diffInDays === 186 ? data[transCol] : '~',
          d187: diffInDays === 187 ? data[transCol] : '~',
          d188: diffInDays === 188 ? data[transCol] : '~',
          d189: diffInDays === 189 ? data[transCol] : '~',
          d190: diffInDays === 190 ? data[transCol] : '~',
          d191: diffInDays === 191 ? data[transCol] : '~',
          d192: diffInDays === 192 ? data[transCol] : '~',
          d193: diffInDays === 193 ? data[transCol] : '~',
          d194: diffInDays === 194 ? data[transCol] : '~',
          d195: diffInDays === 195 ? data[transCol] : '~',
          d196: diffInDays === 196 ? data[transCol] : '~',
          d197: diffInDays === 197 ? data[transCol] : '~',
          d198: diffInDays === 198 ? data[transCol] : '~',
          d199: diffInDays === 199 ? data[transCol] : '~',
          d200: diffInDays === 200 ? data[transCol] : '~',
          d201: diffInDays === 201 ? data[transCol] : '~',
          d202: diffInDays === 202 ? data[transCol] : '~',
          d203: diffInDays === 203 ? data[transCol] : '~',
          d204: diffInDays === 204 ? data[transCol] : '~',
          d205: diffInDays === 205 ? data[transCol] : '~',
          d206: diffInDays === 206 ? data[transCol] : '~',
          d207: diffInDays === 207 ? data[transCol] : '~',
          d208: diffInDays === 208 ? data[transCol] : '~',
          d209: diffInDays === 209 ? data[transCol] : '~',
          d210: diffInDays === 210 ? data[transCol] : '~',
          d211: diffInDays === 211 ? data[transCol] : '~',
          d212: diffInDays === 212 ? data[transCol] : '~',
          d213: diffInDays === 213 ? data[transCol] : '~',
          d214: diffInDays === 214 ? data[transCol] : '~',
          d215: diffInDays === 215 ? data[transCol] : '~',
          d216: diffInDays === 216 ? data[transCol] : '~',
          d217: diffInDays === 217 ? data[transCol] : '~',
          d218: diffInDays === 218 ? data[transCol] : '~',
          d219: diffInDays === 219 ? data[transCol] : '~',
          d220: diffInDays === 220 ? data[transCol] : '~',
          d221: diffInDays === 221 ? data[transCol] : '~',
          d222: diffInDays === 222 ? data[transCol] : '~',
          d223: diffInDays === 223 ? data[transCol] : '~',
          d224: diffInDays === 224 ? data[transCol] : '~',
          d225: diffInDays === 225 ? data[transCol] : '~',
          d226: diffInDays === 226 ? data[transCol] : '~',
          d227: diffInDays === 227 ? data[transCol] : '~',
          d228: diffInDays === 228 ? data[transCol] : '~',
          d229: diffInDays === 229 ? data[transCol] : '~',
          d230: diffInDays === 230 ? data[transCol] : '~',
          d231: diffInDays === 231 ? data[transCol] : '~',
          d232: diffInDays === 232 ? data[transCol] : '~',
          d233: diffInDays === 233 ? data[transCol] : '~',
          d234: diffInDays === 234 ? data[transCol] : '~',
          d235: diffInDays === 235 ? data[transCol] : '~',
          d236: diffInDays === 236 ? data[transCol] : '~',
          d237: diffInDays === 237 ? data[transCol] : '~',
          d238: diffInDays === 238 ? data[transCol] : '~',
          d239: diffInDays === 239 ? data[transCol] : '~',
          d240: diffInDays === 240 ? data[transCol] : '~',
          d241: diffInDays === 241 ? data[transCol] : '~',
          d242: diffInDays === 242 ? data[transCol] : '~',
          d243: diffInDays === 243 ? data[transCol] : '~',
          d244: diffInDays === 244 ? data[transCol] : '~',
          d245: diffInDays === 245 ? data[transCol] : '~',
          d246: diffInDays === 246 ? data[transCol] : '~',
          d247: diffInDays === 247 ? data[transCol] : '~',
          d248: diffInDays === 248 ? data[transCol] : '~',
          d249: diffInDays === 249 ? data[transCol] : '~',
          d250: diffInDays === 250 ? data[transCol] : '~',
          d251: diffInDays === 251 ? data[transCol] : '~',
          d252: diffInDays === 252 ? data[transCol] : '~',
          d253: diffInDays === 253 ? data[transCol] : '~',
          d254: diffInDays === 254 ? data[transCol] : '~',
          d255: diffInDays === 255 ? data[transCol] : '~',
          d256: diffInDays === 256 ? data[transCol] : '~',
          d257: diffInDays === 257 ? data[transCol] : '~',
          d258: diffInDays === 258 ? data[transCol] : '~',
          d259: diffInDays === 259 ? data[transCol] : '~',
          d260: diffInDays === 260 ? data[transCol] : '~',
          d261: diffInDays === 261 ? data[transCol] : '~',
          d262: diffInDays === 262 ? data[transCol] : '~',
          d263: diffInDays === 263 ? data[transCol] : '~',
          d264: diffInDays === 264 ? data[transCol] : '~',
          d265: diffInDays === 265 ? data[transCol] : '~',
          d266: diffInDays === 266 ? data[transCol] : '~',
          d267: diffInDays === 267 ? data[transCol] : '~',
          d268: diffInDays === 268 ? data[transCol] : '~',
          d269: diffInDays === 269 ? data[transCol] : '~',
          d270: diffInDays === 270 ? data[transCol] : '~',
          d271: diffInDays === 271 ? data[transCol] : '~',
          d272: diffInDays === 272 ? data[transCol] : '~',
          d273: diffInDays === 273 ? data[transCol] : '~',
          d274: diffInDays === 274 ? data[transCol] : '~',
          d275: diffInDays === 275 ? data[transCol] : '~',
          d276: diffInDays === 276 ? data[transCol] : '~',
          d277: diffInDays === 277 ? data[transCol] : '~',
          d278: diffInDays === 278 ? data[transCol] : '~',
          d279: diffInDays === 279 ? data[transCol] : '~',
          d280: diffInDays === 280 ? data[transCol] : '~',
          d281: diffInDays === 281 ? data[transCol] : '~',
          d282: diffInDays === 282 ? data[transCol] : '~',
          d283: diffInDays === 283 ? data[transCol] : '~',
          d284: diffInDays === 284 ? data[transCol] : '~',
          d285: diffInDays === 285 ? data[transCol] : '~',
          d286: diffInDays === 286 ? data[transCol] : '~',
          d287: diffInDays === 287 ? data[transCol] : '~',
          d288: diffInDays === 288 ? data[transCol] : '~',
          d289: diffInDays === 289 ? data[transCol] : '~',
          d290: diffInDays === 290 ? data[transCol] : '~',
          d291: diffInDays === 291 ? data[transCol] : '~',
          d292: diffInDays === 292 ? data[transCol] : '~',
          d293: diffInDays === 293 ? data[transCol] : '~',
          d294: diffInDays === 294 ? data[transCol] : '~',
          d295: diffInDays === 295 ? data[transCol] : '~',
          d296: diffInDays === 296 ? data[transCol] : '~',
          d297: diffInDays === 297 ? data[transCol] : '~',
          d298: diffInDays === 298 ? data[transCol] : '~',
          d299: diffInDays === 299 ? data[transCol] : '~',
          d300: diffInDays === 300 ? data[transCol] : '~',
          d301: diffInDays === 301 ? data[transCol] : '~',
          d302: diffInDays === 302 ? data[transCol] : '~',
          d303: diffInDays === 303 ? data[transCol] : '~',
          d304: diffInDays === 304 ? data[transCol] : '~',
          d305: diffInDays === 305 ? data[transCol] : '~',
          d306: diffInDays === 306 ? data[transCol] : '~',
          d307: diffInDays === 307 ? data[transCol] : '~',
          d308: diffInDays === 308 ? data[transCol] : '~',
          d309: diffInDays === 309 ? data[transCol] : '~',
          d310: diffInDays === 310 ? data[transCol] : '~',
          d311: diffInDays === 311 ? data[transCol] : '~',
          d312: diffInDays === 312 ? data[transCol] : '~',
          d313: diffInDays === 313 ? data[transCol] : '~',
          d314: diffInDays === 314 ? data[transCol] : '~',
          d315: diffInDays === 315 ? data[transCol] : '~',
          d316: diffInDays === 316 ? data[transCol] : '~',
          d317: diffInDays === 317 ? data[transCol] : '~',
          d318: diffInDays === 318 ? data[transCol] : '~',
          d319: diffInDays === 319 ? data[transCol] : '~',
          d320: diffInDays === 320 ? data[transCol] : '~',
          d321: diffInDays === 321 ? data[transCol] : '~',
          d322: diffInDays === 322 ? data[transCol] : '~',
          d323: diffInDays === 323 ? data[transCol] : '~',
          d324: diffInDays === 324 ? data[transCol] : '~',
          d325: diffInDays === 325 ? data[transCol] : '~',
          d326: diffInDays === 326 ? data[transCol] : '~',
          d327: diffInDays === 327 ? data[transCol] : '~',
          d328: diffInDays === 328 ? data[transCol] : '~',
          d329: diffInDays === 329 ? data[transCol] : '~',
          d330: diffInDays === 330 ? data[transCol] : '~',
          d331: diffInDays === 331 ? data[transCol] : '~',
          d332: diffInDays === 332 ? data[transCol] : '~',
          d333: diffInDays === 333 ? data[transCol] : '~',
          d334: diffInDays === 334 ? data[transCol] : '~',
          d335: diffInDays === 335 ? data[transCol] : '~',
          d336: diffInDays === 336 ? data[transCol] : '~',
          d337: diffInDays === 337 ? data[transCol] : '~',
          d338: diffInDays === 338 ? data[transCol] : '~',
          d339: diffInDays === 339 ? data[transCol] : '~',
          d340: diffInDays === 340 ? data[transCol] : '~',
          d341: diffInDays === 341 ? data[transCol] : '~',
          d342: diffInDays === 342 ? data[transCol] : '~',
          d343: diffInDays === 343 ? data[transCol] : '~',
          d344: diffInDays === 344 ? data[transCol] : '~',
          d345: diffInDays === 345 ? data[transCol] : '~',
          d346: diffInDays === 346 ? data[transCol] : '~',
          d347: diffInDays === 347 ? data[transCol] : '~',
          d348: diffInDays === 348 ? data[transCol] : '~',
          d349: diffInDays === 349 ? data[transCol] : '~',
          d350: diffInDays === 350 ? data[transCol] : '~',
          d351: diffInDays === 351 ? data[transCol] : '~',
          d352: diffInDays === 352 ? data[transCol] : '~',
          d353: diffInDays === 353 ? data[transCol] : '~',
          d354: diffInDays === 354 ? data[transCol] : '~',
          d355: diffInDays === 355 ? data[transCol] : '~',
          d356: diffInDays === 356 ? data[transCol] : '~',
          d357: diffInDays === 357 ? data[transCol] : '~',
          d358: diffInDays === 358 ? data[transCol] : '~',
          d359: diffInDays === 359 ? data[transCol] : '~',
          d360: diffInDays === 360 ? data[transCol] : '~',
          d361: diffInDays === 361 ? data[transCol] : '~',
          d362: diffInDays === 362 ? data[transCol] : '~',
          d363: diffInDays === 363 ? data[transCol] : '~',
          d364: diffInDays === 364 ? data[transCol] : '~',
          d365: diffInDays === 365 ? data[transCol] : '~',
          d366: diffInDays === 366 ? data[transCol] : '~',
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
};

//Update next id for loans
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
      }
    }
  );
};
