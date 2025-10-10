import axios from 'axios';
import { Urls } from './ApiConfig';
import { getUserToken } from '../utils/common';
import { IFilterDto } from '../types/commonTypes';
import {
  IPurchaseRequisition,
  IPurchaseRequisitionListResponse,
  ICreatePurchaseRequisitionRequest,
  IUpdatePurchaseRequisitionRequest
} from '../types/purchaseRequisitionTypes';

const API_BASE_URL = Urls.defaultUrl;

export const getAllPurchaseRequisitionsAsync = async (
  filter: IFilterDto
): Promise<IPurchaseRequisitionListResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/PurchaseRequisitions/filter`,
      filter,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`
        }
      }
    );
    return { data: response?.data || [], count: response?.data?.length || 0 };
  } catch (e) {
    console.error('Error fetching purchase requisitions:', e);
    throw e;
  }
};

export const getPurchaseRequisitionByIdAsync = async (
  id: string | number
): Promise<IPurchaseRequisition> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/PurchaseRequisitions/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getUserToken()}`
        }
      }
    );
    return response.data;
  } catch (e) {
    console.error('Error fetching purchase requisition:', e);
    throw e;
  }
};

export const createPurchaseRequisitionAsync = async (
  payload: ICreatePurchaseRequisitionRequest
): Promise<IPurchaseRequisition> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/PurchaseRequisitions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`
        }
      }
    );
    return response.data;
  } catch (e) {
    console.error('Error creating purchase requisition:', e);
    throw e;
  }
};

export const updatePurchaseRequisitionAsync = async (
  id: number,
  payload: IUpdatePurchaseRequisitionRequest
): Promise<IPurchaseRequisition> => {
  try {
    payload.id = id;
    const response = await axios.put(
      `${API_BASE_URL}/api/PurchaseRequisitions/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`
        }
      }
    );
    return response.data;
  } catch (e) {
    console.error('Error updating purchase requisition:', e);
    throw e;
  }
};

export const deletePurchaseRequisitionAsync = async (
  id: number
): Promise<void> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/PurchaseRequisitions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`
        }
      }
    );
    return response.data;
  } catch (e) {
    console.error('Error deleting purchase requisition:', e);
    throw e;
  }
};

export const submitPurchaseRequisitionAsync = async (
  id: number
): Promise<IPurchaseRequisition> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/PurchaseRequisitions/${id}/submit`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`
        }
      }
    );
    return response.data;
  } catch (e) {
    console.error('Error submitting purchase requisition:', e);
    throw e;
  }
};

