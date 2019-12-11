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
  border: 1px solid ${props => props.theme.colors.black};
  outline: none;
  margin: 0;
  padding: 10px;
  transition: border-color 150ms;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    font-size: 16px;
    color: inherit;
    opacity: .75;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active  {
      -webkit-box-shadow: 0 0 0 30px ${props =>
        props.theme.colors.inputBackground} inset !important;
  }

  ${space} ${border} ${layout} ${color} ${typography} ${shadow}
`;

Input.defaultProps = {
  color: 'whites.9',
  bg: 'inputBackground',
  padding: 3,
  borderRadius: 1,
  fontWeight: 2,
  boxShadow: 0,
  fontSize: 2,
};

export default Input;
