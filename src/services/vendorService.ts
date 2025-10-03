import axios from "axios";
import { Urls } from "./ApiConfig";
import { getUserToken } from "../utils/common";
import { IFilterDto } from "../types/commonTypes";

export const getAllVendorsAsync = async (data: IFilterDto = {fields:[],pageNo:0, pageSize:0}) => {
    try {
        const response = await axios.post(`${Urls.defaultUrl}/api/Vendor/filter`, data, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err) {

    }
}

export const getVendorsDetailsByIdAsync = async (id:number) => {
    try {
        const response = await axios.get(`${Urls.defaultUrl}/api/Vendor/${id}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err) {

    }
}


export const getVendorCriteriasAsync = async (vendorId:number) => {
    try {
        const response = await axios.get(`${Urls.defaultUrl}/api/Vendor/GetAllVendorCriterias?vendorId=${vendorId}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err) {

    }
}

export const getVendorDocumentsAsync = async (vendorId:number) => {
    try {
        const response = await axios.get(`${Urls.defaultUrl}/api/VendorDocuments?vendorId=${vendorId || 0}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err) {}
}