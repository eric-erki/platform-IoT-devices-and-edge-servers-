import React from 'react';
import { useLoadingRoute, NotFoundBoundary } from 'react-navi';
import { ThemeProvider } from 'styled-components';
import { createGlobalStyle } from 'styled-components/macro';

import theme from '../theme';
import { Box } from './core';
import NotFound from './not-found';
import Spinner from './spinner';

const GlobalStyle = createGlobalStyle`
  * {
      box-sizing: inherit;
  }

  html {
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue",
      sans-serif;
    
    font-size: 16px;
    font-weight: 400;
    line-height: 1.2;
    background-color: #222222;

    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body {
    margin: 0;
    padding: 0;
  }

  html, body, main, #root, #root > div  {
    height: 100%;
  }
`;

const Page = ({ children, light }) => {
  const loadingRoute = useLoadingRoute();

  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyle theme={theme} />
        <Box>
          <Spinner show={!!loadingRoute} />
          <main>
            <NotFoundBoundary render={NotFound}>{children}</NotFoundBoundary>
          </main>
        </Box>
      </>
    </ThemeProvider>
  );
};

export default Page;
