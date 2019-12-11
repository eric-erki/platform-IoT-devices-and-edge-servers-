import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

const Text = styled.span`
word-wrap: break-word;
  ${color} ${space} ${typography}
`;

Text.defaultProps = {
  color: 'white',
};

export default Text;
