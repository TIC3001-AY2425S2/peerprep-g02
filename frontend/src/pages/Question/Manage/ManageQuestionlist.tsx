// src/components/question-list/QuestionList.tsx
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star'; // import StarIcon 
import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Question } from '../../../types/questions';

interface QuestionListProps {
  questions: Question[];
  selectedId?: string;
  onQuestionSelect?: (question: Question) => void;
}

const QuestionList = ({ questions, selectedId, onQuestionSelect }: QuestionListProps) => {
  const renderQuestion = (props: ListChildComponentProps) => {
    const { index, style } = props;
    const question = questions[index];
    if (!question) return null;

    return (
      <ListItem key={index} component="div" alignItems="flex-start" style={style}>
        <ListItemButton 
          onClick={() => onQuestionSelect && onQuestionSelect(question)}
          selected={selectedId === question._id} // add selected state prop
          sx={{
            '&:hover': { backgroundColor: 'action.hover' },
            '&.Mui-selected': { backgroundColor: 'action.selected' }
          }}
        >
          <ListItemAvatar>
            {/* amend Avatar to star */}
            <StarIcon 
              sx={{ 
                color: selectedId === question._id ? '#ffeb3b' : '#9e9e9e', //on select yellow, not grey
              }} 
            />
          </ListItemAvatar>
          <ListItemText
            primary={`${question.title}`}
            secondary={
              <React.Fragment>
                <Typography component="span" variant="body2" sx={{ color: 'text.primary', display: 'inline' }}>
                  {question.complexity} - {question.category.join(', ')}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <FixedSizeList
      height={window.innerHeight}
      width="100%"
      itemSize={80}
      itemCount={questions.length}
      overscanCount={5}
    >
      {renderQuestion}
    </FixedSizeList>
  );
};

export default QuestionList;
