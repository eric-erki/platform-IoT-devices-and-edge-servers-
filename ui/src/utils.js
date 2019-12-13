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

const parseError = ({ response: { status, data } }) => {
  if (data) {
    return capitalize(data);
  }

  return null;
};

export default {
  randomClassName,
  deepClone,
  capitalize,
  parseError,
};
