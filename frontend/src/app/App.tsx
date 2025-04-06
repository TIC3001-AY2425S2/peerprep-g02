import { CssBaseline } from '@mui/material';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/loading';
import { AuthProvider, useAuth } from '../context/authcontext';
import Login from '../pages/account/login';
import Logout from '../pages/account/logout';
import Register from '../pages/account/register';
import Collab from '../pages/Collab';
import Home from '../pages/Home';
import Landing from '../pages/Landing';
import Matching from '../pages/Matching';
import ManageQuestionsView from '../pages/Question/Manage';
import Profile from '../pages/account/profile';
import QuestionPage from '../pages/Question';
import './App.css';

const ActiveApp: React.FC = () => {
  const { accessToken, isAdmin, hasCollab } = useAuth();

  return (
    <React.Suspense fallback={<Loading message="Loading App..." />}>
      <div className="App">
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

// Landing page / entry point
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
