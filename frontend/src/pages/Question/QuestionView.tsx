import React, { useState } from 'react';
import { Box } from '@mui/material';
import QuestionList from './ListQuestion/QuestionList';
import QuestionDetail from './QuestionDetail/QuestionDetail';

interface Question {
  _id: string;
  title: string;
  complexity: string;
  category: string[];
  description?: string;
}

const QuestionView = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  return (
    <Box display="flex" height="100vh">
      <Box width="300px" borderRight="1px solid #ccc">
        <QuestionList 
          selectedId={selectedQuestion?._id} 
          onSelect={(question) => setSelectedQuestion(question)}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          // Optional: pass onDelete if needed
        />
      </Box>
      <Box flexGrow={1} p={2}>
        <QuestionDetail question={selectedQuestion} />
      </Box>
    </Box>
  );
};

export default QuestionView;
