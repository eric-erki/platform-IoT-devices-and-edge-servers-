import * as yup from 'yup';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,100}$/;
const nameRegex = /^[a-z0-9-]+$/;
//const noSpacesRegex = /^(?!.*\s).{1,100}$/;
//const usernameRegex = /^[a-zA-Z]+$/;

export default {
  name: yup
    .string()
    .max(100)
    .matches(nameRegex, {
      message: 'Must be only lowercase letters, numbers and -',
    }),
  email: yup
    .string()
    .email()
    .max(64),
  password: yup
    .string()
    .min(8)
    .max(64)
    .matches(passwordRegex, {
      message:
        'Password length must be at least 8, contain a lower case letter, a upper case letter, and no spaces.',
    }),
};
