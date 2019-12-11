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
    font-family: 'Rubik', "Roboto", sans-serif;
    
    font-size: 16px;
    font-weight: 400;
    line-height: 1.2;
    background-color: ${props => props.theme.colors.background};
  }

  body {
    margin: 0;
    padding: 0;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  html, body, main, #root, #root > div  {
    height: 100%;
  }
`;

const Page = ({ children }) => {
  const route = useCurrentRoute();
  return (
    <>
      <Helmet>
        {route.title && <title>{`${route.title} - Deviceplane`}</title>}
        <link
          href={`https://fonts.googleapis.com/css?family=Rubik&display=swap`}
          rel="stylesheet"
        />
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
