import styled from 'styled-components';
import {
  typography,
  color,
  space,
  layout,
  border,
  shadow,
} from 'styled-system';

const Input = styled.input`
  border: 1px solid #161616;
  outline: none;
  margin: 0;
  transition: border-color 150ms;

  &:focus {
    border-color: ${props => props.theme.colors.white};
  }

  &::placeholder {
    font-size: 16px;
    color: inherit;
    opacity: .75;
  }

  &:-internal-autofill-selected {
    background: #181818 !important;
  }

  ${space} ${border} ${layout} ${color} ${typography} ${shadow}
`;

Input.defaultProps = {
  color: 'white',
  bg: '#161616',
  padding: 3,
  borderRadius: 1,
  boxShadow: 0,
  fontSize: 2,
};

export default Input;
