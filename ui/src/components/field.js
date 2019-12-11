import React, { forwardRef } from 'react';
import { RHFInput } from 'react-hook-form-input';
import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

import { Column, Input, Textarea, Label, Text } from './core';

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
      <Column marginBottom={6}>
        {(label || description) && (
          <Column marginBottom={Label.defaultProps.marginBottom}>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            {description && (
              <Text marginTop={2} fontSize={1} color="whites.7">
                {description}
              </Text>
            )}
          </Column>
        )}
        {getComponent()}
        {hint && (
          <Text marginTop={2} fontSize={0} color="whites.7">
            {hint}
          </Text>
        )}
      </Column>
    );
  }
);

export default Field;
