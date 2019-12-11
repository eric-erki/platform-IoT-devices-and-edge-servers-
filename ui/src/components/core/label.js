import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

const Label = styled.span`
margin-bottom: 4px;
font-size: 14px;
${space} ${color} ${typography}
`;

Label.defaultProps = {
  color: 'whites.8',
  fontWeight: 4,
};

export default Label;
