import React, { forwardRef } from 'react';
import { RHFInput } from 'react-hook-form-input';
import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

import { Group, Column, Input, Textarea, Label, Text, Checkbox } from './core';

const Container = styled(Group)`
  &:not(:last-of-type) {
    margin-bottom: ${props =>
      props.group
        ? props.theme.sizes[2]
        : props.theme.sizes[Label.defaultProps.marginBottom]}px;
  }
`;

const FieldLabel = styled.label`
${space} ${color} ${typography}
`;
FieldLabel.defaultProps = {
  ...Label.defaultProps,
  marginBottom: 0,
};

const Field = forwardRef(
  (
    {
      label,
      hint,
      description,
      type,
      name,
      as,
      setValue,
      register,
      onChangeEvent,
      autoComplete = 'off',
      group,
      ...props
    },
    ref
  ) => {
    const getComponent = () => {
      if (as) {
        return (
          <RHFInput
            as={as}
            id={name}
            name={name}
            register={register}
            setValue={setValue}
            onChangeEvent={data => ({ value: data[0] })}
          />
        );
      }

      switch (type) {
        case 'textarea':
          return <Textarea name={name} id={name} ref={ref} {...props} />;
        default:
          return (
            <Input
              autoComplete={autoComplete}
              type={type}
              name={name}
              id={name}
              ref={ref}
              {...props}
            />
          );
      }
    };

    return (
      <Container group={group}>
        {(label || description) && (
          <Column marginBottom={Label.defaultProps.marginBottom}>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            {description && (
              <Text marginTop={2} fontSize={1} color="grays.7">
                {description}
              </Text>
            )}
          </Column>
        )}
        {getComponent()}
        {hint && (
          <Text marginTop={2} fontSize={0} color="grays.7">
            {hint}
          </Text>
        )}
      </Container>
    );
  }
);

export default Field;
