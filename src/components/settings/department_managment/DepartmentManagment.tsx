import { Button, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import SettingsTable from '../settings_components/SettingsTable';
import SettingsSortModal from '../settings_components/SettingsSortModal';
import { IFilterDto } from '../../../types/commonTypes';
import CreateButton from '../../buttons/CreateButton';
import Modal from '../../basic_components/Modal';
import { Modal as AntdModal } from 'antd';
import CreateDepartmentForm from './CreateDepartmentForm';
import { deleteDepartmentAsync, getAllDepartmentsAsync } from '../../../services/departmentService';
import { IDepartment } from '../../../types/departmentTypes';
import { defaultFilter } from '../../../utils/constants';
import { DepartmentManagementIcon } from '../../../utils/Icons';

const columns = [
  { key: 'departmentCode', label: 'Department Code' },
  { key: 'departmentName', label: 'Department' }
];

const DepartmentManagment: React.FC = () => {
  // Modal States
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<IDepartment>();
  const [confirmAction, setConfirmAction] = useState<{ type: "delete" | "block", department: IDepartment } | null>(null);
  const [departments, setDepartments] = useState<{ data: IDepartment[]; count: number }>({
    data: [],
    count: 0
  });

  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);

  const handleThreeDots = (type: "edit" | "delete", department: IDepartment) => {
    console.log(department)
    setSelectedDepartment(department)
    if (type === "edit") {
      setIsEditModalOpen(true);
    } else {
      setConfirmAction({ type, department });
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction?.type === "delete") {
        await deleteDepartmentAsync(confirmAction.department.id as string);
        notification.success({
          message: "Department deleted successfully"
        })
        setupDepartments();
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      setIsConfirmModalOpen(false);
      notification.error({
        message: "Failed to delete this department",
        description: err.message
      })
    }
  };


  const setupDepartments = async (filterData: IFilterDto = filter) => {
    try {
      const response = await getAllDepartmentsAsync(filterData);
      setDepartments(response);
    } catch (err: any) {
      // notification.error({
      //   message: "Error fetching department",
      //   description: err.message
      // })
    }
  }
  useEffect(() => {
    setFilter({ ...filter, globalSearch: searchQuery })
  }, [searchQuery]);

  useEffect(() => {
    setupDepartments();
  }, [filter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold"><DepartmentManagementIcon/></span>
            </div>
            <div>
              <h1 className="text-heading-2">Department Management</h1>
              <p className="text-body-small text-muted">Organize and manage organizational departments</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
              <span className="text-button text-accent">
                {departments.count} Departments
              </span>
            </div>
            <CreateButton name='Add Department' onClick={() => setIsCreateModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <SettingsTable
          title="Departments"
          columns={columns}
          data={departments.data}
          filter={filter}
          setFilter={setFilter}
          setIsSortModalOpen={setSortModalOpen}
          totalCount={departments.count}
          setSearchQuery={setSearchQuery}
          dots
          setEditOption={(department) => handleThreeDots("edit", department)}
          setDeleteOption={(department) => handleThreeDots("delete", department)}
        />
      </div>

      {/* Modals */}
      <Modal
        content={<CreateDepartmentForm type='create' department={selectedDepartment as IDepartment} closeModal={() => setIsCreateModalOpen(false)} trigger={() => { setupDepartments() }} />}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        modalPosition="end"
        width="w-full md:w-2/6"
        CloseButton={false}
      />
      <Modal
        content={selectedDepartment && <CreateDepartmentForm type='edit' department={selectedDepartment} closeModal={() => setIsEditModalOpen(false)} trigger={() => { setupDepartments() }} />}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        modalPosition="end"
        width="w-full md:w-2/5"
        CloseButton={false}
      />


      <AntdModal
        title={confirmAction?.type === "delete" ? "Confirm Delete" : "Confirm Block"}
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>,
          <Button key="confirm" type="primary" danger={confirmAction?.type === "delete"} onClick={() => handleConfirmAction()}>
            {confirmAction?.type === "delete" ? "Delete" : "Block"}
          </Button>
        ]}
      >
        <p>Are you sure you want to {confirmAction?.type} this department?</p>
      </AntdModal>

      {/* Filter & Sort Modals */}
      {/* {filterModalOpen && (
        <SettingsFilterModal
          defaultFilter={{ fields: [], sortColumn: "CreatedAt", sortOrder: "DSCE" }}
          filter={filter}
          setFilter={setFilter}
          setIsFilterModalOpen={setFilterModalOpen}
          type="department"
        />
      )} */}
      {sortModalOpen && (
        <SettingsSortModal
          filter={filter}
          setFilter={setFilter}
          setIsSettingsSortModalOpen={setSortModalOpen}
          type='department'
        />
      )}
    </div>
  );
};

export default DepartmentManagment;
