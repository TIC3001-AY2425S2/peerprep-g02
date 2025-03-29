import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useMemo, useState } from 'react';
import NavBar from '../../components/navbar';
import { startMatchmaking } from '../../hooks/matching/matching';
import pageNavigation from '../../hooks/navigation/pageNavigation';
import { getCategoriesAndComplexities } from '../../hooks/question/question';
import { QuestionCategoriesComplexitiesData } from '../../types/questions';

const Home = () => {
  const { goToMatchingPage } = pageNavigation();
  const [dropdownData, setDropdownData] = useState<QuestionCategoriesComplexitiesData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');

  // Data processing logic
  const categories = useMemo(() => dropdownData.map((item) => item.category), [dropdownData]);
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
      await startMatchmaking({
        userId: '123',
        category: selectedCategory,
        complexity: selectedComplexity
      });
      goToMatchingPage();
    } catch (error) {
      console.error('Match request failed:', error);
    }
  };

  return (
    <Container disableGutters component="main" maxWidth={false}>
      {/* Navigation Bar */}
      <NavBar />

      {/* Main Content Container */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f2f5',
        }}
      >
        {/* Central Gray Box (50vw x 35vh) */}
        <Paper
          sx={{
            width: '50vw',
            height: '35vh',
            bgcolor: 'grey.100',
            borderRadius: 2,
            p: 4,
          }}
        >
          {/* Title Section (Top 30% of gray box) */}
          <Box
            sx={{
              height: '30%',
              display: 'flex',
              alignItems: 'center',
              pl: '5%',
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="h4">Start Matching</Typography>
          </Box>

          {/* Form Section (Bottom 70% of gray box) */}
          <Box
            sx={{
              height: '70%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: '5%',
              py: '15%',
            }}
          >
            {/* Category Dropdown (30% width) */}
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

            {/* Spacer (5% width) */}
            <Box sx={{ flex: '0 0 5%' }} />

            {/* Complexity Dropdown (30% width) */}
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

            {/* Spacer (5% width) */}
            <Box sx={{ flex: '0 0 5%' }} />

            {/* Match Button (20% width) */}
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
