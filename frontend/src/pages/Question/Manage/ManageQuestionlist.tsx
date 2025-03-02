// src/components/question-list/QuestionList.tsx
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Question } from '../../../types/questions';

interface QuestionListProps {
  questions: Question[];
  onQuestionSelect?: (question: Question) => void;
}

const QuestionList = ({ questions, onQuestionSelect }: QuestionListProps) => {
  const renderQuestion = (props: ListChildComponentProps) => {
    const { index, style } = props;
    const question = questions[index];
    if (!question) return null;
    return (
      <ListItem key={index} component="div" alignItems="flex-start" style={style}>
        <ListItemButton onClick={() => onQuestionSelect && onQuestionSelect(question)}>
          <ListItemAvatar>
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
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
