import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import PrivateRoute from '../pages/Login/PrivateRoute';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Home/Dashboard';
import ForgotPassword from '../pages/Login/ForgotPassword';
import Borrower from '../pages/Borrower/Borrower';
import Loan from '../pages/Loan/Loan';
import Ledger from '../pages/Ledger/Ledger';
import Transaction from '../pages/Transaction/Transaction';
import Report from './Report/Report';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <PrivateRoute exact path="/" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <PrivateRoute path="/Borrower" exact component={Borrower} />
          <PrivateRoute path="/Loan" exact component={Loan} />
          <PrivateRoute path="/Transaction" exact component={Transaction} />
          <PrivateRoute path="/Ledger" exact component={Ledger} />
          <PrivateRoute path="/Report" exact component={Report} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
