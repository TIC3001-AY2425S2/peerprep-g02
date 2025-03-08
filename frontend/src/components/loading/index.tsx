import { CircularProgress, Typography } from '@mui/material';
import React from 'react';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  gap: '16px',
};

interface Props {
  message?: string;
}

// Loading component for asynchronous operations
const Loading: React.FC<Props> = ({ message = '' }) => {
  return (
    <div style={containerStyle}>
      <CircularProgress color="primary" />
      <Typography variant="subtitle1" component="h2">
        {message}
      </Typography>
    </div>
  );
};

export default Loading;
