const path = require('path');
const gateway = require('express-gateway');

gateway()
  .load(path.join(__dirname, 'config'))
  .run();

// TODO: Remove all auth stuff here and just configure routing