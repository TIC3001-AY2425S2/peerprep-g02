// src/components/question-form/QuestionForm.tsx
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createQuestion, updateQuestion } from '../../../hooks/question/question';
import { Question } from '../../../types/questions';

interface QuestionFormProps {
  onSubmit: (formData: any) => void;
  initialData?: Question;
}

const QuestionForm = ({ onSubmit, initialData }: QuestionFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category ? initialData.category.join(', ') : '',
    complexity: initialData?.complexity || '',
  });

  useEffect(() => {
    const data = {
      title: initialData ? initialData.title : '',
      description: initialData ? initialData.description : '',
      category: initialData ? initialData.category.join(', ') : '',
      complexity: initialData ? initialData.complexity : '',
    };
    setFormData(data);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        const payload = {
          ...formData,
          category: formData.category.split(',').map((cat) => cat.trim()),
          _id: initialData._id,
        };
        await updateQuestion(payload);
        toast.success(`Question updated successfully`);
        onSubmit(payload);
      } else {
        const payload = {
          ...formData,
          category: formData.category.split(',').map((cat) => cat.trim()),
        };
        await createQuestion(payload);
        toast.success(`Question created successfully`);
        onSubmit(payload);
      }
    } catch (error) {
      toast.error(`Error creating question: ${error.response?.data?.message}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5" align="center">
        {initialData ? 'Edit Question' : 'Add Question'}
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="title"
        label="Title"
        name="title"
        type="text"
        onChange={handleChange}
        value={formData.title}
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
        value={formData.description}
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
        value={formData.category}
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
        value={formData.complexity}
      />
      {/* TODO: Add a show delete button here based on initialData */}
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        {initialData ? 'Update Question' : 'Add Question'}
      </Button>
    </Box>
  );
};

export default QuestionForm;
