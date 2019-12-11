import styled from 'styled-components';
import { space, border, flexbox, typography } from 'styled-system';

const Group = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: ${props => props.theme.sizes[5]}px;

    &:last-child {
        margin-bottom: 0;
    }

    ${space} ${border} ${flexbox} ${typography}
`;

export default Group;
