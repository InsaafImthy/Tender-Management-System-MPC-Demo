import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getAllUsersByFilterAsync } from "../../../services/userService";
import {
  assignPermissionsToRoleAsync,
  getAllRolesFilterAsync,
  getPermissionsByRoleIdAsync,
} from "../../../services/roleService";
import { notification } from "antd";
import { IFilterDto } from "../../../types/commonTypes";
import { formatDate, getUserCredentials } from "../../../utils/common";
import SettingsSortModal from "../settings_components/SettingsSortModal";
import { IUserDetails } from "../../../types/userTypes";
import { RolesManagementIcon } from "../../../utils/Icons";

interface RoleData {
  roleid: string;
  roleName: string;
  users: number;
  createdAt: string;
  permissions: object[];
}

const defaultFilter = {
  fields: [],
  pageNo: 1,
  pageSize: 10,
  sortColumn: "CreatedAt",
  sortOrder: "DESC",
};

const RolesPermissions: React.FC = () => {
  const [trigger, setTrigger] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<any>();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [rolesPermissions] = useState<number[]>([]);
  const [changesDone, setChangesDone] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{
    userId: string;
    roleId: string;
    name: string;
    departmentId: string;
    companyId: string;
    role: string;
  }>({
    userId: "0",
    roleId: "0",
    name: "0",
    departmentId: "0",
    companyId: "0",
    role: "0",
  });

  const fetchRolePermissions = async (role: RoleData) => {
    try {
      console.log(role.roleid);

      const response = await getPermissionsByRoleIdAsync(role.roleid);
      setSelectedRole({ ...role, permissions: response.permissions });
      console.log(selectedRole);

      // console.log(response, "jjj")
      // if (response.permissions) {
      //     const excludedPermissions = [
      //         "rolepermissions",
      //         "documents",
      //         "capexexpendituretypes",
      //         "expenditurecategory",
      //         "clients",
      //         "categories",
      //         "approvalflowusers",
      //         "capexdocuments",
      //         "capexrequestcostsummary",
      //         "expenditurehistory",
      //         "projectdocuments",
      //         "projectmilestones",
      //         "quotes"
      //     ];

      //     const updatedPermissions = response.permissions.filter(
      //         (x) => !excludedPermissions.includes(x.permissionName)
      //     );

      //     setRolesPermissions(updatedPermissions);

      // }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  const setupRolesAndPermissions = async () => {
    try {
      setTrigger(false);
      const tempUserInfo = getUserCredentials();
      setUserInfo(tempUserInfo);
      // Fetch roles and users
      const { data: allRoles } = await getAllRolesFilterAsync(filter);
      const users: any = await getAllUsersByFilterAsync(filter);
      // const permissionss = await getAllPermissionsAsync();
      const permissionss = [
        { permissionId: 1, permissionName: "CanCreateUser" },
        { permissionId: 2, permissionName: "CanUpdateUser" },
        { permissionId: 3, permissionName: "CanDeleteUser" },
        { permissionId: 4, permissionName: "CanViewUsers" },
        { permissionId: 5, permissionName: "CanManageUsers" },
        { permissionId: 6, permissionName: "CanAssignRoles" },
        { permissionId: 7, permissionName: "CanCreateVendor" },
        { permissionId: 8, permissionName: "CanApproveVendor" },
        { permissionId: 9, permissionName: "CanEditVendor" },
        { permissionId: 10, permissionName: "CanViewVendors" },
        { permissionId: 11, permissionName: "CanSubmitRFP" },
        { permissionId: 12, permissionName: "CanApproveRFP" },
        { permissionId: 13, permissionName: "CanCreateApprovalFlow" },
        { permissionId: 14, permissionName: "CanEditApprovalFlow" },
        { permissionId: 15, permissionName: "CanDeleteApprovalFlow" },
        { permissionId: 16, permissionName: "CanViewApprovalFlow" },
        { permissionId: 17, permissionName: "CanCreateCategory" },
        { permissionId: 18, permissionName: "CanEditCategory" },
        { permissionId: 19, permissionName: "CanDeleteCategory" },
        { permissionId: 20, permissionName: "CanViewCategory" },
      ];
      setPermissions(permissionss);
      console.log(permissions, "per");

      console.log("Users:", users, "ddd");
      console.log("Roles:", allRoles);

      // Map roles to RoleData array
      const currentUser: IUserDetails | undefined = users?.items.find(
        (user: any) => user.id === userInfo.userId
      );
      const currentUserRole = currentUser?.roleName; // assuming role is a string like "Manager"

      const roleData: any[] = allRoles
        .map((role) => {
          const userCount = users?.items.filter(
            (user: any) => user.roleId === role.id
          ).length;

          console.log(
            {
              roleid: role.id,
              roleName: role.roleName || "Unknown Role",
              users: userCount,
              createdAt: formatDate(role.createdAt ?? "") || "N/A",
            },
            "fff"
          );

          return {
            roleid: role.id,
            roleName: role.roleName || "Unknown Role",
            users: userCount,
            createdAt: formatDate(role.createdAt ?? "") || "N/A",
          };
        })
        .filter((role) => role.roleName !== currentUserRole);

      const permission = await getPermissionsByRoleIdAsync(roleData[0]?.roleid);
      console.log(
        {
          ...roleData[0],
          permissions: permission?.permissions,
        },
        "mmmmm"
      );
      // Update state
      setRoles(roleData);
      setSelectedRole({
        ...roleData[0],
        permissions: permission?.permissions,
      });
    } catch (error) {
      console.error("Error setting up roles:", error);
    }
  };

  const handlePermissionToggle = (permission: any) => {
    console.log(permission, "permissionpermissionpermissionpermission");
    const exists = selectedRole?.permissions?.some(
      (p: any) => p.permissionId === permission.permissionId
    );
    const updatedPermissions = exists
      ? selectedRole?.permissions?.filter(
          (p: any) => p.permissionId !== permission.permissionId
        ) // remove
      : [...selectedRole?.permissions, permission]; // add

    // setRolesPermissions((prevPermissions) =>
    //     prevPermissions?.map((permission) => {
    //         if (permission.permissionName === permissionName) {
    //             if (field === 'grandAccess') {
    //                 const newValue = !permission.grandAccess;
    //                 return {
    //                     ...permission,
    //                     grandAccess: newValue,
    //                     canView: newValue,
    //                     canEdit: newValue,
    //                     canAdd: newValue,
    //                     canDelete: newValue,
    //                 };
    //             } else {
    //                 return {
    //                     ...permission,
    //                     [field]: !permission[field],
    //                 };
    //             }
    //         }
    //         return permission;
    //     })
    // );
    setSelectedRole((prev: any) => ({
      ...prev!,
      permissions: updatedPermissions,
    }));
    console.log(selectedRole);
    // setRolesPermissions(prev => [...(prev || []), id])
    console.log(rolesPermissions, "addded");

    setChangesDone(true);
  };

  //table

  // const columns = [
  //     { key: 'roleName', label: 'Role' },
  //     { key: 'users', label: 'Users' },
  //     { key: 'createdAt', label: 'Created On' },
  // ];

  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [searchQuery] = useState("");
  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);

  // const handleThreeDots = (type: "edit" | "delete", role: RoleData) => {
  //     console.log(role)
  //     setEditData({ roleId: role.roleid, roleName: role.roleName })
  //     if (type === "edit") {
  //         setIsEditModalOpen(true);
  //     } else {
  //         setConfirmAction({ type, role });
  //         setIsConfirmModalOpen(true);
  //     }
  // };

  const handleRoleSelect = (role: RoleData) => {
    console.log(role, "123");

    // setSelectedRole(role);
    fetchRolePermissions(role);
    setChangesDone(false);
    // setIsViewModalOpen(true);
  };

  const handleSaveChangesForRole = async (roleId?: string) => {
    // if (!roleId) return;

    try {
      const response = await assignPermissionsToRoleAsync({
        roleId: roleId,
        permissionIds: selectedRole?.permissions.map(
          (p: any) => p.permissionId
        ),
      });
      console.log(response);
      setChangesDone(false);
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      notification.error({
        message: "updation error",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    const filterData = { ...filter, globalSearch: searchQuery };
    setFilter(filterData);
  }, [searchQuery]);

  useEffect(() => {
    setupRolesAndPermissions();
    // setSelectedRole(null);
  }, [trigger, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                <RolesManagementIcon />
              </span>
            </div>
            <div>
              <h1 className="text-heading-2">Roles & Permissions</h1>
              <p className="text-body-small text-muted">
                Manage user roles and system permissions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
              <span className="text-button text-accent">
                {roles.length} Roles
              </span>
            </div>
            {selectedRole && (
              <button
                className={`px-6 py-3 rounded-lg text-button font-medium transition-all duration-200 flex justify-end items-center text-sm ${
                  changesDone
                    ? "bg-customBlue !text-white"
                    : "bg-blue-300 !text-white cursor-not-allowed"
                }`}
                disabled={!changesDone}
                onClick={() => handleSaveChangesForRole(selectedRole.roleid)}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex justify-between items-center pb-6">
          <h2 className="text-heading-3">Role Permissions</h2>
        </div>

        <div className="flex justify-start items-to mb-4">
          <div className="flex gap-2 overflow-x-auto w-full scrollbar">
            {roles?.map((role) => {
              const isSelected = role.roleid === selectedRole.roleid;
              return (
                <div
                  key={role.roleid}
                  onClick={() => handleRoleSelect(role)}
                  className={`px-3 py-1 rounded-lg text-sm border cursor-pointer ${
                    isSelected ? "bg-blue-100 text-blue-600" : "text-black"
                  }`}
                >
                  {role.roleName}
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-auto max-h-[350px]">
          <table className="min-w-full border-collapse table-auto">
            <thead className="sticky top-0 bg-white z-5">
              <tr className="text-xs font-semibold text-gray-500">
                <th className="text-left py-3 w-1/3">Permissions</th>
                <th className="text-center py-3 w-[13%]">Grant access</th>
              </tr>
            </thead>
            <tbody>
              {permissions?.map((permission) => (
                <tr
                  key={permission.permissionId}
                  className="border-t border-gray-200"
                >
                  <td className="py-3 text-sm text-gray-900">
                    {permission.permissionName}
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center">
                      <div
                        className={`w-[16px] h-[16px] rounded flex items-center justify-center cursor-pointer ${
                          selectedRole?.permissions?.some(
                            (p: any) =>
                              p.permissionId === permission.permissionId
                          )
                            ? selectedRole?.roleName?.toLowerCase() ==
                                "superadmin" ||
                              userInfo?.role == selectedRole?.roleName
                              ? "bg-blue-400"
                              : "bg-blue-600"
                            : "border border-gray-300"
                        }`}
                        onClick={() =>
                          selectedRole.roleName != "SuperAdmin" &&
                          userInfo.role != selectedRole?.roleName &&
                          handlePermissionToggle(permission)
                        }
                      >
                        {selectedRole?.permissions?.some(
                          (p: any) => p.permissionId === permission.permissionId
                        ) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter & Sort Modals */}
      {sortModalOpen && (
        <SettingsSortModal
          filter={filter}
          setFilter={setFilter}
          setIsSettingsSortModalOpen={setSortModalOpen}
          type="role"
        />
      )}
    </div>
  );
};

export default RolesPermissions;
