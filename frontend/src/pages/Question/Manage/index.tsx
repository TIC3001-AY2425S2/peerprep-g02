import { Box, Button, Container, Pagination, Paper, Typography } from '@mui/material';
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

  useEffect(() => {
    getQuestion()
      .then((data: Question[]) => setQuestions(data))
      .catch((err) => console.error('Error fetching questions:', err));
  }, []);

  const handleQuestionAdded = (newQuestion: Question) => {
    setQuestions((prev) => [...prev, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  const handleQuestionDeleted = (deletedQuestion: Question) => {
    setQuestions((prev) => prev.filter((q) => q._id !== deletedQuestion._id));
    setSelectedQuestion(null);
  };

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
        <Paper
          sx={{
            width: '30%',
            height: 'auto',
            minHeight: '700px',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Question List</Typography>
            <Button variant="contained" size="small" onClick={() => setSelectedQuestion(null)}>
              Add New
            </Button>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <QuestionList
              questions={paginatedQuestions}
              selectedId={selectedQuestion?._id}
              onQuestionSelect={setSelectedQuestion}
            />
          </Box>

          <Box
            sx={{
              pt: 2,
              borderTop: '1px solid #eee',
              display: 'flex',
              justifyContent: 'center',
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

        <Box
          sx={{
            width: '67%',
            height: '100%',
            minHeight: '700px',
            p: 3,
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1,
          }}
        >
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

export default ManageQuestionsView;
