import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

const Label = styled.span`
margin-bottom: 8px;
${space} ${color} ${typography}
`;

Label.defaultProps = {
  color: 'white',
  fontWeight: 4,
  fontSize: 3,
};

export default Label;
