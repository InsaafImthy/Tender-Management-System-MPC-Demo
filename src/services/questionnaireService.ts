import { Urls } from './ApiConfig';
import { IQuestionnaire, IQuestionnaireResponse, ICreateQuestionnaireRequest, IUpdateQuestionnaireRequest, IQuestion } from '../types/questionnaireTypes';
import { IFilterDto } from '../types/commonTypes';

const API_BASE_URL = Urls.defaultUrl;

export const getAllQuestionnairesAsync = async (filter: IFilterDto): Promise<IQuestionnaireResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaires`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    throw error;
  }
};

export const getQuestionnaireByIdAsync = async (id: string): Promise<IQuestionnaire> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaires/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    throw error;
  }
};

export const createQuestionnaireAsync = async (questionnaire: ICreateQuestionnaireRequest): Promise<IQuestionnaire> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaires`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(questionnaire),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    throw error;
  }
};

export const updateQuestionnaireAsync = async (id: string, questionnaire: IUpdateQuestionnaireRequest): Promise<IQuestionnaire> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaires/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(questionnaire),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating questionnaire:', error);
    throw error;
  }
};

export const deleteQuestionnaireAsync = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaires/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    throw error;
  }
};
