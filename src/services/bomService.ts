import { Urls } from './ApiConfig';
import { IFilterDto } from '../types/commonTypes';
import { IBom, IBomListResponse, ICreateBomRequest, IUpdateBomRequest } from '../types/bomTypes';
import axios from 'axios';
import { getUserToken } from '../utils/common';

const API_BASE_URL = Urls.defaultUrl;

export const getAllBomsAsync = async (filter: IFilterDto): Promise<IBomListResponse> => {
  try {
    const response = await axios.post(`${Urls.defaultUrl}/api/Boms/filter`, filter, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return {data:response?.data || [], count:response?.data?.length || 0};
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getBomByIdAsync = async (id: string): Promise<IBom> => {
  const response = await fetch(`${API_BASE_URL}/api/Boms/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

export const createBomAsync = async (payload: ICreateBomRequest): Promise<IBom> => {
  try {
    const response = await axios.post(`${Urls.defaultUrl}/api/Boms`, payload, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return response.data;
  }
  catch (e) {
    console.log(e);
    throw e;
  }
};

export const updateBomAsync = async (id: number, payload: IUpdateBomRequest): Promise<IBom> => {
  try {
    payload.id = id
    const response = await axios.post(`${Urls.defaultUrl}/api/Boms`, payload, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return response.data;
  }
  catch (e) {
    console.log(e);
    throw e;
  }
};

export const deleteBomAsync = async (id: number): Promise<void> => {
  try {
    const response = await axios.delete(`${Urls.defaultUrl}/api/Boms/${id}`, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`
      }
    })
    return response.data;
  }
  catch (e) {
    console.log(e);
    throw e;
  }
};

