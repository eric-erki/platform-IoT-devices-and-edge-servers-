const uuidv4 = require('uuid/v4');

export default {
  randomClassName: () => {
    return (
      'rcn_' +
      uuidv4()
        .replace(/-/g, '')
        .substring(0, 10)
    );
  },

  deepClone: object => {
    return JSON.parse(JSON.stringify(object));
  },

  capitalize: message => message.replace(/^\w/, c => c.toUpperCase()),
};
