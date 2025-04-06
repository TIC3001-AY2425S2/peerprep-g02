import { Box, Container, Pagination, Paper, Typography, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import NavBar from '../../components/navbar';
import { getQuestion } from '../../hooks/question/question';
import { Question } from '../../types/questions';
import QuestionList from './QuestionList';
import QuestionForm from './Manage/QuestionForm';

const QuestionPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    getQuestion()
      .then((data: Question[]) => setQuestions(data))
      .catch(err => console.error('Error:', err));
  }, []);

  const handleQuestionAdded = (newQuestion: Question) => {
    setQuestions(prev => [...prev, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  const handleQuestionDeleted = (deletedQuestion: Question) => {
    setQuestions(prev => prev.filter(q => q._id !== deletedQuestion._id));
    setSelectedQuestion(null);
  };

  const paginatedQuestions = questions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box sx={{ display: 'flex', gap: '3%', p: '1.6%', height: 'calc(100vh - 128px)' }}>
        <Paper sx={{ width: '30%', height: '100%', p: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Questions</Typography>
            <Button variant="contained" size="small" onClick={() => setSelectedQuestion(null)}>
              Add New
            </Button>
          </Box>
          <QuestionList 
            questions={paginatedQuestions}
            selectedId={selectedQuestion?._id}
            onQuestionSelect={setSelectedQuestion}
          />
          <Pagination
            count={Math.ceil(questions.length / pageSize)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
          />
        </Paper>
        <Box sx={{ width: '67%', p: 3, boxShadow: 3 }}>
          <QuestionForm
            onSubmit={handleQuestionAdded}
            onDelete={handleQuestionDeleted}
            initialData={selectedQuestion || undefined}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default QuestionPage;
