import axios from "axios";
import { IFilterDto } from "../types/commonTypes";
import { Urls } from "./ApiConfig";
import { getUserToken } from "../utils/common";
import { IRole } from "../types/roleTypes";

export const getAllRolesFilterAsync = async (filter: IFilterDto = { fields: [], sortColumn: "createdAt" }): Promise<{ data: IRole[]; count: number }> => {
    try {
        console.log(filter);
        const response = await axios.get(`${Urls.defaultUrl}/api/Roles`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return { data:response?.data, count:response?.data?.length };
    } catch (error: any) {
        throw error.response.data
    }
}

export const getAllPermissionsAsync = async (): Promise<string[]> => {
    try {
        const response = await axios.get(`${Urls.defaultUrl}/api/Roles/GetAllPermissions`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (error: any) {
        throw error.response.data
    }
}

export const assignPermissionsToRoleAsync = async (rolePermission:object): Promise<object> => {
    try {
        const response = await axios.post(`${Urls.defaultUrl}/api/Roles/AssignPermissionsToRole`, rolePermission ,{
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (error: any) {
        throw error.response.data
    }
}

export const createRoleAsync = async (roleData: any) => {
    try {
        const response = await axios.post(`${Urls.defaultUrl}/api/Roles`, roleData, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    } catch (error: any) {
        throw error.response.data
    }
}

export const getPermissionsByRoleIdAsync = async (roleId: string): Promise<IRole> => {
    try {
        const response = await axios.get(`${Urls.defaultUrl}/api/Roles/GetRoleById?roleId=${roleId}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response.data
    }
};

export const updatePermissionsByRoleIdAsync = async (roleId: string, updatedPermissions: any): Promise<IRole> => {
    try {
        const response = await axios.put(
            `${Urls.defaultUrl}/api/Roles/${roleId}`,
            updatedPermissions,
            {
                headers: {
                    Authorization: `Bearer ${getUserToken()}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw error.response.data
    }
};

export const deleteRoleAsync = async (roleId: string) => {
    try {
        const response = await axios.delete(`${Urls.defaultUrl}/api/Roles/${roleId}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err: any) {
        throw err.response.data
    }
}

export const updateRoleByIdAsync = async (roleId: string, updatedRole: any): Promise<IRole> => {
    try {
        console.log(updatedRole, "updatedRoleupdatedRoleupdatedRole")
        const response = await axios.put(
            `${Urls.defaultUrl}/api/Roles/${roleId}`,
            updatedRole,
            {
                headers: {
                    Authorization: `Bearer ${getUserToken()}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw error.response.data
    }
};
