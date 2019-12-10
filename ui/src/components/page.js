import React from 'react';
import { NotFoundBoundary, useCurrentRoute } from 'react-navi';
import { createGlobalStyle } from 'styled-components/macro';
import { Helmet } from 'react-helmet-async';

import { Box } from './core';
import NotFound from './not-found';

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
  }

  body {
    margin: 0;
    padding: 0;
    text-rendering: optimizelegibility;
    -webkit-font-smoothing: antialiased;
  }

  html, body, main, #root, #root > div  {
    height: 100%;
  }
`;

const Page = ({ children }) => {
  const route = useCurrentRoute();
  console.log(route);
  return (
    <>
      <Helmet>
        {route.title && <title>{`${route.title} - Deviceplane`}</title>}
      </Helmet>
      <GlobalStyle />
      <Box>
        <main>
          <NotFoundBoundary render={NotFound}>{children}</NotFoundBoundary>
        </main>
      </Box>
    </>
  );
};

export default Page;
