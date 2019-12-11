import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

const Value = styled.span`
    word-wrap: break-word;
    ${color} ${space} ${typography}
`;

Value.defaultProps = {
  color: 'grays.7',
  fontSize: 2,
};

export default Value;
