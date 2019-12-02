import React, { forwardRef } from 'react';

import { Input } from './core';

const Field = forwardRef(({ label, ...props }, ref) => (
  <Input placeholder={label} marginBottom={4} {...props} ref={ref} />
));

export default Field;
