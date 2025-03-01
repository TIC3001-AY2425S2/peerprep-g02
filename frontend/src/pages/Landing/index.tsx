import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import GroupIcon from '@mui/icons-material/Group';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import NavBar from '../../components/navbar';

const stats = [
  { icon: <EmojiEmotionsIcon fontSize="large" />, label: 'Happy Customers', value: '250+' },
  { icon: <AssignmentIcon fontSize="large" />, label: 'Completed Projects', value: '600+' },
  { icon: <LibraryBooksIcon fontSize="large" />, label: 'Available Resources', value: '1.8K+' },
  { icon: <GroupIcon fontSize="large" />, label: 'Subscribers', value: '11K+' },
];

const Landing = () => {
  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box sx={{ px: '20%', py: '5%', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Welcome to PeerPrep Hub!
        </Typography>
        <Typography variant="body1">Your Go-To Platform for Technical Interview Preparation</Typography>
        <Typography variant="body2" color="text.secondary">
          PeerPrep Hub is designed to help students and aspiring developers hone their coding skills in a collaborative
          and interactive environment. Whether you're preparing for technical interviews or simply looking to improve
          your problem-solving abilities, our platform offers a seamless experience tailored to your needs.
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ my: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                {stat.icon}
                <Typography variant="h6" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button variant="outlined" size="large">
            Sign in
          </Button>
          <Button variant="contained" size="large">
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Landing;
