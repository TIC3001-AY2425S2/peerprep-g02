import { Box, Container, Pagination, Paper, Typography, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import NavBar from '../../../components/navbar';
import { getQuestion } from '../../../hooks/question/question';
import { Question } from '../../../types/questions';
import QuestionList from './ManageQuestionlist';
import QuestionForm from './QuestionForm';

const ManageQuestionsView = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Load questions on component mount
  useEffect(() => {
    getQuestion()
      .then((data: Question[]) => setQuestions(data))
      .catch(err => console.error('Error fetching questions:', err));
  }, []);

  // Handler when a new question is added
  const handleQuestionAdded = (newQuestion: Question) => {
    setQuestions(prev => [...prev, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  // Handler when a question is updated
  const handleQuestionUpdated = (updatedQuestion: Question) => {
    setQuestions(prev =>
      prev.map(q => (q._id === updatedQuestion._id ? updatedQuestion : q))
    );
    setSelectedQuestion(updatedQuestion);
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
          p: '1.6%', // margin around the container
          height: 'calc(100vh - 128px)' // 100% - height of the navbar
        }}
      >
        {/* left container */}
        <Paper
          sx={{
            width: '30%',
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 3
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant="h6">Question List</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => setSelectedQuestion(null)}
            >
              Add New
            </Button>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
          <QuestionList
              questions={paginatedQuestions}
              selectedId={selectedQuestion?._id} // pass selectedId to QuestionList
              onQuestionSelect={setSelectedQuestion}
          />
          </Box>

          {/* page component */}
          <Box
            sx={{
              pt: 2,
              borderTop: '1px solid #eee',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Pagination
              count={Math.ceil(questions.length / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              size="small"
            />
          </Box>
        </Paper>

        {/* right container */}
        <Box
          sx={{
            width: '67%',
            height: '100%',
            p: 3,
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1
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
