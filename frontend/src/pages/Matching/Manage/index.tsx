import { Box, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import NavBar from '../../../components/navbar';
import { getQuestion } from '../../../hooks/question/question';
import { Question } from '../../../types/questions';

const ManageQuestionsView = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load questions on component mount
  useEffect(() => {
    getQuestion()
      .then((data: Question[]) => setQuestions(data))
      .catch((err) => console.error('Error fetching questions:', err));
  }, []);

  // Handler when a new question is added
  const handleQuestionAdded = (newQuestion: Question) => {
    setQuestions((prev) => [...prev, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  // Handler when a question is updated
  const handleQuestionUpdated = (updatedQuestion: Question) => {
    setQuestions((prev) => prev.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q)));
    setSelectedQuestion(updatedQuestion);
  };

  const handleQuestionDeleted = (deletedQuestion: Question) => {
    setQuestions((prev) => prev.filter((q) => q._id !== deletedQuestion._id));
    setSelectedQuestion(null);
  };

  // Calculate paginated questions
  const paginatedQuestions = questions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '3%',
          p: '1.6%',
          height: 'calc(100vh - 128px)',
        }}
      >
        {/* right container */}
        <Box
          sx={{
            width: '67%',
            height: '100%',
            p: 3,
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1,
          }}
        ></Box>
      </Box>
    </Container>
  );
};

export default ManageQuestionsView;
