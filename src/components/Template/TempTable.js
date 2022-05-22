import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  makeStyles,
  TablePagination,
  TableSortLabel,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  table: {
    marginTop: theme.spacing(3),
    '& thead th': {
      fontWeight: '600',
      color: '#ffffff',
      backgroundColor: '#27ae61',
    },
    '& tbody td': {
      fontWeight: '300',
    },
    '& tbody tr:hover': {
      backgroundColor: '#f5f2e9',
      cursor: 'pointer',
    },
    size: 'small',
  },
}));

export default function TempTable(records, headCells, filterFn) {
  const classes = useStyles();
  const pages = [10];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pages[page]);
  const [order, setOrder] = useState();
  const [orderBy, setOrderBy] = useState();

  const TblContainer = (props) => (
    <Table className={classes.table}>{props.children}</Table>
  );

  const TblHead = (props) => {
    const handleSortRequest = (cellId) => {
      const isAsc = orderBy === cellId && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(cellId);
    };

    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              size="small"
              key={headCell.id}
              sortDirection={orderBy === headCell.id ? order : false}
              style={{
                minWidth: headCell.minWidth,
              }}
            >
              {headCell.disableSorting ? (
                headCell.label
              ) : (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={() => {
                    handleSortRequest(headCell.id);
                  }}
                >
                  {headCell.label}
                </TableSortLabel>
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const TblPagination = () => (
    <TablePagination
      component="div"
      page={page}
      rowsPerPageOptions={pages}
      rowsPerPage={rowsPerPage}
      count={records.length}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index + 1]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0].fields, b[0].fields);
      if (order !== 0) return order;
      else {
        return a[1].fields - b[1].fields;
      }
    });

    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  const recordsAfterPagingAndSorting = () => {
    return stableSort(
      filterFn.fn(records),
      getComparator(order, orderBy)
    ).slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  };

  return {
    TblContainer,
    TblHead,
    TblPagination,
    recordsAfterPagingAndSorting,
  };
}
