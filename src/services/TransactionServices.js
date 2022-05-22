import Airtable from 'airtable';
import { baseiSMLRP } from '../api/Api';

//Create new Transaction record
export async function insertTransaction(data, currentuser) {
  const transiSMLRP = new Airtable({
    apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
  }).base(data['transactionbase']);

  let filter = "AND({loanid} = '".concat(
    data['loanid'],
    "',{year}=",
    data['transactiondate'].getFullYear(),
    ')'
  );
  transiSMLRP('transaction')
    .select({ view: 'Transactions', filterByFormula: filter })
    .all((err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach(function (record) {
        console.log('12', records.length);
        let tDate = new Date(
          data['transactiondate'] === undefined ||
          data['transactiondate'] === ''
            ? new Date(data['startdate'])
            : data['transactiondate']
        );
        let diffInDays = parseInt(
          Math.abs(tDate - new Date(new Date(record.fields['year']), 0, 1)) /
            (1000 * 60 * 60 * 24) +
            1
        );
        filter = "AND({loanid} = '".concat(
          data['loanid'],
          "', {transactiontype} = '",
          record.fields['transactiontype'],
          "',{year}=",
          record.fields['year'],
          ')'
        );
        modifyTransaction(transiSMLRP, data, filter, diffInDays, currentuser);
      });
    });
}

//Update Transaction record
export function updateTransaction(data, currentuser, loan) {
  const transiSMLRP = new Airtable({
    apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
  }).base(loan['transactionbase']);

  let filter = "AND({loanid} = '".concat(
    loan['loanid'],
    "',{year}=",
    new Date(data['transactiondate']).getFullYear(),
    ')'
  );

  let tDate = new Date(
    data['transactiondate'] === undefined || data['transactiondate'] === ''
      ? new Date(data['startdate'])
      : data['transactiondate']
  );
  let diffInDays = parseInt(
    Math.abs(tDate - new Date(new Date(tDate.getFullYear()), 0, 1)) /
      (1000 * 60 * 60 * 24) +
      1
  );
  modifyTransaction(transiSMLRP, data, filter, diffInDays, currentuser);
}

