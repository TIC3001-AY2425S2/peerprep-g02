import { CssBaseline } from '@mui/material';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/loading';
import { hasAccessToken } from '../localStorage';
import Login from '../pages/account/login';
import Logout from '../pages/account/logout';
import Register from '../pages/account/register';
import Home from '../pages/Home';
import Landing from '../pages/Landing';
import Matching from '../pages/Matching';
import ManageQuestionsView from '../pages/Question/Manage';
import './App.css';

// Routes is for routing of pages
const ActiveApp: React.FC = () => {
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
          <Route path="/home" element={hasAccessToken() ? <Home /> : <Navigate to="/" />} />
          <Route path="/matching" element={hasAccessToken() ? <Matching /> : <Navigate to="/" />} />
          <Route path="/manage/question" element={hasAccessToken() ? <ManageQuestionsView /> : <Navigate to="/" />} />
          {/* TODO: Add user profile management */}
          {/* TODO: Add user logout */}
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
      <ActiveApp />
    </BrowserRouter>
  );
};

export default App;
