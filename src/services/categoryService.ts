import axios from "axios";
import { Urls } from "./ApiConfig";
import { getUserToken } from "../utils/common";
import { IFilterDto} from "../types/commonTypes";

export const getAllCategoriesAsync = async (
  filter: IFilterDto = {
    fields: [],
    pageNo: 0,
    pageSize: 0,
  }
) => {
  try {
    let response = await axios.post(
      `${Urls.defaultUrl}/api/Category/GetCategories`,
      filter,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response.data.items;
  } catch (err) {}
};

export const deleteCategoryAsync = async (id: any) => {
  try {
    let response = await axios.delete(`${Urls.defaultUrl}/api/Category/${id}`, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`,
      },
    });
    return response.data;
  } catch (err) {}
};

export const createOrUpdateCategoryAsync = async (categoryData: any) => {
  try {
    const response = await axios.post(
      `${Urls.defaultUrl}/api/Category`,
      categoryData,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const createTenderAsync = async (PostTendorData: any) => {
  try {
    const response = await axios.post(
      `${Urls.defaultUrl}/api/Rfps/UpcomingTenders`,
      PostTendorData,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getUpcomingTendersAsync = async (
  filter: IFilterDto = {
    fields: [],
    pageNo: 0,
    pageSize: 0,
  }
) => {
  try {
    let response = await axios.post(
      `${Urls.defaultUrl}/api/Rfps/UpcomingTenders/filter`,
      filter,
      {
        headers: {
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response.data;
  } catch (err) {}
};

export const deleteUpcomingTendersAsync = async (id: any) => {
  try {
    let response = await axios.delete(`${Urls.defaultUrl}/api/Rfps/UpcomingTenders/${id}`, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`,
      },
    });
    return response.data;
  } catch (err) {}
};