import { Button, notification } from 'antd';
import React, { useEffect, useState } from 'react';

import CreateButton from '../../buttons/CreateButton';
import Modal from '../../basic_components/Modal';
import { Modal as AntdModal } from 'antd';
import CreateCategoryForm from './CreateCategoryForm';
import { deleteCategoryAsync, getAllCategoriesAsync } from '../../../services/categoryService';
import { ICategory } from '../../../types/categoryTypes';
import SettingsTable from '../settings_components/SettingsTable';
import { IFilterDto } from '../../../types/commonTypes';
import { defaultFilter } from '../../../utils/constants';
import SettingsSortModal from '../settings_components/SettingsSortModal';
import { CategoryManagementIcon } from '../../../utils/Icons';

const columns = [
  { key: 'name', label: 'Category Name' },
  { key: 'description', label: 'Description' }
];

const CategoryManagment: React.FC = () => {
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory>();
  const [confirmAction, setConfirmAction] = useState<{ type: "delete", category: ICategory } | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);

  const handleThreeDots = (type: "edit" | "delete", category: ICategory) => {
    setSelectedCategory(category);
    if (type === "edit") {
      setIsEditModalOpen(true);
    } else {
      setConfirmAction({ type, category });
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction?.type === "delete") {
        await deleteCategoryAsync(confirmAction.category.id);
        notification.success({ message: "Category deleted successfully" });
        setupCategories();
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      setIsConfirmModalOpen(false);
      notification.error({
        message: "Failed to delete this category",
        description: err.message
      });
    }
  };

  const setupCategories = async (filterData: IFilterDto = defaultFilter) => {
    try {
      const response = await getAllCategoriesAsync(filterData);
      console.log(response)
      setCategories(response || []);
    } catch (err: any) {
      // notification.error({
      //   message: "Error fetching categories",
      //   description: err.message
      // });
    }
  };

  useEffect(() => {
    setupCategories({ ...filter, globalSearch: searchQuery });
  }, [searchQuery,filter]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold"><CategoryManagementIcon/></span>
            </div>
            <div>
              <h1 className="text-heading-2">Category Management</h1>
              <p className="text-body-small text-muted">Organize and manage procurement categories</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
              <span className="text-button text-accent">
                {categories.length} Categories
              </span>
            </div>
            <CreateButton name='Add Category' onClick={() => setIsCreateModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <SettingsTable
          title="Categories"
          columns={columns}
          data={categories}
          setIsSortModalOpen={setSortModalOpen}
          totalCount={categories.length}
          setSearchQuery={setSearchQuery}
          dots
          setEditOption={(category) => handleThreeDots("edit", category)}
          setDeleteOption={(category) => handleThreeDots("delete", category)}
          setFilter={() => { }}
        />
      </div>
      {sortModalOpen && <SettingsSortModal filter={filter} setFilter={setFilter} setIsSettingsSortModalOpen={setSortModalOpen} type="department"/>}

      <Modal
        content={<CreateCategoryForm type='create' category={{ id: 0, name: '', description: '', clientId: 0, createdAt: '', createdBy: 0, updatedAt: '', updatedBy: 0, isdeleted: false, deletedBy: 0, tenantId: 0, companyId: 0, branchId: 0 }} closeModal={() => setIsCreateModalOpen(false)} trigger={setupCategories} />}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        modalPosition="end"
        width="w-full md:w-2/6"
        CloseButton={false}
      />

      <Modal
        content={selectedCategory && <CreateCategoryForm type='edit' category={selectedCategory} closeModal={() => setIsEditModalOpen(false)} trigger={setupCategories} />}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        modalPosition="end"
        width="w-full md:w-2/5"
        CloseButton={false}
      />

      <AntdModal
        title="Confirm Delete"
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>,
          <Button key="confirm" type="primary" danger onClick={handleConfirmAction}>
            Delete
          </Button>
        ]}
      >
        <p>Are you sure you want to delete this category?</p>
      </AntdModal>
    </div>
  );
};

export default CategoryManagment;
