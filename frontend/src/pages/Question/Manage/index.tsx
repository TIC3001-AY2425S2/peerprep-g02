// src/views/manage-questions/ManageQuestionsView.tsx
import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import NavBar from '../../../components/navbar';
import QuestionList from './ManageQuestionlist';
import QuestionForm from './QuestionFormAdd';
import { getQuestion } from '../../../hooks/question/question';

const ManageQuestionsView = () => {
  const [questions, setQuestions] = useState([]);
  const fetchQuestions = async () => {
    try {
      const response = await getQuestion();
      setQuestions(response);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleQuestionAdded = (newQuestion: any) => {
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
  };

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ width: '100%', height: '100vh', maxWidth: { xs: '100%', sm: 360 }, bgcolor: 'background.paper', boxShadow: 3, p: 1 }}>
          <QuestionList questions={questions} />
        </Box>
        <Box sx={{ px: 2, position: 'sticky', width: '100%', bgcolor: 'background.paper', boxShadow: 3, p: 3 }}>
          <QuestionForm onSubmit={handleQuestionAdded} />
        </Box>
      </Box>
    </Container>
  );
};

export default ManageQuestionsView;
