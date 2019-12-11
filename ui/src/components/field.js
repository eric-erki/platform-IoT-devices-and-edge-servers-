import React, { forwardRef } from 'react';
import { RHFInput } from 'react-hook-form-input';
import styled from 'styled-components';
import { space, color, typography } from 'styled-system';

import { Column, Input, Textarea } from './core';

const Label = styled.label`
margin-bottom: 8px;
${space} ${color} ${typography}
`;

Label.defaultProps = {
  color: 'white',
  fontWeight: 4,
  fontSize: 3,
};

const Field = forwardRef(
  (
    {
      label,
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
        {label && <Label htmlFor={name}>{label}</Label>}
        {getComponent()}
      </Column>
    );
  }
);

export default Field;
