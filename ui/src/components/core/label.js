import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

const Label = styled.label`
${space} ${color} ${typography}
`;

Label.defaultProps = {
  color: 'white',
  fontWeight: 3,
};

export default Label;
