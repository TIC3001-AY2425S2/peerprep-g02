export function isLoggedIn() {
  // Just checks for existence of the access_token
  // TODO: Verify contents of the access_token
  const loggedIn = localStorage.getItem('access_token');
  return !!loggedIn;
}

export function login(user: any) {
  // TODO: Add access token verification
  localStorage.setItem('access_token', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('access_token');
}

export function getUser() {
  const user = localStorage.getItem('access_token');
  // TODO: Decode access_token and get role
  return user ? JSON.parse(user) : null;
}
