export function hasAccessToken(): boolean {
  const token = localStorage.getItem('accessToken');
  return token !== null && token.trim() !== '';
}

export function setAccessToken(accessToken) {
  localStorage.setItem('accessToken', accessToken);
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem('sessionId');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

export function setSessionId(sessionId: string) {
  localStorage.setItem('sessionId', sessionId);
}

export function getSessionId() {
  return localStorage.getItem('sessionId');
}
