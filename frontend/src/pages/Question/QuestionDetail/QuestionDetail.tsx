import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';

interface Question {
  _id: string;
  title: string;
  complexity: string;
  category: string[];
  description?: string;
}

interface QuestionDetailProps {
  question?: Question;
}

const QuestionDetail = ({ question }: QuestionDetailProps) => {
  if (!question) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Select a question to view details</Typography>
      </Paper>
    );
  }
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">{question.title}</Typography>
      <Box mt={2}>
        <Typography variant="subtitle1">Complexity: {question.complexity}</Typography>
        <Typography variant="subtitle1">Categories: {question.category.join(', ')}</Typography>
        <Box mt={2}>
          <Typography variant="body1">
            {question.description || 'No description available.'}
          </Typography>
        </Box>
      </Box>
      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" color="primary">
          Edit
        </Button>
        <Button variant="outlined" color="error">
          Delete
        </Button>
      </Box>
    </Paper>
  );
};

export default QuestionDetail;
