import { Urls } from './ApiConfig';
import { IQuestionnaire, IQuestionnaireResponse} from '../types/questionnaireTypes';
import { IFilterDto } from '../types/commonTypes';
import axios from 'axios';
import { getUserToken } from '../utils/common';

export const getAllQuestionnairesAsync = async (filter: IFilterDto): Promise<IQuestionnaireResponse> => {
  try {
    const response = await axios.post(`${Urls.defaultUrl}/api/Questionnaires/filter`, filter, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return {data:response.data || [], count:response.data?.length || 0};
  } catch (err) {
    throw err;
  }
};


export const createQuestionnaireAsync = async (questionnaire: IQuestionnaire): Promise<IQuestionnaire> => {
  try {
    const response = await axios.post(`${Urls.defaultUrl}/api/Questionnaires`, questionnaire, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    throw error;
  }
};

export const updateQuestionnaireAsync = async (id: string, questionnaire: IQuestionnaire): Promise<IQuestionnaire> => {
  try {
    questionnaire.id = id;
    const response = await axios.post(`${Urls.defaultUrl}/api/Questionnaires`, questionnaire, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error updating questionnaire:', error);
    throw error;
  }
};

export const deleteQuestionnaireAsync = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete(`${Urls.defaultUrl}/api/Questionnaires/${id}`, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    throw error;
  }
};