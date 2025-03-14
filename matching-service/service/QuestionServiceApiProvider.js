import axios from 'axios';
import 'dotenv/config';

const QUESTION_SERVICE_URL = process.env.QUESTION_SVC_GATEWAY_URL || 'http://localhost:8080/questions';
const QUESTION_SERVICE_GET_ALL_CATEGORIES_URL = QUESTION_SERVICE_URL + '/category/all';
const QUESTION_SERVICE_GET_ALL_COMPLEXITIES_URL = QUESTION_SERVICE_URL + '/complexity/all';

async function getAllCategories() {
  try {
    const response = await axios.get(QUESTION_SERVICE_GET_ALL_CATEGORIES_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error during getAllCategories request:', error);
  }
}

async function getAllComplexities() {
  try {
    const response = await axios.get(QUESTION_SERVICE_GET_ALL_COMPLEXITIES_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error during getAllComplexities request:', error);
  }
}

export default { getAllCategories, getAllComplexities };
