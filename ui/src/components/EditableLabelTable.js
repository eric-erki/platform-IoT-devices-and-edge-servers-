import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toaster, Icon } from 'evergreen-ui';

import utils from '../utils';
import Card from './card';
import { Text, Row, Button, Input, Label } from './core';
import Table from './table';

const CellInput = styled(Input)`
  width: 100%;
`;

CellInput.defaultProps = {
  padding: 1,
};

const EditableCell = ({ mode, value, autoFocus }) => {
  if (mode === 'edit') {
    return <CellInput autoFocus={autoFocus} />;
  }
  return <Text>{value}</Text>;
};

const EditableLabelTable = ({ data }) => {
  const [labels, setLabels] = useState([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState();

  useEffect(() => {
    setLabels(
      Object.keys(data)
        .map(key => ({ key, value: data[key], mode: 'default' }))
        .sort((a, b) => {
          if (a.key < b.key) {
            return -1;
          }
          if (a.key > b.key) {
            return 1;
          }
          return 0;
        })
    );
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Key',
        Cell: ({ row: { original } }) => (
          <EditableCell mode={original.mode} value={original.key} autoFocus />
        ),
      },
      {
        Header: 'Value',
        Cell: ({ row: { original } }) => (
          <EditableCell mode={original.mode} value={original.key} />
        ),
      },
      {
        Header: ' ',
        Cell: ({ row: { index, original } }) => {
          if (original.mode === 'edit') {
            return (
              <Row>
                <Button
                  title={<Icon icon="floppy-disk" size={18} color="#6fccff" />}
                  onClick={() => saveLabel(index)}
                  variant="icon"
                  color="primary"
                />
                <Button
                  title={<Icon icon="cross" size={18} color="white" />}
                  variant="icon"
                  marginLeft={4}
                  onClick={() => cancelEdit(index)}
                />
              </Row>
            );
          }
          return (
            <Row>
              <Button
                title="Edit"
                variant="text"
                color="primary"
                onClick={() => setEdit(index)}
              />
              <Button title="Delete" variant="text" marginLeft={4} />
            </Row>
          );
        },
        cellStyle: {
          display: 'flex',
          flex: 1,
          justifyContent: 'flex-end',
        },
      },
    ],
    []
  );
  const tableData = useMemo(() => labels, [labels]);

  const addLabel = (label = { key: '', value: '', mode: 'edit' }) => {
    setLabels([...labels, label]);
  };

  const handleUpdate = (i, property) => {
    return event => {
      var labels = this.state.labels;
      labels[i][property] = event.target.value;
      this.setState({
        labels: labels,
      });
    };
  };

  const saveLabel = () => {};

  const setEdit = index => {
    setLabels(
      labels.map((label, i) =>
        index === i ? { ...label, mode: 'edit' } : label
      )
    );
  };

  const cancelEdit = index => {
    setLabels(
      labels.map((label, i) =>
        index === i ? { ...label, mode: 'default' } : label
      )
    );
  };

  const setLabel = (key, value, i) => {
    var updatedLabels = this.state.labels;
    var keyValidationMessage = utils.checkName('key', key);
    var valueValidationMessage = utils.checkName('value', value);

    if (keyValidationMessage === null) {
      for (var j = 0; j < updatedLabels.length; j++) {
        if (i !== j && key === updatedLabels[j]['key']) {
          keyValidationMessage = 'Key already exists.';
          break;
        }
      }
    }

    updatedLabels[i]['keyValidationMessage'] = keyValidationMessage;
    updatedLabels[i]['valueValidationMessage'] = valueValidationMessage;

    this.setState({
      labels: updatedLabels,
    });

    if (
      keyValidationMessage === null &&
      valueValidationMessage === null &&
      key !== null &&
      value !== null
    ) {
      axios
        .put(
          this.props.setEndpoint,
          {
            key: key,
            value: value,
          },
          {
            withCredentials: true,
          }
        )
        .then(response => {
          var updatedLabels = this.state.labels;
          updatedLabels[i]['mode'] = 'default';
          this.setState({
            labels: updatedLabels,
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const deleteLabel = (key, i) => {
    if (key !== '') {
      axios
        .delete(this.props.deleteEndpoint + `/${key}`, {
          withCredentials: true,
        })
        .then(response => {
          var removedLabels = this.state.labels;
          removedLabels.splice(i, 1);
          this.setState({
            labels: removedLabels,
          });
        })
        .catch(error => {
          var hideRemoveDialogLabels = this.state.labels;
          hideRemoveDialogLabels[i]['showRemoveDialog'] = false;
          this.setState({
            labels: hideRemoveDialogLabels,
          });
          toaster.danger('Label was not removed.');
          console.log(error);
        });
    } else {
      var removedLabels = this.state.labels;
      removedLabels.splice(i, 1);
      this.setState({
        labels: removedLabels,
      });
    }
  };

  return (
    <Card
      title="Labels"
      size="xlarge"
      actions={[{ title: 'Add Label', onClick: () => addLabel() }]}
    >
      <Table
        columns={columns}
        data={tableData}
        placeholder={
          <Text>
            There are no <strong>Labels</strong>.
          </Text>
        }
      />
    </Card>
  );

  // renderLabel(Label, i) {
  //   switch (Label.mode) {
  //     case 'default':
  //       return (
  //         <Fragment key={Label.key}>
  //           <Table.Row>
  //             <Table.TextCell>{Label.key}</Table.TextCell>
  //             <Table.TextCell>{Label.value}</Table.TextCell>
  //             <Table.TextCell flexBasis={75} flexShrink={0} flexGrow={0}>
  //               <Pane display="flex">
  //                 <IconButton
  //                   icon="edit"
  //                   height={24}
  //                   appearance="minimal"
  //                   onClick={() => this.setEdit(i)}
  //                 />
  //                 <IconButton
  //                   icon="trash"
  //                   height={24}
  //                   appearance="minimal"
  //                   onClick={() => this.setShowRemoveDialog(i)}
  //                 />
  //               </Pane>
  //             </Table.TextCell>
  //           </Table.Row>
  //           <Pane>
  //             <Dialog
  //               isShown={Label.showRemoveDialog}
  //               title="Remove Label"
  //               intent="danger"
  //               onCloseComplete={() => this.hideShowRemoveDialog(i)}
  //               onConfirm={() => this.deleteLabel(Label.key, i)}
  //               confirmLabel="Remove Label"
  //             >
  //               You are about to remove label <strong>{Label.key}</strong>.
  //             </Dialog>
  //           </Pane>
  //         </Fragment>
  //       );
  //     case 'edit':
  //       return (
  //         <Table.Row key={Label.key} height="auto">
  //           <Table.TextCell>{Label.key}</Table.TextCell>
  //           <Table.TextCell>
  //             <TextInputField
  //               label=""
  //               name={`edit-${Label.key}`}
  //               value={Label.value}
  //               onChange={event => this.handleUpdate(i, 'value')(event)}
  //               isInvalid={Label.valueValidationMessage !== null}
  //               validationMessage={Label.valueValidationMessage}
  //               marginTop={8}
  //               marginBottom={8}
  //             />
  //           </Table.TextCell>
  //           <Table.TextCell flexBasis={75} flexShrink={0} flexGrow={0}>
  //             <Pane display="flex">
  //               <IconButton
  //                 icon="floppy-disk"
  //                 height={24}
  //                 appearance="minimal"
  //                 onClick={() => this.setLabel(Label.key, Label.value, i)}
  //               />
  //               <IconButton
  //                 icon="cross"
  //                 height={24}
  //                 appearance="minimal"
  //                 onClick={() => this.cancelEdit(i)}
  //               />
  //             </Pane>
  //           </Table.TextCell>
  //         </Table.Row>
  //       );
  //     case 'new':
  //       return (
  //         <Table.Row key={`new-${i}`} height="auto">
  //           <Table.TextCell>
  //             <TextInputField
  //               label=""
  //               name={`new-key-${i}`}
  //               value={Label.key}
  //               onChange={event => this.handleUpdate(i, 'key')(event)}
  //               isInvalid={Label.keyValidationMessage !== null}
  //               validationMessage={Label.keyValidationMessage}
  //               marginTop={8}
  //               marginBottom={8}
  //             />
  //           </Table.TextCell>
  //           <Table.TextCell>
  //             <TextInputField
  //               label=""
  //               name={`new-value-${i}`}
  //               value={Label.value}
  //               onChange={event => this.handleUpdate(i, 'value')(event)}
  //               isInvalid={Label.valueValidationMessage !== null}
  //               validationMessage={Label.valueValidationMessage}
  //               marginTop={8}
  //               marginBottom={8}
  //             />
  //           </Table.TextCell>
  //           <Table.TextCell flexBasis={75} flexShrink={0} flexGrow={0}>
  //             <Pane display="flex">
  //               <IconButton
  //                 icon="floppy-disk"
  //                 height={24}
  //                 appearance="minimal"
  //                 onClick={() => this.setLabel(Label.key, Label.value, i)}
  //               />
  //               <IconButton
  //                 icon="cross"
  //                 height={24}
  //                 appearance="minimal"
  //                 onClick={() => this.deleteLabel(Label.key, i)}
  //               />
  //             </Pane>
  //           </Table.TextCell>
  //         </Table.Row>
  //       );
  //     default:
  //       return <Fragment />;
  //   }
  // }
};

export default EditableLabelTable;
