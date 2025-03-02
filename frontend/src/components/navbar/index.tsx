import { Button } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const loggedIn = false;
  const title = loggedIn ? `Welcome, some user!` : '';

  // TODO: Fix styling and add admin buttons
  const buttons = (
    <div>
      <Button variant="outlined" component={Link} to="/manage/question" sx={{ my: 1, mx: 1.5 }}>
        Manage Questions
      </Button>
    </div>
  );

  const navigate = useNavigate();
  const goToLanding = () => {
    navigate('/');
  };

  return (
    <Container disableGutters maxWidth={false}>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography
            variant="h5"
            onClick={goToLanding}
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, textAlign: 'left', cursor: 'pointer' }}
          >
            PeerPrep Hub {title}
          </Typography>
          {buttons}
        </Toolbar>
      </AppBar>
    </Container>
  );
}
