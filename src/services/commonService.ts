import axios from "axios";
import { getUserToken } from "../utils/common";
import { Urls } from "./ApiConfig";


export const getAllCountryCodes = async () => {
    try {
        let response = await axios.get(`${Urls.defaultUrl}/api/Common/GetAllCountry`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (err: any) {
        throw err.response.data;
    }
}

export const getAllDocumentTypesAsync = async () => {
    try {
        let response = await axios.get(`${Urls.defaultUrl}/api/Common/GetAllDocumentTypeAsync`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (err: any) {
        throw err.response.data;
    }
}

export const getAllContractTypesAsync = async () => {
    try {
        let response = await axios.get(`${Urls.defaultUrl}/api/Common/GetAllContractTypesAsync`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (err: any) {
        throw err.response.data;
    }
}

export const getAllBudgetTypesAsync = async () => {
    try {
        let response = await axios.get(`${Urls.defaultUrl}/api/Common/GetAllBudgetTypesAsync`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (err: any) {
        throw err.response.data;
    }
}

export const getAllCriteriasAsync = async () => {
    try {
        let response = await axios.get(`${Urls.defaultUrl}/api/Common/Criterias`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (err: any) {
        throw err.response.data;
    }
}

export const createOrUpdateCriteriasAsync = async (data:any) => {
    try {
        let response = await axios.post(`${Urls.defaultUrl}/api/Common/Criterias`,data ,{
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (err: any) {
        throw err.response.data;
    }
}

export const deleteCriteriaAsync = async (id:number) => {
    try {
        let response = await axios.delete(`${Urls.defaultUrl}/api/Common/Criterias/${id}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (err: any) {
        throw err.response.data;
    }
}