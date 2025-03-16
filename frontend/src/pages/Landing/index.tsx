import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupIcon from '@mui/icons-material/Group';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../../components/navbar';
import { getCategoriesAndComplexities, getQuestion } from '../../hooks/question/question';
import { Question, QuestionCategoriesComplexitiesData } from '../../types/questions';

const stats = [
  { icon: <EmojiEmotionsIcon fontSize="large" />, label: 'Happy Customers', value: '250+' },
  { icon: <AssignmentIcon fontSize="large" />, label: 'Completed Projects', value: '600+' },
  { icon: <LibraryBooksIcon fontSize="large" />, label: 'Available Resources', value: '1.8K+' },
  { icon: <GroupIcon fontSize="large" />, label: 'Subscribers', value: '11K+' },
];

const Landing = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);

  const [dropdownData, setDropdownData] = useState<QuestionCategoriesComplexitiesData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');

  const categories = useMemo(() => dropdownData.map((item) => item.category), [dropdownData]);

  const filteredComplexities = useMemo(() => {
    if (selectedCategory) {
      const entry = dropdownData.find((item) => item.category === selectedCategory);
      return entry ? entry.complexity : [];
    } else {
      // Union of all complexities if no category is selected
      const allComplexities = dropdownData.flatMap((item) => item.complexity);
      return Array.from(new Set(allComplexities));
    }
  }, [dropdownData, selectedCategory]);

  // Load questions on component mount
  useEffect(() => {
    getQuestion()
      .then((data: Question[]) => setQuestions(data))
      .catch((err) => console.error('Error fetching questions:', err));
  }, []);

  // Load categories and complexities on component mount
  useEffect(() => {
    getCategoriesAndComplexities()
      .then((data: QuestionCategoriesComplexitiesData[]) => setDropdownData(data))
      .catch((err) => console.error('Error fetching categories and complexities:', err));
  }, []);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    // Optionally reset the selected complexity when category changes
    setSelectedComplexity('');
  };

  const handleComplexityChange = (event: SelectChangeEvent) => {
    setSelectedComplexity(event.target.value);
  };

  const toPascalCase = (str: string): string =>
    str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box sx={{ px: '20%', py: '5%', textAlign: 'center' }}>
        {/* Top section with dropdowns */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
          }}
        >
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              {categories.map((category: string) => (
                <MenuItem key={category} value={category}>
                  {toPascalCase(category)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="complexity-select-label">Complexity</InputLabel>
            <Select
              labelId="complexity-select-label"
              value={selectedComplexity}
              label="Complexity"
              onChange={handleComplexityChange}
            >
              {filteredComplexities.map((complexity: string) => (
                <MenuItem key={complexity} value={complexity}>
                  {toPascalCase(complexity)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="h5" gutterBottom>
          Welcome to PeerPrep Hub!
        </Typography>
        <Typography variant="body1">Your Go-To Platform for Technical Interview Preparation</Typography>
        <Typography variant="body2" color="text.secondary">
          PeerPrep Hub is designed to help students and aspiring developers hone their coding skills in a collaborative
          and interactive environment. Whether you're preparing for technical interviews or simply looking to improve
          your problem-solving abilities, our platform offers a seamless experience tailored to your needs.
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ my: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                {stat.icon}
                <Typography variant="h6" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button variant="outlined" size="large">
            Sign in
          </Button>
          <Button variant="contained" size="large">
            Register
          </Button>
        </Box>
        {/* Accordion Section */}
        <Box sx={{ mt: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            Question List
          </Typography>
          {currentQuestions.map((question) => (
            <Accordion key={question._id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{question.title}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" gutterBottom sx={{ whiteSpace: 'pre-line' }}>
                  {question.description}
                </Typography>
                <Typography variant="caption" display="block">
                  Categories: {question.category.join(', ')}
                </Typography>
                <Typography variant="caption" display="block">
                  Complexity: {question.complexity}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(questions.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Landing;