//Delete Transaction record
export function deleteTransaction(TransId) {
  let recordDelete = TransId.split(',');
  const transiSMLRP = new Airtable({
    apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
  }).base(recordDelete[2]);

  let filter = "AND({loanid} = '".concat(
    recordDelete[0],
    "',{year}=",
    new Date(recordDelete[1]).getFullYear(),
    ')'
  );

  let tDate = new Date(recordDelete[1]);
  let diffInDays = parseInt(
    Math.abs(tDate - new Date(new Date(tDate.getFullYear()), 0, 1)) /
      (1000 * 60 * 60 * 24) +
      1
  );

  transiSMLRP('transaction')
    .select({ view: 'Transactions', filterByFormula: filter })
    .eachPage(
      function page(records, fetchNextPage) {
        records.forEach(function (record) {
          updateTransactionDetails(
            transiSMLRP,
            record,
            diffInDays,
            ' ',
            recordDelete[3],
            record.fields['transactiontype']
          );
        });
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

//Modify Transaction Date Record
function modifyTransaction(transiSMLRP, data, filter, diffInDays, currentuser) {
  let transAmount = '';

  transiSMLRP('transaction')
    .select({ view: 'Transactions', filterByFormula: filter })
    .eachPage(
      function page(records, fetchNextPage) {
        records.forEach(function (record) {
          transAmount = data[record.fields['transactiontype']];
          if (transAmount)
            updateTransactionDetails(
              transiSMLRP,
              record,
              diffInDays,
              transAmount,
              currentuser,
              record.fields['transactiontype']
            );
        });
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

//Update Transaction record per Date and Type
const updateTransactionDetails = async (
  transiSMLRP,
  details,
  transDay,
  transAmount,
  currentuser,
  transCol
) => {
  console.log(details.id);
  transiSMLRP('transaction').update(
    [
      {
        id: details.id,
        fields: {
          modifiedby: currentuser,
          d1: transDay === 1 ? transAmount.toString() : details.fields['d1'],
          d2: transDay === 2 ? transAmount.toString() : details.fields['d2'],
          d3: transDay === 3 ? transAmount.toString() : details.fields['d3'],
          d4: transDay === 4 ? transAmount.toString() : details.fields['d4'],
          d5: transDay === 5 ? transAmount.toString() : details.fields['d5'],
          d6: transDay === 6 ? transAmount.toString() : details.fields['d6'],
          d7: transDay === 7 ? transAmount.toString() : details.fields['d7'],
          d8: transDay === 8 ? transAmount.toString() : details.fields['d8'],
          d9: transDay === 9 ? transAmount.toString() : details.fields['d9'],
          d10: transDay === 10 ? transAmount.toString() : details.fields['d10'],
          d11: transDay === 11 ? transAmount.toString() : details.fields['d11'],
          d12: transDay === 12 ? transAmount.toString() : details.fields['d12'],
          d13: transDay === 13 ? transAmount.toString() : details.fields['d13'],
          d14: transDay === 14 ? transAmount.toString() : details.fields['d14'],
          d15: transDay === 15 ? transAmount.toString() : details.fields['d15'],
          d16: transDay === 16 ? transAmount.toString() : details.fields['d16'],
          d17: transDay === 17 ? transAmount.toString() : details.fields['d17'],
          d18: transDay === 18 ? transAmount.toString() : details.fields['d18'],
          d19: transDay === 19 ? transAmount.toString() : details.fields['d19'],
          d20: transDay === 20 ? transAmount.toString() : details.fields['d20'],
          d21: transDay === 21 ? transAmount.toString() : details.fields['d21'],
          d22: transDay === 22 ? transAmount.toString() : details.fields['d22'],
          d23: transDay === 23 ? transAmount.toString() : details.fields['d23'],
          d24: transDay === 24 ? transAmount.toString() : details.fields['d24'],
          d25: transDay === 25 ? transAmount.toString() : details.fields['d25'],
          d26: transDay === 26 ? transAmount.toString() : details.fields['d26'],
          d27: transDay === 27 ? transAmount.toString() : details.fields['d27'],
          d28: transDay === 28 ? transAmount.toString() : details.fields['d28'],
          d29: transDay === 29 ? transAmount.toString() : details.fields['d29'],
          d30: transDay === 30 ? transAmount.toString() : details.fields['d30'],
          d31: transDay === 31 ? transAmount.toString() : details.fields['d31'],
          d32: transDay === 32 ? transAmount.toString() : details.fields['d32'],
          d33: transDay === 33 ? transAmount.toString() : details.fields['d33'],
          d34: transDay === 34 ? transAmount.toString() : details.fields['d34'],
          d35: transDay === 35 ? transAmount.toString() : details.fields['d35'],
          d36: transDay === 36 ? transAmount.toString() : details.fields['d36'],
          d37: transDay === 37 ? transAmount.toString() : details.fields['d37'],
          d38: transDay === 38 ? transAmount.toString() : details.fields['d38'],
          d39: transDay === 39 ? transAmount.toString() : details.fields['d39'],
          d40: transDay === 40 ? transAmount.toString() : details.fields['d40'],
          d41: transDay === 41 ? transAmount.toString() : details.fields['d41'],
          d42: transDay === 42 ? transAmount.toString() : details.fields['d42'],
          d43: transDay === 43 ? transAmount.toString() : details.fields['d43'],
          d44: transDay === 44 ? transAmount.toString() : details.fields['d44'],
          d45: transDay === 45 ? transAmount.toString() : details.fields['d45'],
          d46: transDay === 46 ? transAmount.toString() : details.fields['d46'],
          d47: transDay === 47 ? transAmount.toString() : details.fields['d47'],
          d48: transDay === 48 ? transAmount.toString() : details.fields['d48'],
          d49: transDay === 49 ? transAmount.toString() : details.fields['d49'],
          d50: transDay === 50 ? transAmount.toString() : details.fields['d50'],
          d51: transDay === 51 ? transAmount.toString() : details.fields['d51'],
          d52: transDay === 52 ? transAmount.toString() : details.fields['d52'],
          d53: transDay === 53 ? transAmount.toString() : details.fields['d53'],
          d54: transDay === 54 ? transAmount.toString() : details.fields['d54'],
          d55: transDay === 55 ? transAmount.toString() : details.fields['d55'],
          d56: transDay === 56 ? transAmount.toString() : details.fields['d56'],
          d57: transDay === 57 ? transAmount.toString() : details.fields['d57'],
          d58: transDay === 58 ? transAmount.toString() : details.fields['d58'],
          d59: transDay === 59 ? transAmount.toString() : details.fields['d59'],
          d60: transDay === 60 ? transAmount.toString() : details.fields['d60'],
          d61: transDay === 61 ? transAmount.toString() : details.fields['d61'],
          d62: transDay === 62 ? transAmount.toString() : details.fields['d62'],
          d63: transDay === 63 ? transAmount.toString() : details.fields['d63'],
          d64: transDay === 64 ? transAmount.toString() : details.fields['d64'],
          d65: transDay === 65 ? transAmount.toString() : details.fields['d65'],
          d66: transDay === 66 ? transAmount.toString() : details.fields['d66'],
          d67: transDay === 67 ? transAmount.toString() : details.fields['d67'],
          d68: transDay === 68 ? transAmount.toString() : details.fields['d68'],
          d69: transDay === 69 ? transAmount.toString() : details.fields['d69'],
          d70: transDay === 70 ? transAmount.toString() : details.fields['d70'],
          d71: transDay === 71 ? transAmount.toString() : details.fields['d71'],
          d72: transDay === 72 ? transAmount.toString() : details.fields['d72'],
          d73: transDay === 73 ? transAmount.toString() : details.fields['d73'],
          d74: transDay === 74 ? transAmount.toString() : details.fields['d74'],
          d75: transDay === 75 ? transAmount.toString() : details.fields['d75'],
          d76: transDay === 76 ? transAmount.toString() : details.fields['d76'],
          d77: transDay === 77 ? transAmount.toString() : details.fields['d77'],
          d78: transDay === 78 ? transAmount.toString() : details.fields['d78'],
          d79: transDay === 79 ? transAmount.toString() : details.fields['d79'],
          d80: transDay === 80 ? transAmount.toString() : details.fields['d80'],
          d81: transDay === 81 ? transAmount.toString() : details.fields['d81'],
          d82: transDay === 82 ? transAmount.toString() : details.fields['d82'],
          d83: transDay === 83 ? transAmount.toString() : details.fields['d83'],
          d84: transDay === 84 ? transAmount.toString() : details.fields['d84'],
          d85: transDay === 85 ? transAmount.toString() : details.fields['d85'],
          d86: transDay === 86 ? transAmount.toString() : details.fields['d86'],
          d87: transDay === 87 ? transAmount.toString() : details.fields['d87'],
          d88: transDay === 88 ? transAmount.toString() : details.fields['d88'],
          d89: transDay === 89 ? transAmount.toString() : details.fields['d89'],
          d90: transDay === 90 ? transAmount.toString() : details.fields['d90'],
          d91: transDay === 91 ? transAmount.toString() : details.fields['d91'],
          d92: transDay === 92 ? transAmount.toString() : details.fields['d92'],
          d93: transDay === 93 ? transAmount.toString() : details.fields['d93'],
          d94: transDay === 94 ? transAmount.toString() : details.fields['d94'],
          d95: transDay === 95 ? transAmount.toString() : details.fields['d95'],
          d96: transDay === 96 ? transAmount.toString() : details.fields['d96'],
          d97: transDay === 97 ? transAmount.toString() : details.fields['d97'],
          d98: transDay === 98 ? transAmount.toString() : details.fields['d98'],
          d99: transDay === 99 ? transAmount.toString() : details.fields['d99'],
          d100:
            transDay === 100 ? transAmount.toString() : details.fields['d100'],
          d101:
            transDay === 101 ? transAmount.toString() : details.fields['d101'],
          d102:
            transDay === 102 ? transAmount.toString() : details.fields['d102'],
          d103:
            transDay === 103 ? transAmount.toString() : details.fields['d103'],
          d104:
            transDay === 104 ? transAmount.toString() : details.fields['d104'],
          d105:
            transDay === 105 ? transAmount.toString() : details.fields['d105'],
          d106:
            transDay === 106 ? transAmount.toString() : details.fields['d106'],
          d107:
            transDay === 107 ? transAmount.toString() : details.fields['d107'],
          d108:
            transDay === 108 ? transAmount.toString() : details.fields['d108'],
          d109:
            transDay === 109 ? transAmount.toString() : details.fields['d109'],
          d110:
            transDay === 110 ? transAmount.toString() : details.fields['d110'],
          d111:
            transDay === 111 ? transAmount.toString() : details.fields['d111'],
          d112:
            transDay === 112 ? transAmount.toString() : details.fields['d112'],
          d113:
            transDay === 113 ? transAmount.toString() : details.fields['d113'],
          d114:
            transDay === 114 ? transAmount.toString() : details.fields['d114'],
          d115:
            transDay === 115 ? transAmount.toString() : details.fields['d115'],
          d116:
            transDay === 116 ? transAmount.toString() : details.fields['d116'],
          d117:
            transDay === 117 ? transAmount.toString() : details.fields['d117'],
          d118:
            transDay === 118 ? transAmount.toString() : details.fields['d118'],
          d119:
            transDay === 119 ? transAmount.toString() : details.fields['d119'],
          d120:
            transDay === 120 ? transAmount.toString() : details.fields['d120'],
          d121:
            transDay === 121 ? transAmount.toString() : details.fields['d121'],
          d122:
            transDay === 122 ? transAmount.toString() : details.fields['d122'],
          d123:
            transDay === 123 ? transAmount.toString() : details.fields['d123'],
          d124:
            transDay === 124 ? transAmount.toString() : details.fields['d124'],
          d125:
            transDay === 125 ? transAmount.toString() : details.fields['d125'],
          d126:
            transDay === 126 ? transAmount.toString() : details.fields['d126'],
          d127:
            transDay === 127 ? transAmount.toString() : details.fields['d127'],
          d128:
            transDay === 128 ? transAmount.toString() : details.fields['d128'],
          d129:
            transDay === 129 ? transAmount.toString() : details.fields['d129'],
          d130:
            transDay === 130 ? transAmount.toString() : details.fields['d130'],
          d131:
            transDay === 131 ? transAmount.toString() : details.fields['d131'],
          d132:
            transDay === 132 ? transAmount.toString() : details.fields['d132'],
          d133:
            transDay === 133 ? transAmount.toString() : details.fields['d133'],
          d134:
            transDay === 134 ? transAmount.toString() : details.fields['d134'],
          d135:
            transDay === 135 ? transAmount.toString() : details.fields['d135'],
          d136:
            transDay === 136 ? transAmount.toString() : details.fields['d136'],
          d137:
            transDay === 137 ? transAmount.toString() : details.fields['d137'],
          d138:
            transDay === 138 ? transAmount.toString() : details.fields['d138'],
          d139:
            transDay === 139 ? transAmount.toString() : details.fields['d139'],
          d140:
            transDay === 140 ? transAmount.toString() : details.fields['d140'],
          d141:
            transDay === 141 ? transAmount.toString() : details.fields['d141'],
          d142:
            transDay === 142 ? transAmount.toString() : details.fields['d142'],
          d143:
            transDay === 143 ? transAmount.toString() : details.fields['d143'],
          d144:
            transDay === 144 ? transAmount.toString() : details.fields['d144'],
          d145:
            transDay === 145 ? transAmount.toString() : details.fields['d145'],
          d146:
            transDay === 146 ? transAmount.toString() : details.fields['d146'],
          d147:
            transDay === 147 ? transAmount.toString() : details.fields['d147'],
          d148:
            transDay === 148 ? transAmount.toString() : details.fields['d148'],
          d149:
            transDay === 149 ? transAmount.toString() : details.fields['d149'],
          d150:
            transDay === 150 ? transAmount.toString() : details.fields['d150'],
          d151:
            transDay === 151 ? transAmount.toString() : details.fields['d151'],
          d152:
            transDay === 152 ? transAmount.toString() : details.fields['d152'],
          d153:
            transDay === 153 ? transAmount.toString() : details.fields['d153'],
          d154:
            transDay === 154 ? transAmount.toString() : details.fields['d154'],
          d155:
            transDay === 155 ? transAmount.toString() : details.fields['d155'],
          d156:
            transDay === 156 ? transAmount.toString() : details.fields['d156'],
          d157:
            transDay === 157 ? transAmount.toString() : details.fields['d157'],
          d158:
            transDay === 158 ? transAmount.toString() : details.fields['d158'],
          d159:
            transDay === 159 ? transAmount.toString() : details.fields['d159'],
          d160:
            transDay === 160 ? transAmount.toString() : details.fields['d160'],
          d161:
            transDay === 161 ? transAmount.toString() : details.fields['d161'],
          d162:
            transDay === 162 ? transAmount.toString() : details.fields['d162'],
          d163:
            transDay === 163 ? transAmount.toString() : details.fields['d163'],
          d164:
            transDay === 164 ? transAmount.toString() : details.fields['d164'],
          d165:
            transDay === 165 ? transAmount.toString() : details.fields['d165'],
          d166:
            transDay === 166 ? transAmount.toString() : details.fields['d166'],
          d167:
            transDay === 167 ? transAmount.toString() : details.fields['d167'],
          d168:
            transDay === 168 ? transAmount.toString() : details.fields['d168'],
          d169:
            transDay === 169 ? transAmount.toString() : details.fields['d169'],
          d170:
            transDay === 170 ? transAmount.toString() : details.fields['d170'],
          d171:
            transDay === 171 ? transAmount.toString() : details.fields['d171'],
          d172:
            transDay === 172 ? transAmount.toString() : details.fields['d172'],
          d173:
            transDay === 173 ? transAmount.toString() : details.fields['d173'],
          d174:
            transDay === 174 ? transAmount.toString() : details.fields['d174'],
          d175:
            transDay === 175 ? transAmount.toString() : details.fields['d175'],
          d176:
            transDay === 176 ? transAmount.toString() : details.fields['d176'],
          d177:
            transDay === 177 ? transAmount.toString() : details.fields['d177'],
          d178:
            transDay === 178 ? transAmount.toString() : details.fields['d178'],
          d179:
            transDay === 179 ? transAmount.toString() : details.fields['d179'],
          d180:
            transDay === 180 ? transAmount.toString() : details.fields['d180'],
          d181:
            transDay === 181 ? transAmount.toString() : details.fields['d181'],
          d182:
            transDay === 182 ? transAmount.toString() : details.fields['d182'],
          d183:
            transDay === 183 ? transAmount.toString() : details.fields['d183'],
          d184:
            transDay === 184 ? transAmount.toString() : details.fields['d184'],
          d185:
            transDay === 185 ? transAmount.toString() : details.fields['d185'],
          d186:
            transDay === 186 ? transAmount.toString() : details.fields['d186'],
          d187:
            transDay === 187 ? transAmount.toString() : details.fields['d187'],
          d188:
            transDay === 188 ? transAmount.toString() : details.fields['d188'],
          d189:
            transDay === 189 ? transAmount.toString() : details.fields['d189'],
          d190:
            transDay === 190 ? transAmount.toString() : details.fields['d190'],
          d191:
            transDay === 191 ? transAmount.toString() : details.fields['d191'],
          d192:
            transDay === 192 ? transAmount.toString() : details.fields['d192'],
          d193:
            transDay === 193 ? transAmount.toString() : details.fields['d193'],
          d194:
            transDay === 194 ? transAmount.toString() : details.fields['d194'],
          d195:
            transDay === 195 ? transAmount.toString() : details.fields['d195'],
          d196:
            transDay === 196 ? transAmount.toString() : details.fields['d196'],
          d197:
            transDay === 197 ? transAmount.toString() : details.fields['d197'],
          d198:
            transDay === 198 ? transAmount.toString() : details.fields['d198'],
          d199:
            transDay === 199 ? transAmount.toString() : details.fields['d199'],
          d200:
            transDay === 200 ? transAmount.toString() : details.fields['d200'],
          d201:
            transDay === 201 ? transAmount.toString() : details.fields['d201'],
          d202:
            transDay === 202 ? transAmount.toString() : details.fields['d202'],
          d203:
            transDay === 203 ? transAmount.toString() : details.fields['d203'],
          d204:
            transDay === 204 ? transAmount.toString() : details.fields['d204'],
          d205:
            transDay === 205 ? transAmount.toString() : details.fields['d205'],
          d206:
            transDay === 206 ? transAmount.toString() : details.fields['d206'],
          d207:
            transDay === 207 ? transAmount.toString() : details.fields['d207'],
          d208:
            transDay === 208 ? transAmount.toString() : details.fields['d208'],
          d209:
            transDay === 209 ? transAmount.toString() : details.fields['d209'],
          d210:
            transDay === 210 ? transAmount.toString() : details.fields['d210'],
          d211:
            transDay === 211 ? transAmount.toString() : details.fields['d211'],
          d212:
            transDay === 212 ? transAmount.toString() : details.fields['d212'],
          d213:
            transDay === 213 ? transAmount.toString() : details.fields['d213'],
          d214:
            transDay === 214 ? transAmount.toString() : details.fields['d214'],
          d215:
            transDay === 215 ? transAmount.toString() : details.fields['d215'],
          d216:
            transDay === 216 ? transAmount.toString() : details.fields['d216'],
          d217:
            transDay === 217 ? transAmount.toString() : details.fields['d217'],
          d218:
            transDay === 218 ? transAmount.toString() : details.fields['d218'],
          d219:
            transDay === 219 ? transAmount.toString() : details.fields['d219'],
          d220:
            transDay === 220 ? transAmount.toString() : details.fields['d220'],
          d221:
            transDay === 221 ? transAmount.toString() : details.fields['d221'],
          d222:
            transDay === 222 ? transAmount.toString() : details.fields['d222'],
          d223:
            transDay === 223 ? transAmount.toString() : details.fields['d223'],
          d224:
            transDay === 224 ? transAmount.toString() : details.fields['d224'],
          d225:
            transDay === 225 ? transAmount.toString() : details.fields['d225'],
          d226:
            transDay === 226 ? transAmount.toString() : details.fields['d226'],
          d227:
            transDay === 227 ? transAmount.toString() : details.fields['d227'],
          d228:
            transDay === 228 ? transAmount.toString() : details.fields['d228'],
          d229:
            transDay === 229 ? transAmount.toString() : details.fields['d229'],
          d230:
            transDay === 230 ? transAmount.toString() : details.fields['d230'],
          d231:
            transDay === 231 ? transAmount.toString() : details.fields['d231'],
          d232:
            transDay === 232 ? transAmount.toString() : details.fields['d232'],
          d233:
            transDay === 233 ? transAmount.toString() : details.fields['d233'],
          d234:
            transDay === 234 ? transAmount.toString() : details.fields['d234'],
          d235:
            transDay === 235 ? transAmount.toString() : details.fields['d235'],
          d236:
            transDay === 236 ? transAmount.toString() : details.fields['d236'],
          d237:
            transDay === 237 ? transAmount.toString() : details.fields['d237'],
          d238:
            transDay === 238 ? transAmount.toString() : details.fields['d238'],
          d239:
            transDay === 239 ? transAmount.toString() : details.fields['d239'],
          d240:
            transDay === 240 ? transAmount.toString() : details.fields['d240'],
          d241:
            transDay === 241 ? transAmount.toString() : details.fields['d241'],
          d242:
            transDay === 242 ? transAmount.toString() : details.fields['d242'],
          d243:
            transDay === 243 ? transAmount.toString() : details.fields['d243'],
          d244:
            transDay === 244 ? transAmount.toString() : details.fields['d244'],
          d245:
            transDay === 245 ? transAmount.toString() : details.fields['d245'],
          d246:
            transDay === 246 ? transAmount.toString() : details.fields['d246'],
          d247:
            transDay === 247 ? transAmount.toString() : details.fields['d247'],
          d248:
            transDay === 248 ? transAmount.toString() : details.fields['d248'],
          d249:
            transDay === 249 ? transAmount.toString() : details.fields['d249'],
          d250:
            transDay === 250 ? transAmount.toString() : details.fields['d250'],
          d251:
            transDay === 251 ? transAmount.toString() : details.fields['d251'],
          d252:
            transDay === 252 ? transAmount.toString() : details.fields['d252'],
          d253:
            transDay === 253 ? transAmount.toString() : details.fields['d253'],
          d254:
            transDay === 254 ? transAmount.toString() : details.fields['d254'],
          d255:
            transDay === 255 ? transAmount.toString() : details.fields['d255'],
          d256:
            transDay === 256 ? transAmount.toString() : details.fields['d256'],
          d257:
            transDay === 257 ? transAmount.toString() : details.fields['d257'],
          d258:
            transDay === 258 ? transAmount.toString() : details.fields['d258'],
          d259:
            transDay === 259 ? transAmount.toString() : details.fields['d259'],
          d260:
            transDay === 260 ? transAmount.toString() : details.fields['d260'],
          d261:
            transDay === 261 ? transAmount.toString() : details.fields['d261'],
          d262:
            transDay === 262 ? transAmount.toString() : details.fields['d262'],
          d263:
            transDay === 263 ? transAmount.toString() : details.fields['d263'],
          d264:
            transDay === 264 ? transAmount.toString() : details.fields['d264'],
          d265:
            transDay === 265 ? transAmount.toString() : details.fields['d265'],
          d266:
            transDay === 266 ? transAmount.toString() : details.fields['d266'],
          d267:
            transDay === 267 ? transAmount.toString() : details.fields['d267'],
          d268:
            transDay === 268 ? transAmount.toString() : details.fields['d268'],
          d269:
            transDay === 269 ? transAmount.toString() : details.fields['d269'],
          d270:
            transDay === 270 ? transAmount.toString() : details.fields['d270'],
          d271:
            transDay === 271 ? transAmount.toString() : details.fields['d271'],
          d272:
            transDay === 272 ? transAmount.toString() : details.fields['d272'],
          d273:
            transDay === 273 ? transAmount.toString() : details.fields['d273'],
          d274:
            transDay === 274 ? transAmount.toString() : details.fields['d274'],
          d275:
            transDay === 275 ? transAmount.toString() : details.fields['d275'],
          d276:
            transDay === 276 ? transAmount.toString() : details.fields['d276'],
          d277:
            transDay === 277 ? transAmount.toString() : details.fields['d277'],
          d278:
            transDay === 278 ? transAmount.toString() : details.fields['d278'],
          d279:
            transDay === 279 ? transAmount.toString() : details.fields['d279'],
          d280:
            transDay === 280 ? transAmount.toString() : details.fields['d280'],
          d281:
            transDay === 281 ? transAmount.toString() : details.fields['d281'],
          d282:
            transDay === 282 ? transAmount.toString() : details.fields['d282'],
          d283:
            transDay === 283 ? transAmount.toString() : details.fields['d283'],
          d284:
            transDay === 284 ? transAmount.toString() : details.fields['d284'],
          d285:
            transDay === 285 ? transAmount.toString() : details.fields['d285'],
          d286:
            transDay === 286 ? transAmount.toString() : details.fields['d286'],
          d287:
            transDay === 287 ? transAmount.toString() : details.fields['d287'],
          d288:
            transDay === 288 ? transAmount.toString() : details.fields['d288'],
          d289:
            transDay === 289 ? transAmount.toString() : details.fields['d289'],
          d290:
            transDay === 290 ? transAmount.toString() : details.fields['d290'],
          d291:
            transDay === 291 ? transAmount.toString() : details.fields['d291'],
          d292:
            transDay === 292 ? transAmount.toString() : details.fields['d292'],
          d293:
            transDay === 293 ? transAmount.toString() : details.fields['d293'],
          d294:
            transDay === 294 ? transAmount.toString() : details.fields['d294'],
          d295:
            transDay === 295 ? transAmount.toString() : details.fields['d295'],
          d296:
            transDay === 296 ? transAmount.toString() : details.fields['d296'],
          d297:
            transDay === 297 ? transAmount.toString() : details.fields['d297'],
          d298:
            transDay === 298 ? transAmount.toString() : details.fields['d298'],
          d299:
            transDay === 299 ? transAmount.toString() : details.fields['d299'],
          d300:
            transDay === 300 ? transAmount.toString() : details.fields['d300'],
          d301:
            transDay === 301 ? transAmount.toString() : details.fields['d301'],
          d302:
            transDay === 302 ? transAmount.toString() : details.fields['d302'],
          d303:
            transDay === 303 ? transAmount.toString() : details.fields['d303'],
          d304:
            transDay === 304 ? transAmount.toString() : details.fields['d304'],
          d305:
            transDay === 305 ? transAmount.toString() : details.fields['d305'],
          d306:
            transDay === 306 ? transAmount.toString() : details.fields['d306'],
          d307:
            transDay === 307 ? transAmount.toString() : details.fields['d307'],
          d308:
            transDay === 308 ? transAmount.toString() : details.fields['d308'],
          d309:
            transDay === 309 ? transAmount.toString() : details.fields['d309'],
          d310:
            transDay === 310 ? transAmount.toString() : details.fields['d310'],
          d311:
            transDay === 311 ? transAmount.toString() : details.fields['d311'],
          d312:
            transDay === 312 ? transAmount.toString() : details.fields['d312'],
          d313:
            transDay === 313 ? transAmount.toString() : details.fields['d313'],
          d314:
            transDay === 314 ? transAmount.toString() : details.fields['d314'],
          d315:
            transDay === 315 ? transAmount.toString() : details.fields['d315'],
          d316:
            transDay === 316 ? transAmount.toString() : details.fields['d316'],
          d317:
            transDay === 317 ? transAmount.toString() : details.fields['d317'],
          d318:
            transDay === 318 ? transAmount.toString() : details.fields['d318'],
          d319:
            transDay === 319 ? transAmount.toString() : details.fields['d319'],
          d320:
            transDay === 320 ? transAmount.toString() : details.fields['d320'],
          d321:
            transDay === 321 ? transAmount.toString() : details.fields['d321'],
          d322:
            transDay === 322 ? transAmount.toString() : details.fields['d322'],
          d323:
            transDay === 323 ? transAmount.toString() : details.fields['d323'],
          d324:
            transDay === 324 ? transAmount.toString() : details.fields['d324'],
          d325:
            transDay === 325 ? transAmount.toString() : details.fields['d325'],
          d326:
            transDay === 326 ? transAmount.toString() : details.fields['d326'],
          d327:
            transDay === 327 ? transAmount.toString() : details.fields['d327'],
          d328:
            transDay === 328 ? transAmount.toString() : details.fields['d328'],
          d329:
            transDay === 329 ? transAmount.toString() : details.fields['d329'],
          d330:
            transDay === 330 ? transAmount.toString() : details.fields['d330'],
          d331:
            transDay === 331 ? transAmount.toString() : details.fields['d331'],
          d332:
            transDay === 332 ? transAmount.toString() : details.fields['d332'],
          d333:
            transDay === 333 ? transAmount.toString() : details.fields['d333'],
          d334:
            transDay === 334 ? transAmount.toString() : details.fields['d334'],
          d335:
            transDay === 335 ? transAmount.toString() : details.fields['d335'],
          d336:
            transDay === 336 ? transAmount.toString() : details.fields['d336'],
          d337:
            transDay === 337 ? transAmount.toString() : details.fields['d337'],
          d338:
            transDay === 338 ? transAmount.toString() : details.fields['d338'],
          d339:
            transDay === 339 ? transAmount.toString() : details.fields['d339'],
          d340:
            transDay === 340 ? transAmount.toString() : details.fields['d340'],
          d341:
            transDay === 341 ? transAmount.toString() : details.fields['d341'],
          d342:
            transDay === 342 ? transAmount.toString() : details.fields['d342'],
          d343:
            transDay === 343 ? transAmount.toString() : details.fields['d343'],
          d344:
            transDay === 344 ? transAmount.toString() : details.fields['d344'],
          d345:
            transDay === 345 ? transAmount.toString() : details.fields['d345'],
          d346:
            transDay === 346 ? transAmount.toString() : details.fields['d346'],
          d347:
            transDay === 347 ? transAmount.toString() : details.fields['d347'],
          d348:
            transDay === 348 ? transAmount.toString() : details.fields['d348'],
          d349:
            transDay === 349 ? transAmount.toString() : details.fields['d349'],
          d350:
            transDay === 350 ? transAmount.toString() : details.fields['d350'],
          d351:
            transDay === 351 ? transAmount.toString() : details.fields['d351'],
          d352:
            transDay === 352 ? transAmount.toString() : details.fields['d352'],
          d353:
            transDay === 353 ? transAmount.toString() : details.fields['d353'],
          d354:
            transDay === 354 ? transAmount.toString() : details.fields['d354'],
          d355:
            transDay === 355 ? transAmount.toString() : details.fields['d355'],
          d356:
            transDay === 356 ? transAmount.toString() : details.fields['d356'],
          d357:
            transDay === 357 ? transAmount.toString() : details.fields['d357'],
          d358:
            transDay === 358 ? transAmount.toString() : details.fields['d358'],
          d359:
            transDay === 359 ? transAmount.toString() : details.fields['d359'],
          d360:
            transDay === 360 ? transAmount.toString() : details.fields['d360'],
          d361:
            transDay === 361 ? transAmount.toString() : details.fields['d361'],
          d362:
            transDay === 362 ? transAmount.toString() : details.fields['d362'],
          d363:
            transDay === 363 ? transAmount.toString() : details.fields['d363'],
          d364:
            transDay === 364 ? transAmount.toString() : details.fields['d364'],
          d365:
            transDay === 365 ? transAmount.toString() : details.fields['d365'],
          d366:
            transDay === 366 ? transAmount.toString() : details.fields['d366'],
        },
      },
    ],
    function (err) {
      if (err) {
        console.error(err);
        return;
      } else {
        updatePrincipalAmount(transiSMLRP, details, currentuser);
      }
    }
  );
};

//Update Loan Principal Amount
const updatePrincipalAmount = async (transiSMLRP, details, currentuser) => {
  let totalPAmount = 0;
  let loanrefid = '';
  let pAmount = 0;

  let filter = "AND({loanid} = '".concat(
    details.fields['loanid'],
    "',{transactiontype}='principalamount')"
  );

  transiSMLRP('transaction')
    .select({ view: 'Transactions', filterByFormula: filter })
    .eachPage(
      function page(records, fetchNextPage) {
        records.forEach(function (record) {
          for (let i = 1; i <= 366; i++) {
            if (record.fields['d'.concat(i)]) {
              if (parseFloat(record.fields['d'.concat(i)]) > 0) {
                totalPAmount += parseFloat(record.fields['d'.concat(i)]);
              }
            }
          }
        });
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        } else {
          //if (totalPAmount > 0) {
          filter = "AND({loanid} = '".concat(details.fields['loanid'], "')");
          baseiSMLRP('loan')
            .select({ view: 'Loans', filterByFormula: filter })
            .eachPage(
              (records, fetchNextPage) => {
                loanrefid = records[0].id;
                pAmount = parseFloat(records[0].fields['loanamount']);
                fetchNextPage();
              },
              function done(err) {
                if (err) {
                  console.error(err);
                  return;
                } else {
                  baseiSMLRP('loan').update(
                    [
                      {
                        id: loanrefid,
                        fields: {
                          //status: 'Paying',
                          principalamountbalance: pAmount - totalPAmount,
                          modifiedby: currentuser,
                        },
                      },
                    ],
                    function (err) {
                      if (err) {
                        console.error(err);
                        return;
                      }
                      updateInterestAmount(transiSMLRP, details, currentuser);
                    }
                  );
                }
              }
            );
          //}
        }
      }
    );
};

//Update Loan Interest Amount
function updateInterestAmount(transiSMLRP, details, currentuser) {
  let totalIAmount = 0;
  let loanrefid = '';
  let iAmount = 0;

  let filter = "AND({loanid} = '".concat(
    details.fields['loanid'],
    "',{transactiontype}='interestamount')"
  );

  transiSMLRP('transaction')
    .select({ view: 'Transactions', filterByFormula: filter })
    .eachPage(
      function page(records, fetchNextPage) {
        records.forEach(function (record) {
          for (let i = 1; i <= 366; i++) {
            if (record.fields['d'.concat(i)]) {
              if (parseFloat(record.fields['d'.concat(i)]) > 0) {
                totalIAmount += parseFloat(record.fields['d'.concat(i)]);
              }
            }
          }
        });
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        } else {
          filter = "AND({loanid} = '".concat(details.fields['loanid'], "')");
          baseiSMLRP('loan')
            .select({ view: 'Loans', filterByFormula: filter })
            .eachPage(
              (records, fetchNextPage) => {
                loanrefid = records[0].id;
                iAmount =
                  parseFloat(records[0].fields['monthlyinterestpayment']) *
                  parseFloat(records[0].fields['payingperiod']);
                fetchNextPage();
              },
              function done(err) {
                if (err) {
                  console.error(err);
                  return;
                } else {
                  baseiSMLRP('loan').update(
                    [
                      {
                        id: loanrefid,
                        fields: {
                          //status: 'Paying',
                          interestamountbalance: iAmount - totalIAmount,
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
              }
            );
        }
      }
    );
}
