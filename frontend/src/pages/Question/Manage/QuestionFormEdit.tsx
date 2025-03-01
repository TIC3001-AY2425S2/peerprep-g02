// src/components/question-form/QuestionForm.tsx
import { TextField, Button, Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../api';

interface QuestionFormProps {
  onSubmit: (formData: any) => void;
}

const QuestionForm = ({ onSubmit }: QuestionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: [],
    complexity: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    try {
      const response = await api.questions.create(formData);
      toast.success(`Question created successfully: ${response?.data}`);
      onSubmit(formData); // Pass form data back to the parent component
    } catch (error) {
      toast.error(`Error creating question: ${error.response?.data?.message}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5" align="center">Add Question</Typography>
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
      <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Update Question
      </Button>
      <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Delete Question
      </Button>
    </Box>
  );
};

export default QuestionForm;
