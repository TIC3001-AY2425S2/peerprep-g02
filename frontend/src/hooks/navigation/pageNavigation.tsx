import { useNavigate } from 'react-router-dom';

export const pageNavigation = () => {
  const navigate = useNavigate();

  const goToLandingPage = () => navigate('/');
  const goToHomePage = () => navigate('/home');
  const goToMatchingPage = () => navigate('/matching');

  return {
    goToLandingPage,
    goToHomePage,
    goToMatchingPage,
  };
};

export default pageNavigation;
