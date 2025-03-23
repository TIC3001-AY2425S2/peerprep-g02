import { useNavigate } from 'react-router-dom';

export const pageNavigation = () => {
  const navigate = useNavigate();

  const goToHomePage = () => navigate('/home');
  const goToMatchingPage = () => navigate('/matching');

  return {
    goToHomePage,
    goToMatchingPage,
  };
};

export default pageNavigation;
