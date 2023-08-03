const Handlebars = require('handlebars');

// Custom Handlebars helper to check if a string contains another string
Handlebars.registerHelper('contains', function (str, substr, options) {
  return str.includes(substr) ? options.fn(this) : options.inverse(this);
});

module.exports = Handlebars;