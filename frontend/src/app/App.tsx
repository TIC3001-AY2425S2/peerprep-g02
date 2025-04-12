import { CssBaseline } from '@mui/material';
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/loading';
import { AuthProvider, useAuth } from '../context/authcontext';
import pageNavigation from '../hooks/navigation/pageNavigation'; // Preserved from new file for navigation functionality
import Login from '../pages/account/login';
import Logout from '../pages/account/logout';
import Register from '../pages/account/register';
import Collab from '../pages/Collab';
import Home from '../pages/Home';
import Landing from '../pages/Landing';
import Matching from '../pages/Matching';
import ManageQuestionsView from '../pages/Question/Manage';
import Profile from '../pages/account/profile';
import QuestionPage from '../pages/Question/Manage';
import './App.css';

// Preserved from new file: Navigation handler for session restoration
const ResumeHandler: React.FC = () => {
  const { accessToken, hasCollab, sessionId } = useAuth();
  const { goToCollabPage, goToMatchingPage, goToHomePage } = pageNavigation();
  const location = useLocation();

  useEffect(() => {
    if (!accessToken) return;

    if (hasCollab && location.pathname !== '/collab') {
      goToCollabPage();
      return;
    }

    if (sessionId && !hasCollab && location.pathname !== '/matching') {
      goToMatchingPage();
      return;
    }

    if (accessToken && !hasCollab && !sessionId && location.pathname === '/') {
      goToHomePage();
      return;
    }
  }, [accessToken, hasCollab, sessionId, location.pathname]);

  return null;
};

// Maintained design structure from old file with functional additions
const ActiveApp: React.FC = () => {
  const { accessToken, isAdmin, hasCollab } = useAuth();

  return (
    <React.Suspense fallback={<Loading message="Loading App..." />}>
      <div className="App">
        {/* Added from new file for session management */}
        <ResumeHandler />
        {/* Preserved design elements from old file */}
        <ToastContainer theme="colored" />
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/question" element={accessToken ? <QuestionPage /> : <Navigate to="/" />} />
          <Route path="/home" element={accessToken ? <Home /> : <Navigate to="/" />} />
          <Route path="/matching" element={accessToken ? <Matching /> : <Navigate to="/" />} />
          <Route path="/collab" element={accessToken && hasCollab ? <Collab /> : <Navigate to="/" />} />
          <Route path="/profile" element={accessToken ? <Profile /> : <Navigate to="/" />} />
          <Route
            path="/manage/question"
            element={accessToken && isAdmin ? <ManageQuestionsView /> : <Navigate to="/" />}
          />
          {/* TODO: Add user profile management */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </div>
    </React.Suspense>
  );
};

// Maintained entry point structure from old file
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ActiveApp />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
