import Airtable from 'airtable';

//iSMLRP Base
export const baseiSMLRP = new Airtable({
  apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
}).base(process.env.REACT_APP_AIRTABLE_MASTER_BASE_API_KEY);

//iSMLRP Next Number
export const baseNextID = 'https://api.airtable.com/v0/'.concat(
  process.env.REACT_APP_AIRTABLE_MASTER_BASE_API_KEY,
  '/nextnumber?api_key=',
  process.env.REACT_APP_AIRTABLE_API_KEY
);

//iSMLRP baseBorrower
export const baseBorrower = 'https://api.airtable.com/v0/'.concat(
  process.env.REACT_APP_AIRTABLE_MASTER_BASE_API_KEY,
  '/borrower?api_key=',
  process.env.REACT_APP_AIRTABLE_API_KEY
);

export const baseLoans =
  'https://api.airtable.com/v0/app1pt89YMTZKVSvo/Loans?api_key=keyLuy77TiMrMgCUY';
export const baseLedger =
  'https://api.airtable.com/v0/app1pt89YMTZKVSvo/Ledger?api_key=keyLuy77TiMrMgCUY';
