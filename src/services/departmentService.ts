import axios from "axios";
import { Urls } from "./ApiConfig";
import { getUserToken } from "../utils/common";
import { IDepartment } from "../types/departmentTypes";
import { IFilterDto } from "../types/commonTypes";
export const getAllDepartmentsAsync=async(filterData:IFilterDto = {fields:[],pageNo:0,pageSize:0}):Promise<{data:IDepartment[]; count:number}>=>{
    try{
        let response = await axios.post(`${Urls.defaultUrl}/api/Department/filter`,filterData,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return {data:response.data,count:response.data.length};
    }catch(err:any){
        throw err.response.data
    }
}

export const createDepartmentAsync = async(data:IDepartment) : Promise<IDepartment>=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Department`,{id:0,...data},{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err:any){
        throw err.response.data
    }
}


export const updateDepartmentAsync = async(id:string,department:IDepartment):Promise<boolean>=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Department`,{...department,id:id},{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err:any){
        throw err.response.data
    }
}

export const deleteDepartmentAsync = async(id:string)=>{
    try{
        const response = await axios.delete(`${Urls.defaultUrl}/api/Department/${id}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
                
            }
        })
        return response.data;
    }catch(err:any){
        throw err.response.data
    }
}