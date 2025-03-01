import React, { useState, useEffect } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Paper,
    Typography,
    Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../../api';

interface Question {
  _id: string;
  title: string;
  complexity: string;
  category: string[];
}

interface QuestionListProps {
  selectedId?: string;
  onSelect: (question: Question) => void;
  onDelete?: (id: string) => void;
}

const QuestionList = ({ selectedId, onSelect, onDelete }: QuestionListProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    api.questions.getAll()
      .then(data => {
        // data should be an array of questions; log it to verify
        console.log('Fetched questions:', data);
        const questionsArray = Array.isArray(data) ? data : [];
        setQuestions(questionsArray);
      })
      .catch(error => console.error('Error fetching questions:', error));
  }, []);

  const handleDelete = (id: string) => {
    api.questions.remove({ _id: id })
      .then(response => {
        if (response.status === 200) {
          setQuestions(prev => prev.filter(question => question._id !== id));
          onDelete && onDelete(id);
        } else {
          console.error('Failed to delete question');
        }
      })
      .catch(error => console.error('Error deleting question:', error));
  };

  return (
    <Paper sx={{ width: '100%', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Question List</Typography>
      </Box>
      <List dense={false}>
        {questions.map((question) => (
          <ListItem
            button
            key={question._id}
            selected={selectedId === question._id}
            onClick={() => onSelect(question)}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(question._id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5' },
              '&.Mui-selected': { backgroundColor: '#e3f2fd' }
            }}
          >
            <ListItemText primary={question.title} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default QuestionList;