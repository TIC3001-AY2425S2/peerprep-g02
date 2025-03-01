import { CssBaseline } from '@mui/material';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/loading';
import { isLoggedIn } from '../localStorage';
import Landing from '../pages/Landing';
import ManageQuestionsView from '../pages/Question/Manage';
import QuestionUpdateView from '../pages/Question/Update';
import './App.css';

// Routes is for routing of pages
const ActiveApp: React.FC = () => {
  return (
    <React.Suspense fallback={<Loading message="Loading App..." />}>
      <div className="App">
        <ToastContainer theme="colored" />
        <CssBaseline />
        <Routes>
          {/* TODO: Add route to login */}
          <Route path="/" element={isLoggedIn() ? '' : <Navigate to="/login" />} />
          <Route path="/login" element={<Landing />} />

          {/* TODO: consolidate both create and update question page into 1 */}
          <Route path="/manage/question" element={<ManageQuestionsView />} />
          <Route path="/manage/question/update" element={<QuestionUpdateView />} />
          {/* TODO: Add user profile management */}
          {/*<Route path="/profile" element={isLoggedIn() ? <Profile /> : <Navigate to="/login" />} />*/}
          {/* TODO: Add user logout */}
          {/*<Route path="/logout" element={<Logout />} />*/}
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
