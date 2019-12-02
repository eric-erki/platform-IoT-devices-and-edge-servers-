import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Router, View } from 'react-navi';
import HelmetProvider from 'react-navi-helmet-async';
import { Provider } from 'react-redux';

import routes from './routes';
import * as serviceWorker from './serviceWorker';
import store from './store';

import Page from './components/page';

const App = () => {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <Router routes={routes}>
          <Page>
            <Suspense fallback={null}>
              <View />
            </Suspense>
          </Page>
        </Router>
      </HelmetProvider>
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
