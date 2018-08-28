import CircularProgress from '@material-ui/core/CircularProgress';
import { DrizzleProvider } from 'drizzle-react';
import { LoadingContainer } from 'drizzle-react-components';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Router } from 'react-router';
import App from './App';
import drizzleOptions from './drizzleOptions';
import { history, store } from './store';

const LoadingComp = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}
  >
    <CircularProgress />
  </div>
);

ReactDOM.render(
  <DrizzleProvider options={drizzleOptions} store={store}>
    <LoadingContainer loadingComp={<LoadingComp />}>
      <Router history={history} store={store}>
        <Route exact path="/" component={App} />
      </Router>
    </LoadingContainer>
  </DrizzleProvider>,
  document.getElementById('root')
);
