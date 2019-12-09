import React from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';

import { Box, Column, Row } from './core';

const Container = styled(Column)``;

Container.defaultProps = { borderRadius: 1, borderColor: 'white' };

const Header = styled(Row)`
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
`;

Header.defaultProps = {
  fontSize: 1,
  fontWeight: 4,
  color: 'black',
  borderColor: 'white',
  bg: 'white',
};

const Cell = styled(Row)`
  flex: 1 0 0%;
  overflow: hidden;
`;

const CellContent = styled(Box)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const TableRow = styled(Row)`
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  cursor: ${props => (props.selectable ? 'pointer' : 'default')};

  &:hover {
    background-color: ${props => (props.selectable ? '#141414' : 'black')};
  }

  &:first-child {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }
`;

Cell.defaultProps = {
  padding: 3,
};

const Table = ({ columns, data, onRowSelect }) => {
  const selectable = !!onRowSelect;
  onRowSelect = onRowSelect || function() {};
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  );

  if (rows.length === 0) {
    return <Row marginTop={-5} />;
  }

  return (
    <Container {...getTableProps()}>
      <Header flex={1}>
        {headerGroups.map(headerGroup => (
          <Row flex={1} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <Cell {...column.getHeaderProps(column.getSortByToggleProps())}>
                <CellContent>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </CellContent>
              </Cell>
            ))}
          </Row>
        ))}
      </Header>
      <Column {...getTableBodyProps()}>
        {rows.slice(0, 10).map((row, i) => {
          prepareRow(row);
          return (
            <TableRow
              {...row.getRowProps()}
              selectable={selectable}
              onClick={() => onRowSelect(data[row.index])}
            >
              {row.cells.map(cell => (
                <Cell {...cell.getCellProps()}>
                  <CellContent>{cell.render('Cell')}</CellContent>
                </Cell>
              ))}
            </TableRow>
          );
        })}
      </Column>
    </Container>
  );
};

export default Table;
