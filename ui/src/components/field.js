import React, { forwardRef } from 'react';
import { RHFInput } from 'react-hook-form-input';

import { Column, Input, Textarea, Label } from './core';

const Field = forwardRef(
  (
    { label, type, name, as, setValue, register, onChangeEvent, ...props },
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
          return (
            <Textarea
              name={name}
              autoComplete="off"
              id={name}
              ref={ref}
              {...props}
            />
          );
        default:
          return (
            <Input
              autoComplete="off"
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
      <Column marginBottom={4}>
        {label && (
          <Label marginBottom={2} htmlFor={name}>
            {label}
          </Label>
        )}
        {getComponent()}
      </Column>
    );
  }
);

export default Field;
