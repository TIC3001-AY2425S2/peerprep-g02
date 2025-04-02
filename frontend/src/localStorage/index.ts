export function isLoggedIn() {}

export function login(user: any) {}

export function logout() {}

export function setSessionId(sessionId: string) {
  localStorage.setItem('sessionId', sessionId);
}

export function getSessionId() {
  return localStorage.getItem('sessionId');
}
