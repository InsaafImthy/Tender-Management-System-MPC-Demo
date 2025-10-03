import { Ban, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { User } from '../../../types/userTypes';
import { formatDate } from '../../../utils/common';
import { Modal as AntdModal, Button, message } from 'antd';
import { deleteUserAsync, createOrUpdateUserAsync } from '../../../services/userService';
import userPhoto from '../../../assets/profile_photo/userPhoto.png'

interface ViewUserCardProp {
  userDetails: User | undefined;
  closeModal: () => void;
  trigger: () => void;
}

const ViewUserCard: React.FC<ViewUserCardProp> = ({ userDetails, closeModal, trigger }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: "delete" | "block", user: User } | null>(null);

  console.log(userDetails,"dddd");
  
  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "delete") {
        await deleteUserAsync(confirmAction.user.id as number);
        message.success('User deleted successfully');
      } else if (confirmAction.type === "block") {
        const formData = {};
        // formData.append("id", confirmAction.user.id as string);
        // formData.append("isActive", (!confirmAction.user.isActive).toString());
        await createOrUpdateUserAsync(formData);
        message.success(`User ${confirmAction.user.isActive ? 'blocked' : 'unblocked'} successfully`);
      }
      setIsConfirmModalOpen(false);
      trigger();
      closeModal();
    } catch (error) {
      message.error('An error occurred while performing the action');
    }
  };

  return (
    userDetails &&
    <div className="bg-white flex flex-col h-full relative">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-4">
          <h4 className="text-lg font-semibold">Details</h4>
        </div>

        <div className="flex gap-4 mb-6 bg-[#EDF4FD] items-center justify-center border p-4 rounded-md">
          <div className="w-[80px] h-[80px] rounded-full bg-red-300 overflow-hidden">
            <img src={userDetails.photoUrl || userPhoto} alt="User avatar" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-semibold text-[18px]">{userDetails.name}</h5>
                <p className="text-sm">{userDetails.email}</p>
                <p className="text-sm text-gray-500">Username: <span className="text-black">{userDetails.userName}</span></p>
                <p className="text-sm text-gray-500">Gender: <span className="text-black">{userDetails.gender}</span></p>
              </div>
              <span className={`${userDetails.isActive?"bg-green-100 border border-green-300 text-green-600":"bg-red-100 border border-red-300 text-red-600"} px-2 py-1 text-xs rounded-full`}>{userDetails.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 p-4 rounded-md bg-bgBlue">
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-sm font-medium text-gray-800">{userDetails.departmentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-sm font-medium text-gray-800">{userDetails.roleName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-800">{userDetails.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Place</p>
            <p className="text-sm font-medium text-gray-800">{userDetails.place!=="undefined"?userDetails.place:""}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date added</p>
            <p className="text-sm font-medium text-gray-800">{formatDate(userDetails.createdAt as string)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last active</p>
            <p className="text-sm font-medium text-gray-800">{formatDate(userDetails.updatedAt as string)}</p>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <div className="pt-3">
             <button
              className="flex items-center gap-1 text-gray-600 py-1 w-full rounded-md text-[14px]"
              onClick={() => {
                setConfirmAction({ type: "block", user: userDetails });
                setIsConfirmModalOpen(true);
              }}
            >
              <Ban className="w-[12px] h-[12px]" />
              <span>{userDetails?.isActive ? "Block" : "Unblock"}</span>
            </button>
            <button
              className="flex items-center gap-1 text-red-500 py-1 w-full rounded-md text-[14px]"
              onClick={() => {
                setConfirmAction({ type: "delete", user: userDetails });
                setIsConfirmModalOpen(true);
              }}
            >
              <Trash className="w-[12px] h-[12px]" />
              <span>Delete</span>
            </button>
            <AntdModal
                title={confirmAction?.type === "delete" ? "Confirm Delete" : userDetails?.isActive ? "Confirm Block" : "Confirm Unblock"}
                open={isConfirmModalOpen}
                onCancel={() => setIsConfirmModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>,
                    <Button key="confirm" type="primary" danger={confirmAction?.type === "delete"} onClick={handleConfirmAction}>
                        {confirmAction?.type === "delete" ? "Delete" : userDetails?.isActive ? "Block" : "Unblock"}
                    </Button>
                ]}
            >
                <p>Are you sure you want to {confirmAction?.type === "delete" ? "delete" : userDetails?.isActive ? "block" : "unblock"} this user?</p>
            </AntdModal>
          </div>
        </div>
      </div>

      {/* Fixed footer */}
      <div className="border-t-2 mt-auto bg-white p-4">
        <div className="flex gap-2">
          {/* <button
            type="submit"
            className="px-3 py-2 bg-blue-500 text-[14px] text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Edit
          </button> */}
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-2 bg-gray-200 text-[14px] text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserCard;