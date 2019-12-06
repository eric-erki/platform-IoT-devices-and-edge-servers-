import styled from 'styled-components';
import { space, color, typography, border, shadow } from 'styled-system';

const Textarea = styled.textarea`
border: none;
outline: none;
appearance: none;
${space} ${color} ${typography} ${border} ${shadow}
`;

Textarea.defaultProps = {
  color: 'white',
  bg: 'background',
  borderRadius: 1,
  boxShadow: 0,
  padding: 3,
  fontSize: 2,
};

export default Textarea;
