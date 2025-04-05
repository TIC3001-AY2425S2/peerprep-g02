import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useMemo, useState } from 'react';
import NavBar from '../../components/navbar';
import { useAuth } from '../../context/authcontext';
import { startMatchmaking } from '../../hooks/matching/matching';
import pageNavigation from '../../hooks/navigation/pageNavigation';
import { getCategoriesAndComplexities } from '../../hooks/question/question';
import { QuestionCategoriesComplexitiesData } from '../../types/questions';

const Home = () => {
  const { user, setSessionId } = useAuth();
  const { goToMatchingPage } = pageNavigation();
  const userId = user.id;
  const [dropdownData, setDropdownData] = useState<QuestionCategoriesComplexitiesData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');

  // Process categories from API data
  const categories = useMemo(() => dropdownData.map((item) => item.category), [dropdownData]);
  
  // Filter complexities based on selected category
  const filteredComplexities = useMemo(() => (
    selectedCategory 
      ? dropdownData.find(item => item.category === selectedCategory)?.complexities || []
      : []
  ), [dropdownData, selectedCategory]);

  useEffect(() => {
    getCategoriesAndComplexities()
      .then(setDropdownData)
      .catch(console.error);
  }, []);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    setSelectedComplexity('');
  };

  const handleComplexityChange = (event: SelectChangeEvent) => {
    setSelectedComplexity(event.target.value);
  };

  const handleMatchClick = async () => {
    try {
      const data = {
        userId,
        category: selectedCategory,
        complexity: selectedComplexity,
      };

      const { sessionId } = await startMatchmaking(data);
      setSessionId(sessionId);
      goToMatchingPage();
    } catch (error) {
      console.error('Match request failed:', error);
    }
  };

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f2f5',
        }}
      >
        <Paper
          sx={{
            width: '50vw',
            height: '35vh',
            backgroundColor: '#ffffff',
            borderRadius: 2,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              height: '30%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Start Matching
            </Typography>
          </Box>

          {/* Form Section */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: '5%',
            }}
          >
            <FormControl sx={{ flex: '0 0 30%' }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: '0 0 5%' }} />

            <FormControl sx={{ flex: '0 0 30%' }} disabled={!selectedCategory}>
              <InputLabel>Complexity</InputLabel>
              <Select
                value={selectedComplexity}
                onChange={handleComplexityChange}
                label="Complexity"
              >
                {filteredComplexities.map((complexity) => (
                  <MenuItem key={complexity} value={complexity}>
                    {complexity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: '0 0 5%' }} />

            <Button
              variant="contained"
              sx={{ 
                flex: '0 0 20%',
                height: 56,
                bgcolor: 'black',
                '&:hover': { bgcolor: 'grey.800' }
              }}
              onClick={handleMatchClick}
              disabled={!selectedCategory || !selectedComplexity}
            >
              Match!
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
