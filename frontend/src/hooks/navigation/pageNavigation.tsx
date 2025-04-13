import { useNavigate } from 'react-router-dom';

export const pageNavigation = () => {
  const navigate = useNavigate();

  const goToLandingPage = () => navigate('/');
  const goToHomePage = () => navigate('/home');
  const goToMatchingPage = () => navigate('/matching');
  const goToCollabPage = () => navigate('/collab');

  return {
    goToLandingPage,
    goToHomePage,
    goToMatchingPage,
    goToCollabPage,
  };
};

export default pageNavigation;
