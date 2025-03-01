import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import NavBar from '../../../components/navbar';
import api from '../../../api';
import { toast } from 'react-toastify';

// TODO: Have a better way to do create and update question page since the differences are small
const QuestionCreateView = () => {
  // TODO: Retrieve all questions from question service
  const initialQuestions = [
    { id: 1, title: 'Question #1', difficulty: 'Easy', topic: 'Trees' },
    { id: 2, title: 'Question #2', difficulty: 'Easy', topic: 'Arrays' },
    { id: 3, title: 'Question #3', difficulty: 'Medium', topic: 'LinkedList' },
    { id: 4, title: 'Question #4', difficulty: 'Medium', topic: 'Algorithm' },
    { id: 5, title: 'Question #5', difficulty: 'Hard', topic: 'DataStructures' },
  ];

  const [questions, setQuestions] = useState(initialQuestions);

  const [formData, setFormData] = useState({
    title: undefined,
    description: undefined,
    category: [],
    complexity: undefined,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData((prevState) => ({
        ...prevState,
        category: value.split(",").map((cat) => cat.trim()),
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('question form data: ',formData);
    try {
      const response = await api.questions.create(formData);
      const question = response?.data;
      toast.success(`Question created successfully: ${question}`);
    } catch (error) {
      console.error('Error creating question:', error.response?.data?.message);
      toast.error(` Error creating question ${error.response?.data?.message}`);
    }
  };

  // TODO: Fix styling
  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box maxWidth="lg" sx={{ display: 'flex', mx: '10%', py: '10%' }}>
        <Paper sx={{ width: '100%', p: 2, mr: 4 }}>
          <Typography variant="h6" gutterBottom>
            Question List
            <IconButton sx={{ float: 'right' }}>Add</IconButton>
          </Typography>
          <List>
            {questions.map((q) => (
              <ListItem key={q.id} divider>
                <ListItemText primary={q.title} secondary={`${q.difficulty}, ${q.topic}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Add Question
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Title"
              name="title"
              type="text"
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              id="description"
              label="Description"
              name="description"
              type="text"
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              id="category"
              label="Category"
              name="category"
              type="text"
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              id="complexity"
              label="Complexity"
              name="complexity"
              type="text"
              onChange={handleChange}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Add Question
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

// TODO: Add role based access to this page
// export default withRoleBasedAccess(QuestionCreateView, 'question', 'update');
export default QuestionCreateView;
