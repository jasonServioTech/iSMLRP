//Add value to date parameter by day or month or year
export function DateAddVal(dateVal, addValue, dateType) {
  let oldDate = new Date(dateVal);
  let newDate = new Date();
  Date.isLeapYear = function (year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  Date.getDaysInMonth = function (year, month) {
    return [
      31,
      Date.isLeapYear(year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ][month];
  };

  // eslint-disable-next-line
  Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear());
  };

  // eslint-disable-next-line
  Date.prototype.getDaysInMonth = function () {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
  };

  // eslint-disable-next-line
  Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
  };

  // eslint-disable-next-line
  Date.prototype.addDays = function (value) {
    this.setDate(this.getDate() + value);
    return this;
  };

  if (dateType === 'month') {
    newDate = oldDate.addMonths(addValue);
  }
  if (dateType === 'days') {
    newDate = oldDate.addDays(addValue);
  }

  return newDate;
}

//Get date month name
export function GetMonthName(dateVal) {
  let monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let newMonthName = monthNames[dateVal.getMonth()];

  return newMonthName;
}
