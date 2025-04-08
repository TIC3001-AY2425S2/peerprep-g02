
import StarIcon from '@mui/icons-material/Star';
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
          selected={selectedId === question._id}
          sx={{
            '&:hover': { backgroundColor: 'action.hover' },
            '&.Mui-selected': { backgroundColor: 'action.selected' },
            py: 1,
            px: 2
          }}
        >
          <ListItemAvatar>
            <StarIcon 
              sx={{ 
                color: selectedId === question._id ? '#ffeb3b' : '#9e9e9e',
              }} 
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'medium',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                }}
              >
                {question.title}
              </Typography>}
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
    <FixedSizeList
      height={800}
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
