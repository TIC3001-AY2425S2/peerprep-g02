import { Button } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';

export default function NavBar() {
  const { accessToken, isAdmin, user } = useAuth();
  const loggedIn = accessToken;
  const title = loggedIn && user ? `Welcome ${user?.username}!` : 'Welcome!';
  const containerName = process.env.REACT_APP_CONTAINER_NAME;
  const buttons = (
    <div>
      <Button variant="outlined" component={Link} to="/login" sx={{ my: 1, mx: 1.5 }}>
        Sign In
      </Button>
      <Button variant="outlined" component={Link} to="/register" sx={{ my: 1, mx: 1.5 }}>
        Register
      </Button>
    </div>
  );

  const userButtons = (
    <div>
      <Button variant="outlined" component={Link} to="/question" sx={{ my: 1, mx: 1.5 }}>
        Question
      </Button>

      <Button variant="outlined" component={Link} to="/home" sx={{ my: 1, mx: 1.5 }}>
        Match
      </Button>
      <Button variant="outlined" component={Link} to="/profile" sx={{ my: 1, mx: 1.5 }}>
        Profile
      </Button>
      <Button variant="outlined" component={Link} to="/logout" sx={{ my: 1, mx: 1.5 }}>
        Log out
      </Button>
    </div>
  );

  const adminButtons = (
    <div>
      <Button variant="outlined" component={Link} to="/question" sx={{ my: 1, mx: 1.5 }}>
        Question
      </Button>

      <Button variant="outlined" component={Link} to="/home" sx={{ my: 1, mx: 1.5 }}>
        Match
      </Button>
      <Button variant="outlined" component={Link} to="/profile" sx={{ my: 1, mx: 1.5 }}>
        Profile
      </Button>
      <Button variant="outlined" component={Link} to="/logout" sx={{ my: 1, mx: 1.5 }}>
        Log out
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
            PeerPrep Hub {containerName ? `| Container: ${containerName} ` : ''}| {title}
          </Typography>
          {!loggedIn && buttons}
          {loggedIn && !isAdmin && userButtons}
          {isAdmin && adminButtons}
        </Toolbar>
      </AppBar>
    </Container>
  );
}
