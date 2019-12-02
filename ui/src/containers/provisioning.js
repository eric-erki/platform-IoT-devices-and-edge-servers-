import React, { useEffect, useState } from 'react';
import { Table, majorScale } from 'evergreen-ui';
import moment from 'moment';
import { useNavigation } from 'react-navi';

import { labelColors } from '../theme';
import { buildLabelColorMap, renderLabels } from '../helpers/labels';
import Layout from '../components/layout';
import Card from '../components/card';

const Provisioning = ({
  route: {
    data: { params, deviceRegistrationTokens },
  },
}) => {
  console.log(deviceRegistrationTokens);
  const navigation = useNavigation();
  const [labelColorMap, setLabelColorMap] = useState();

  useEffect(() => {
    setLabelColorMap(
      buildLabelColorMap({}, labelColors, deviceRegistrationTokens)
    );
  }, []);

  return (
    <Layout title="Provisioning">
      <Card
        title="Device Registration Tokens"
        size="full"
        actions={[
          {
            href: 'deviceregistrationtokens/create',
            title: 'Create Device Registration Token',
          },
        ]}
      >
        <Table>
          <Table.Head>
            <Table.TextHeaderCell flexBasis={100}>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={50}>
              Created At
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={50}>
              Devices Registered
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={50}>
              Registration Limit
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={150}>Labels</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {deviceRegistrationTokens.map(token => (
              <Table.Row
                key={token.id}
                isSelectable
                onSelect={() =>
                  navigation.navigate(
                    `deviceregistrationtokens/${token.name}/overview`
                  )
                }
                flexGrow={1}
                height="auto"
                paddingY={majorScale(1)}
                alignItems="flex-start"
              >
                <Table.TextCell flexBasis={100}>{token.name}</Table.TextCell>
                <Table.TextCell flexBasis={50}>
                  {token.createdAt ? moment(token.createdAt).fromNow() : '-'}
                </Table.TextCell>
                <Table.TextCell flexBasis={50}>
                  {token.deviceCounts.allCount}
                </Table.TextCell>
                <Table.TextCell flexBasis={50}>
                  {typeof token.maxRegistrations === 'number'
                    ? token.maxRegistrations
                    : 'unlimited'}
                </Table.TextCell>
                <Table.TextCell flexBasis={150}>
                  {renderLabels(token.labels, labelColorMap)}
                </Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </Layout>
  );
};

export default Provisioning;

// class Provisioning extends Component {
//   constructor(props) {
//     super(props);

//     const palletteArray = Object.values(this.props.theme.palette);

//     this.labelColors = [
//       ...palletteArray.map(colors => colors.base),
//       ...palletteArray.map(colors => colors.dark),
//     ];

//     this.state = {
//       deviceRegistrationTokens: [],
//     };
//   }

//   componentDidMount() {
//     axios
//       .get(
//         `${config.endpoint}/projects/${this.props.projectName}/deviceregistrationtokens?full`,
//         {
//           withCredentials: true,
//         }
//       )
//       .then(response => {

//         this.setState({
//           deviceRegistrationTokens: response.data,
//           labelColorMap,
//         });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }

//   render() {
//     return (

//     );
//   }
// }

// export default withTheme(Provisioning);
