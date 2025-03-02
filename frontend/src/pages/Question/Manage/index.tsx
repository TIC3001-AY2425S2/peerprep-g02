import { Box, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import NavBar from '../../../components/navbar';
import { getQuestion } from '../../../hooks/question/question';
import { Question } from '../../../types/questions';
import QuestionList from './ManageQuestionlist';
import QuestionForm from './QuestionForm';

const ManageQuestionsView = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const fetchQuestions = async () => {
    try {
      const response = await getQuestion();
      setQuestions(response);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleQuestionAdded = (newQuestion: Question) => {
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    setSelectedQuestion(null);
  };

  const handleQuestionUpdated = (updatedQuestion: Question) => {
    setQuestions((prevQuestions) => prevQuestions.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q)));
    setSelectedQuestion(null);
  };

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {/* Left side: List of Questions */}
        <Box
          sx={{
            width: '100%',
            height: '100vh', // Subtract the header height if needed
            maxWidth: { xs: '100%', sm: 360 }, // Responsive width
            bgcolor: 'background.paper',
            boxShadow: 3,
            p: 1,
          }}
        >
          <QuestionList
            questions={questions}
            onQuestionSelect={(question: Question) => setSelectedQuestion(question)}
          />
        </Box>

        {/* Right side: Form for adding new question */}
        <Box
          sx={{
            px: 2,
            position: 'sticky',
            width: '100%',
            bgcolor: 'background.paper',
            boxShadow: 3,
            p: 3,
          }}
        >
          <QuestionForm
            onSubmit={selectedQuestion ? handleQuestionUpdated : handleQuestionAdded}
            initialData={selectedQuestion || undefined}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default ManageQuestionsView;
