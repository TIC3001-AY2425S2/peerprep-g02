import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createQuestion, deleteQuestion, updateQuestion } from '../../../hooks/question/question';
import { Question } from '../../../types/questions';

interface QuestionFormProps {
  onSubmit: (formData: any) => void;
  onDelete?: (deletedQuestion: any) => void;
  initialData?: Question;
  isAdmin?: boolean;
}

const QuestionForm = ({ onSubmit, onDelete, initialData, isAdmin = false }: QuestionFormProps) => {
  const [formData, setFormData] = useState({
    _id: initialData?._id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category ? initialData.category.join(', ') : '',
    complexity: initialData?.complexity || '',
  });

  useEffect(() => {
    const data = {
      _id: initialData ? initialData._id : '',
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

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
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
        const response = await createQuestion(payload);
        toast.success(`Question created successfully`);
        onSubmit(response.data);
      }
    } catch (error) {
      toast.error(`Error creating question: ${error.response?.data?.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const payload = {
        ...formData,
        _id: initialData._id,
      };
      await deleteQuestion(payload);
      toast.success(`Question deleted successfully`);
      if (onDelete) {
        onDelete(payload);
      }
    } catch (error) {
      console.error('Error deleting question:', error.response?.data?.message);
      toast.error(` Error deleting question ${error.response?.data?.message}`);
    }
  };

  // Determine if fields should be disabled
  const isDisabled = !isAdmin;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography component="h1" variant="h5" align="center">
        {initialData ? (isAdmin ? 'Edit Question' : 'Question Details') : 'Add Question'}
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
        disabled={isDisabled}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        multiline
        minRows={4}
        maxRows={8}
        id="description"
        label="Description"
        name="description"
        type="text"
        onChange={handleChange}
        value={formData.description}
        disabled={isDisabled}
        sx={{
          '& .MuiInputBase-root': {
            overflow: 'auto',
            maxHeight: '300px',
          },
        }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="category"
        label="Category"
        name="category"
        type="text"
        onChange={handleChange}
        value={formData.category}
        disabled={isDisabled}
      />
      <FormControl fullWidth required margin="normal">
        <InputLabel id="complexity-label">Complexity</InputLabel>
        <Select
          labelId="complexity-label"
          id="complexity"
          name="complexity"
          label="Complexity"
          value={formData.complexity}
          onChange={handleSelectChange}
          disabled={isDisabled}
        >
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </Select>
      </FormControl>
      <Box
        sx={{
          display: 'flex',
          gap: '20%',
          justifyContent: 'center',
          mt: 3,
          mb: 2,
        }}
      >
        {/* Show action buttons only for admin */}
        {isAdmin && (
          <>
            <Button
              type="submit"
              variant="contained"
              sx={{
                width: '20%',
                minWidth: 120,
                flexShrink: 0,
              }}
            >
              {initialData ? 'Update' : 'Create'}
            </Button>

            {initialData && (
              <Button
                type="button"
                variant="contained"
                color="error"
                sx={{
                  width: '20%',
                  minWidth: 120,
                  flexShrink: 0,
                }}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default QuestionForm;
