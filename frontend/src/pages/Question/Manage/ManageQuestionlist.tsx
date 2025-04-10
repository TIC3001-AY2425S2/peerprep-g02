// src/components/question-list/QuestionList.tsx
import StarIcon from '@mui/icons-material/Star'; // import StarIcon
import { ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
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
            '&.Mui-selected': { backgroundColor: 'action.selected' },
            py: 1, // padding y-axis 8px
            px: 2, // padding x-axis 16px
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
            primary={
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'medium',
                  whiteSpace: 'nowrap', // not wrap
                  overflow: 'hidden', // hide overflow content
                  textOverflow: 'ellipsis', //show ellipsis
                  maxWidth: '200px', // max width
                }}
              >
                {question.title}
              </Typography>
            }
            secondary={
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                }}
              >
                {`${question.complexity} - ${question.category.join(', ')}`}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <FixedSizeList height={800} width="100%" itemSize={80} itemCount={questions.length} overscanCount={5}>
      {renderQuestion}
    </FixedSizeList>
  );
};

export default QuestionList;
