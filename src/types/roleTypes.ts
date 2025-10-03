export interface IRole {
    id: string
    createdAt?: string
    createdBy?: string
    updatedAt?: string
    updatedBy?: string
    clientId?: string
    roleName?: string
    permissions?:object[]
}

export interface Permission {
    id?: string;
    createdAt?: string; // You can also use Date if you plan to convert the string to a Date object
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    roleId?: string;
    permissionName: string;
    grandAccess: boolean;
    canView: boolean;
    canEdit: boolean;
    canAdd: boolean;
    canDelete: boolean;
  }