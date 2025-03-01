import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import NavBar from '../../../components/navbar';
import api from '../../../api';
import { toast } from 'react-toastify';
import React from 'react';
import { getQuestion, createQuestion, deleteQuestion } from '../../../hooks/question/question';
import { Question } from '../../../types/questions';
// TODO: Have a better way to do create and update question page since the differences are small
const ManageQuestionsView = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestion();
        setQuestions(response);
        console.log("Fetched questions! ", response);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, []);
  function renderQuestion(props: ListChildComponentProps ) {
    const { index, style } = props;
    const question = questions[index];
    if (!question) return null;
    return (
      <ListItem key={index} component="div" alignItems="flex-start" style={style}>
        <ListItemButton>
          <ListItemAvatar>
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </ListItemAvatar>
          <ListItemText
            primary={`Question ${index+1}`}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: 'text.primary', display: 'inline' }}
                >
                  {question.complexity} - {question.category.join(", ")}
                </Typography>
              </React.Fragment>
            }
          />
        
        </ListItemButton>
        
      </ListItem>
    );
  }
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
      <Box sx={{ display: 'flex', flexDirection: 'row'}}>
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
        <FixedSizeList
          height={window.innerHeight}
          width="100%"
          itemSize={80}
          itemCount={questions.length}
          overscanCount={5}
        >
          {renderQuestion}
        </FixedSizeList>
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
        <Typography component="h1" variant="h5" align="center">
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
export default ManageQuestionsView;
