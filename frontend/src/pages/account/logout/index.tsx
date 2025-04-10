import { useEffect } from 'react';
import { toast } from 'react-toastify';
import pageNavigation from '../../../hooks/navigation/pageNavigation';
import { logout } from '../../../localStorage';

const Logout = (): any => {
  const { goToLandingPage } = pageNavigation();

  useEffect(() => {
    logout();
    goToLandingPage();
    toast.success('Successfully logged out.');
  }, []);

  // This component doesn't render anything visible.
  // We are just logging the user out.
  return null;
};

export default Logout;
