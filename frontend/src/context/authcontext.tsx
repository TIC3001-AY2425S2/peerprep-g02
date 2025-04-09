import React, { createContext, useContext, useEffect, useState } from 'react';
import LocalStorage from '../localStorage';

interface AuthContextProps {
  accessToken: string | null;
  user: any;
  sessionId: string | null;
  collab: any;
  isAdmin: boolean;
  hasCollab: boolean;
  loginAuth: (token: string, user: any) => void;
  logoutAuth: () => void;
  setSessionId: (sessionId: string) => void;
  setCollab: (collabData: any) => void;
  removeCollab: () => void;
  removeSessionId: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  accessToken: null,
  user: null,
  sessionId: null,
  collab: null,
  isAdmin: false,
  hasCollab: false,
  loginAuth: () => {},
  logoutAuth: () => {},
  setSessionId: () => {},
  setCollab: () => {},
  removeCollab: () => {},
  removeSessionId: () => {},
});

export const AuthProvider: React.FC<any> = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(LocalStorage.getAccessToken());
  const [user, setUserState] = useState<any>(LocalStorage.getUser());
  const [sessionId, setSessionIdState] = useState<string | null>(LocalStorage.getSessionId());
  const [collab, setCollabState] = useState<any>(LocalStorage.getCollab());
  const [isAdmin, setIsAdminState] = useState<boolean>(LocalStorage.isAdmin());
  const [hasCollab, setHasCollabState] = useState<boolean>(LocalStorage.hasCollab());

  // On mount, re-read values from LocalStorage to resume progress
  useEffect(() => {
    setAccessTokenState(LocalStorage.getAccessToken());
    setUserState(LocalStorage.getUser());
    setSessionIdState(LocalStorage.getSessionId());
    setCollabState(LocalStorage.getCollab());
    setIsAdminState(LocalStorage.isAdmin());
    setHasCollabState(LocalStorage.hasCollab());
  }, []);

  const loginAuth = (token: string, userData: any) => {
    LocalStorage.setAccessToken(token);
    LocalStorage.setUser(userData);
    setAccessTokenState(token);
    setUserState(userData);
    setIsAdminState(LocalStorage.isAdmin());
  };

  const logoutAuth = () => {
    LocalStorage.logout();
    setAccessTokenState(null);
    setUserState(null);
    setSessionIdState(null);
    setCollabState(null);
    setIsAdminState(false);
    setHasCollabState(false);
  };

  const setSessionId = (newSessionId: string) => {
    LocalStorage.setSessionId(newSessionId);
    setSessionIdState(newSessionId);
  };

  const setCollab = (collabData: any) => {
    LocalStorage.setCollab(collabData);
    setCollabState(LocalStorage.getCollab());
    setHasCollabState(LocalStorage.hasCollab());
  };

  const removeCollab = () => {
    LocalStorage.removeCollab();
    setCollabState(null);
    setHasCollabState(false);
  };

  const removeSessionId = () => {
    LocalStorage.removeSessionId();
    setSessionIdState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        sessionId,
        collab,
        isAdmin,
        hasCollab,
        loginAuth,
        logoutAuth,
        setSessionId,
        setCollab,
        removeCollab,
        removeSessionId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
