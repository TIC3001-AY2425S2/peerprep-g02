function hasAccessToken() {
  const token = localStorage.getItem('accessToken');
  console.log(token !== null && token.trim() !== '');
  return token !== null && token.trim() !== '';
}

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function setAccessToken(accessToken) {
  localStorage.setItem('accessToken', accessToken);
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function isAdmin() {
  const user = getUser();
  return user ? user.isAdmin : false;
}

function logout() {
  localStorage.removeItem('sessionId');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('collab');
}

function setSessionId(sessionId) {
  localStorage.setItem('sessionId', sessionId);
}

function getSessionId() {
  return localStorage.getItem('sessionId');
}

function hasCollab() {
  const collab = localStorage.getItem('collab');
  return collab !== null && collab.trim() !== '';
}

function getCollab() {
  const collab = localStorage.getItem('collab');
  return collab ? JSON.parse(collab) : null;
}

function setCollab(collab) {
  const collabToStore = {
    ...collab,
    id: collab.id?.toString(),
    questionId: collab.questionId?.toString(),
  };
  localStorage.setItem('collab', JSON.stringify(collabToStore));
}

function removeCollab() {
  localStorage.removeItem('collab');
}

function removeSessionId() {
  localStorage.removeItem('sessionId');
}

export default {
  hasAccessToken,
  getAccessToken,
  setAccessToken,
  getUser,
  setUser,
  isAdmin,
  logout,
  setSessionId,
  getSessionId,
  hasCollab,
  getCollab,
  setCollab,
  removeCollab,
  removeSessionId,
};
