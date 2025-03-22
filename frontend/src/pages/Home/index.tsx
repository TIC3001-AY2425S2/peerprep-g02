import React, { useEffect, useMemo, useState } from 'react';
import { QuestionCategoriesComplexitiesData } from '../../types/questions';
import {
  Box, Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select, Typography,
} from '@mui/material';
import NavBar from '../../components/navbar';
import { SelectChangeEvent } from '@mui/material/Select';
import { getCategoriesAndComplexities } from '../../hooks/question/question';


const Home = () => {
  const [dropdownData, setDropdownData] = useState<QuestionCategoriesComplexitiesData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');


  const categories = useMemo(() => dropdownData.map((item) => item.category), [dropdownData]);

  const filteredComplexities = useMemo(() => {
    if (!selectedCategory) return [];
    const entry = dropdownData.find((item) => item.category === selectedCategory);
    return entry ? entry.complexity : [];
  }, [dropdownData, selectedCategory]);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    setSelectedComplexity('');
  };

  const handleComplexityChange = (event: SelectChangeEvent) => {
    setSelectedComplexity(event.target.value);
  };

  // Load categories and complexities on component mount
  useEffect(() => {
    getCategoriesAndComplexities()
      .then((data) => setDropdownData(data))
      .catch((err) => console.error('Error fetching categories and complexities: ', err));
  }, []);

  const toPascalCase = (str: string): string =>
    str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box sx={{ px: '20%', py: '5%', textAlign: 'center' }}>
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            gap: '1.5rem',
            mx: '30%',
          }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Start Matching!
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            gap: '1.5rem',
            mx: '30%'
          }}
        >
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              label="category"
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {toPascalCase(category)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} disabled={!selectedCategory}>
            <InputLabel id="complexity-select-label">Complexity</InputLabel>
            <Select
              labelId="complexity-select-label"
              value={selectedComplexity}
              label="complexity"
              onChange={handleComplexityChange}
            >
              {filteredComplexities.map((complexity) => (
                <MenuItem key={complexity} value={complexity}>
                  {toPascalCase(complexity)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#000',
              '&:hover': {
                backgroundColor: '#333'
              }
            }}
          >
            Match!
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;