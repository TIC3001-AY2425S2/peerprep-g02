import { CssBaseline } from '@mui/material';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/loading';
import Landing from '../pages/Landing';
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
          {/* TODO: Add route to login */}
          <Route path="/" element={<Landing />} />

          {/* TODO: consolidate both create and update question page into 1 */}
          <Route path="/manage/question" element={<ManageQuestionsView />} />
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
