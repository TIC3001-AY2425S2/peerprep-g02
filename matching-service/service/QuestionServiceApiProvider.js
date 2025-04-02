import axios from 'axios';
import 'dotenv/config';

const QUESTION_SERVICE_URL = process.env.QUESTION_SVC_GATEWAY_URL || 'http://localhost:8080/questions';
const QUESTION_SERVICE_GET_ALL_CATEGORIES_COMPLEXITIES_URL = QUESTION_SERVICE_URL + '/categories/complexities';

async function getAllCategoriesAndComplexitiesCombination() {
  try {
    const response = await axios.get(QUESTION_SERVICE_GET_ALL_CATEGORIES_COMPLEXITIES_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error during getAllComplexities request: ', error);
  }
}

export default { getAllCategoriesAndComplexitiesCombination };
