import * as questions from './questions';
import * as users from './users';

const api = {
  users,
  questions,
};

// Set api as immutable
Object.freeze(api);

export default api;
