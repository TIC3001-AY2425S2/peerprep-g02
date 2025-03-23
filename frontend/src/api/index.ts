import * as matching from './matching';
import * as questions from './questions';

const api = {
  questions,
  matching,
};

// Set api as immutable
Object.freeze(api);

export default api;
