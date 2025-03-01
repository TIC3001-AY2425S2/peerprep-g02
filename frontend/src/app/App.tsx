import { CssBaseline } from '@mui/material';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/loading';
import Landing from '../pages/Landing';
import QuestionCreateView from '../pages/Question/Create';
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
          <Route path="/" element={<Landing />} />

          {/* TODO: Add user profile management */}
          {/* TODO: Add user logout */}
          <Route path="/manage/question/create" element={<QuestionCreateView />} />
          <Route path="/manage/question/update" element={<QuestionUpdateView />} />

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
