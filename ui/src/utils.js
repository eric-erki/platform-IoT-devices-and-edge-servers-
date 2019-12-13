const uuidv4 = require('uuid/v4');

const capitalize = message => message.replace(/^\w/, c => c.toUpperCase());

const randomClassName = () => {
  return (
    'rcn_' +
    uuidv4()
      .replace(/-/g, '')
      .substring(0, 10)
  );
};

const deepClone = object => {
  return JSON.parse(JSON.stringify(object));
};

const parseError = error => {
  if (error) {
    if (typeof error === 'object') {
      const {
        response: { data },
      } = error;
      if (data && typeof data === 'string') {
        return capitalize(data);
      }
    }
  }

  return null;
};

export default {
  randomClassName,
  deepClone,
  capitalize,
  parseError,
};
