import React from 'react';
import { useTable, useSortBy } from 'react-table';
import styled from 'styled-components';

import { Box, Column, Row } from './core';

const Container = styled(Column)``;

Container.defaultProps = { borderRadius: 1, borderColor: 'white' };

const Cell = styled(Row)`
  flex: 1 0 0%;
  overflow: hidden;
`;

Cell.defaultProps = {
  padding: 3,
};

const CellContent = styled(Box)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const TableRow = styled(Row)`
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  cursor: ${props => (props.selectable ? 'pointer' : 'default')};
  transition: background-color 150ms;

  &:hover {
    background-color: ${props =>
      props.selectable ? '#121212' : props.theme.colors.black};
  }
`;

const Header = styled(Row)`
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
`;

Header.defaultProps = {
  fontSize: 1,
  fontWeight: 4,
  color: 'white',
  bg: '#202020',
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
              <Cell
                {...column.getHeaderProps(column.getSortByToggleProps())}
                style={column.style}
              >
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
                <Cell {...cell.getCellProps()} style={cell.column.style || {}}>
                  <CellContent style={cell.column.cellStyle || {}}>
                    {cell.render('Cell')}
                  </CellContent>
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
