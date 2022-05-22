import React, { useState, useEffect } from 'react';
import Controls from '../../components/Controls/Controls';
import TempTable from '../../components/Template/TempTable';
import { baseiSMLRP } from '../../api/Api';
import { Search } from '@material-ui/icons';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import {
  Container,
  CssBaseline,
  Paper,
  makeStyles,
  withStyles,
  TableBody,
  TableRow,
  TableCell,
  Toolbar,
  InputAdornment,
  TableContainer,
  IconButton,
  LinearProgress,
  Box,
} from '@material-ui/core';
import * as borrowerService from '../../services/BorrowerServices';

//Theme style alteration
const useStyles = makeStyles((theme) => ({
  pageContent: {
    padding: theme.spacing(2),
  },

  searchField: {
    position: 'absolute',
    left: '1px',
    width: '100',
  },

  searchInput: {
    width: '70%',
  },

  newButton: {
    position: 'absolute',
    right: '0px',
  },

  clearButton: {
    position: 'absolute',
    right: '80px',
  },

  tableRow: {
    '&$selected, &$selected:hover': {
      backgroundColor: '#e6f5ec',
    },

    padding: 'none',
  },

  selected: {},
}));

//Alternate row color layout
const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },

    '&$selected, &$selected:hover': {
      backgroundColor: '#e6f5ec',
    },
  },

  selected: {},
}))(TableRow);

//Table header information
const headCells = [
  { id: 'actions', label: 'Actions', disableSorting: true, minWidth: 115 },
  { id: 'borrowerid', label: 'Borrower ID', minWidth: 160 },
  { id: 'borrowername', label: 'Borrower Name', minWidth: 200 },
];

export default function BorrowerLookup(props) {
  // eslint-disable-next-line
  const { lookupData } = props;
  const classes = useStyles();
  const [selectedID, setSelectedID] = useState(null);
  const [borrower, setBorrower] = useState([]);
  const [searchField, setSearchField] = useState('borrowerid');
  const [isLoading, setLoading] = useState(true);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });

  //Handle search event
  const handleSearch = (e) => {
    let target = e.target;
    setFilterFn({
      fn: (items) => {
        if (target.value === '') return items;
        else
          return items.filter((x) =>
            x.fields[searchField].toLowerCase().includes(target.value)
          );
      },
    });
  };

  //Handle submit button
  const handleSubmit = (data) => {
    lookupData(data);
  };

  //Get Borrower data from airtable
  const GetBorrowerCollection = () => {
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
              setLoading(false);
            }
          }
        );
    }, []);
  };

  //Call function to load borrower list
  GetBorrowerCollection();

  //Load Borrower Table
  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    TempTable(borrower, headCells, filterFn);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Paper className={classes.pageContent}>
          <TableContainer className={classes.tableContainer}>
            <Toolbar variant="dense">
              <Controls.Select
                label=""
                name="Search Field"
                value={searchField}
                className={classes.searchField}
                options={borrowerService.getBorrowerSearch()}
                onChange={(e) => {
                  setSearchField(e.target.value);
                }}
              />
              <Controls.Input
                label=" "
                className={classes.searchInput}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                onChange={handleSearch}
              />
            </Toolbar>
            {isLoading ? (
              <Box sx={{ width: '100%' }}>
                <LinearProgress />
                Loading...
              </Box>
            ) : (
              <TblContainer>
                <TblHead />
                <TableBody>
                  {recordsAfterPagingAndSorting().map((item, index) => (
                    <StyledTableRow
                      key={index}
                      onClick={() => {
                        setSelectedID(index);
                      }}
                      selected={selectedID === index}
                      classes={{ selected: classes.selected }}
                      className={classes.tableRow}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="Refresh"
                          onClick={() => {
                            handleSubmit(item);
                          }}
                        >
                          <CheckOutlinedIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{item.fields['borrowerid']}</TableCell>
                      <TableCell>{item.fields['borrowername']}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </TblContainer>
            )}
            <TblPagination />
          </TableContainer>
        </Paper>
      </Container>
    </React.Fragment>
  );
}
