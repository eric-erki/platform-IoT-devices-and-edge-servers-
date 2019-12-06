import React, { forwardRef } from 'react';

import { Column, Input, Textarea, Label } from './core';

const getComponent = type => {
  switch (type) {
    case 'textarea':
      return Textarea;
    default:
      return Input;
  }
};

const Field = forwardRef(({ label, type, name, ...props }, ref) => {
  const Component = getComponent(type);

  return (
    <Column marginBottom={4}>
      <Label marginBottom={2}>{label}</Label>
      <Component id={name} name={name} type={type} {...props} ref={ref} />
    </Column>
  );
});

export default Field;
