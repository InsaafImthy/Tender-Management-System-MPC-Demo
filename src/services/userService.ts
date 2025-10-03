import axios, { AxiosError } from 'axios';
import { Urls } from './ApiConfig';
import { getUserToken } from '../utils/common';
import { IFilterDto, SuccessResponse } from '../types/commonTypes';
import { IUserDetails, User } from "../types/userTypes";

// Define the expected shape of the login data
interface ILogin {
  username: string;
  password: string;
}

// Updated registration interface to match complete user data structure
interface IRegisterUser {
  id: number;
  photo: string;
  userName: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  place: string;
  isActive: boolean;
  roleId: number;
}

// Define the expected shape for password reset request
interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

// Define the expected shape for forgot password request
interface ForgotPasswordRequest {
  email: string;
}

// Define the expected API response shape
interface AuthResponse {
  token: string;
}

// Define a custom error interface for API errors
interface ApiError {
  message: string;
  status?: number;
}

const defaultFilter = {
    fields: [],
    pageNo: 0,
    pageSize: 0,
    sortColumn: "CreatedAt",
    sortDirection: "DESC"
}

// Shared error handling function
const handleApiError = (err: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<ApiError>;
    throw new Error(
      axiosError.response?.data?.message || defaultMessage
    );
  }
  throw new Error('An unexpected error occurred.');
};

export const userLoginAsync = async (data: ILogin): Promise<string> => {
  try {
    const response = await axios.post<AuthResponse>(`${Urls.defaultUrl}/api/Users/login`, data);
    return response.data.token;
  } catch (err) {
    return handleApiError(err, 'Login failed. Please try again.');
  }
};

export const userRegisterAsync = async (userData: IRegisterUser): Promise<string> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${Urls.defaultUrl}/api/Users/CreateOrUpdateUser`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response.data.token;
  } catch (err) {
    return handleApiError(err, 'Registration failed. Please try again.');
  }
};

export const requestPasswordResetAsync = async (data: ForgotPasswordRequest): Promise<void> => {
  try {
    if (!data.email) {
      throw new Error('Email is required');
    }

    const encodedEmail = encodeURIComponent(data.email); // to safely encode special characters
    const url = `${Urls.defaultUrl}/api/Users/forgot-password?email=${encodedEmail}`;
    await axios.post<void>(
      url,
      null, // no body, since we're sending email as query
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
  } catch (err) {
    return handleApiError(err, 'Failed to send password reset email. Please try again.');
  }
};


export const resetPasswordAsync = async (data: ResetPasswordRequest): Promise<void> => {
  try {
    if (!data.email || !data.token || !data.newPassword) {
      throw new Error('Email, token, and new password are required');
    }
    await axios.post<void>(
      `${Urls.defaultUrl}/api/Users/reset-password`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
  } catch (err) {
    return handleApiError(err, 'Failed to reset password. Please try again.');
  }
};

export const getAllUsersByFilterAsync = async (filter: IFilterDto = defaultFilter): Promise<IUserDetails[]> => {
    try {
        let response = await axios.post(`${Urls.defaultUrl}/api/Users/filter`, filter, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err:any) {
        throw err.response.data
    }
}

export const getUserDataByIdAsync = async (id: string) => {
    try {
        let response = await axios.get(`${Urls.defaultUrl}/api/Users/${id}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        });
        return response.data;
    }catch(err:any){
        throw err.response.data
    }
}

export const createOrUpdateUserAsync = async (formData:User): Promise<IUserDetails> => {
    try {
      console.log(formData);
      
        let response = await axios.post(`${Urls.defaultUrl}/api/Users/CreateOrUpdateUser`, formData, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err:any) {
        throw err.response.data
    }
}

// export const updateUserAsync = async (formData:User): Promise<boolean> => {
//     try {
//         let response = await axios.put(`${Urls.defaultUrl}/api/Users/${formData.}`, formData, {
//             headers: {
//                 Authorization: `Bearer ${getUserToken()}`
//             }
//         })
//         return response.data;
//     }catch(err:any){
//         throw err.response.data
//     }
// }

export const deleteUserAsync = async(id:number):Promise<SuccessResponse> =>{
    try{
        let response = await axios.delete(`${Urls.defaultUrl}/api/Users/DeleteUser?userId=${id}`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err:any){
        throw err.response.data
    }
}