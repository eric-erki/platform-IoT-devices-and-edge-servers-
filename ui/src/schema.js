import * as y from 'yup';

export const user = y.object().shape({
  name: y.string().required(),
  email: y.string().email(),
  createdOn: y.date().default(function() {
    return new Date();
  }),
});
