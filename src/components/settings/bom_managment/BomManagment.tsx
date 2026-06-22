import { Button, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import CreateButton from '../../buttons/CreateButton';
import Modal from '../../basic_components/Modal';
import { Modal as AntdModal } from 'antd';
import SettingsTable from '../settings_components/SettingsTable';
import { IFilterDto } from '../../../types/commonTypes';
import { defaultFilter } from '../../../utils/constants';
import SettingsSortModal from '../settings_components/SettingsSortModal';
import { getAllBomsAsync, deleteBomAsync } from '../../../services/bomService';
import { IBom } from '../../../types/bomTypes';
import BomUpsertForm from './BomUpsertForm.tsx';
import BomDetailModal from './BomDetailModal';

const columns = [
  { key: 'bomName', label: 'Product List Name' },
  { key: 'categoryName', label: 'Category' },
];

const BomManagment: React.FC = () => {
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBom, setSelectedBom] = useState<IBom | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete'; bom: IBom } | null>(null);
  const [boms, setBoms] = useState<IBom[]>([]);
  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleThreeDots = (type: 'edit' | 'delete', bom: IBom) => {
    setSelectedBom(bom);
    if (type === 'edit') {
      setIsEditModalOpen(true);
    } else {
      setConfirmAction({ type, bom });
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction?.type === 'delete') {
        await deleteBomAsync(confirmAction.bom.id ?? 0);
        notification.success({ message: 'Product list deleted successfully' });
        setupBoms();
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      setIsConfirmModalOpen(false);
      notification.error({ message: 'Failed to delete this product list', description: err.message });
    }
  };

  const setupBoms = async (filterData: IFilterDto = defaultFilter) => {
    try {
      const response = await getAllBomsAsync({ ...filterData, globalSearch: searchQuery });
      const mapped = (response?.data || []).map((b: IBom) => ({
        ...b,
        categoryName:b?.category?.name,
        dot: true,
      }));
      setBoms(mapped);
    } catch { }
  };

  useEffect(() => {
    setupBoms(filter);
  }, [searchQuery, filter]);

  return (
    <div className="admin-inner">
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div className="admin-title-cluster">
            <div className="admin-title-icon">
              <span className="text-white text-sm font-bold">PL</span>
            </div>
            <div>
              <h1 className="text-heading-2">Product List Management</h1>
              <p className="text-body-small text-muted">Define and manage medicine and medical supply lists</p>
            </div>
          </div>
          <div className="admin-title-actions">
            <div className="admin-count-badge">
              <span>{boms.length} Product Lists</span>
            </div>
            <CreateButton name='Create Product List' onClick={() => setIsCreateModalOpen(true)} />
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <SettingsTable
          title="Product Lists"
          columns={columns}
          data={boms}
          setIsSortModalOpen={setSortModalOpen}
          totalCount={boms.length}
          setSearchQuery={setSearchQuery}
          dots
          onRowClick={(item: any) => { setSelectedBom(item); setDetailOpen(true); }}
          setEditOption={(bom) => handleThreeDots('edit', bom)}
          setDeleteOption={(bom) => handleThreeDots('delete', bom)}
          setFilter={() => { }}
        />
      </div>

      {sortModalOpen && (
        <SettingsSortModal filter={filter} setFilter={setFilter} setIsSettingsSortModalOpen={setSortModalOpen} type="category" />
      )}

      <Modal
        content={<BomUpsertForm type='create' bom={{ bomName: '', description: '', bomItemDtos: [] }} closeModal={() => setIsCreateModalOpen(false)} trigger={() => setupBoms()} />}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        modalPosition="end"
        width="w-full md:w-3/5"
        CloseButton={false}
      />

      <Modal
        content={selectedBom && <BomUpsertForm type='edit' bom={selectedBom} closeModal={() => setIsEditModalOpen(false)} trigger={() => setupBoms()} />}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        modalPosition="end"
        width="w-full md:w-3/5"
        CloseButton={false}
      />

      <AntdModal
        title="Confirm Delete"
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>,
          <Button key="confirm" type="primary" danger onClick={handleConfirmAction}>Delete</Button>
        ]}
      >
        <p>Are you sure you want to delete this product list?</p>
      </AntdModal>

      <BomDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} bom={selectedBom as any} />
    </div>
  );
};

export default BomManagment;
