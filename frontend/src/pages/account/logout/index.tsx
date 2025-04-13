import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authcontext';
import pageNavigation from '../../../hooks/navigation/pageNavigation';

const Logout = (): any => {
  const { logoutAuth } = useAuth();
  const { goToLandingPage } = pageNavigation();

  useEffect(() => {
    logoutAuth();
    goToLandingPage();
    toast.success('Successfully logged out.');
  }, []);

  // This component doesn't render anything visible.
  // We are just logging the user out.
  return null;
};

export default Logout;
