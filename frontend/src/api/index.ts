import * as auth from './auth';
import * as collab from './collab';
import * as matching from './matching';
import * as questions from './questions';
import * as users from './users';

const api = {
  questions,
  matching,
  users,
  auth,
  collab,
};

// Set api as immutable
Object.freeze(api);

export default api;
