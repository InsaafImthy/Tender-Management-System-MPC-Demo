import { Button, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import SettingsTable from '../settings_components/SettingsTable';
import SettingsSortModal from '../settings_components/SettingsSortModal';
import { IFilterDto } from '../../../types/commonTypes';
import CreateButton from '../../buttons/CreateButton';
import Modal from '../../basic_components/Modal';
import { Modal as AntdModal } from 'antd';
import CreateQuestionnaireForm from './CreateQuestionnaireForm';
import { deleteQuestionnaireAsync, getAllQuestionnairesAsync } from '../../../services/questionnaireService';
import { IQuestionnaire } from '../../../types/questionnaireTypes';
import { defaultFilter } from '../../../utils/constants';
import { QuestionnaireManagementIcon } from '../../../utils/Icons';

const columns = [
  { key: 'questionnaireName', label: 'Questionnaire Name' },
  { key: 'description', label: 'Description' },
  { key: 'questionsCount', label: 'Questions Count' }
];

const QuestionnaireManagment: React.FC = () => {
  // Modal States
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<IQuestionnaire>();
  const [confirmAction, setConfirmAction] = useState<{ type: "delete" | "block", questionnaire: IQuestionnaire } | null>(null);
  const [questionnaires, setQuestionnaires] = useState<{ data: IQuestionnaire[]; count: number }>({
    data: [],
    count: 0
  });

  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);

  const handleThreeDots = (type: "edit" | "delete", questionnaire: IQuestionnaire) => {
    console.log(questionnaire)
    setSelectedQuestionnaire(questionnaire)
    if (type === "edit") {
      setIsEditModalOpen(true);
    } else {
      setConfirmAction({ type, questionnaire });
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction?.type === "delete") {
        await deleteQuestionnaireAsync(confirmAction.questionnaire.id as string);
        notification.success({
          message: "Questionnaire deleted successfully"
        })
        setupQuestionnaires();
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      setIsConfirmModalOpen(false);
      notification.error({
        message: "Failed to delete this questionnaire",
        description: err.message
      })
    }
  };


  const setupQuestionnaires = async (filterData: IFilterDto = filter) => {
    try {
      const response = await getAllQuestionnairesAsync(filterData);
      // Transform data to include questions count for display
      const transformedData = response.data.map(q => ({
        ...q,
        questionsCount: q.questionnaireItemDtos?.length || 0
      }));
      setQuestionnaires({ ...response, data: transformedData });
    } catch (err: any) {
      // notification.error({
      //   message: "Error fetching questionnaires",
      //   description: err.message
      // })
    }
  }
  useEffect(() => {
    setFilter({ ...filter, globalSearch: searchQuery })
  }, [searchQuery]);

  useEffect(() => {
    setupQuestionnaires();
  }, [filter])

  return (
    <div className="admin-inner">
      {/* Header Section */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div className="admin-title-cluster">
            <div className="admin-title-icon">
              <span className="text-white text-2xl font-bold"><QuestionnaireManagementIcon/></span>
            </div>
            <div>
              <h1 className="text-heading-2">Questionnaire Management</h1>
              <p className="text-body-small text-muted">Create and manage questionnaires for procurement processes</p>
            </div>
          </div>
          <div className="admin-title-actions">
            <div className="admin-count-badge">
              <span>
                {questionnaires.count} Questionnaires
              </span>
            </div>
            <CreateButton name='Add Questionnaire' onClick={() => setIsCreateModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="admin-panel">
        <SettingsTable
          title="Questionnaires"
          columns={columns}
          data={questionnaires.data}
          filter={filter}
          setFilter={setFilter}
          setIsSortModalOpen={setSortModalOpen}
          totalCount={questionnaires.count}
          setSearchQuery={setSearchQuery}
          dots
          setEditOption={(questionnaire) => handleThreeDots("edit", questionnaire)}
          setDeleteOption={(questionnaire) => handleThreeDots("delete", questionnaire)}
        />
      </div>

      {/* Modals */}
      <Modal
        content={<CreateQuestionnaireForm type='create' questionnaire={selectedQuestionnaire as IQuestionnaire} closeModal={() => setIsCreateModalOpen(false)} trigger={() => { setupQuestionnaires() }} />}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        modalPosition="end"
        width="w-full md:w-2/6"
        CloseButton={false}
      />
      <Modal
        content={selectedQuestionnaire && <CreateQuestionnaireForm type='edit' questionnaire={selectedQuestionnaire} closeModal={() => setIsEditModalOpen(false)} trigger={() => { setupQuestionnaires() }} />}
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
        <p>Are you sure you want to {confirmAction?.type} this questionnaire?</p>
      </AntdModal>

      {/* Filter & Sort Modals */}
      {/* {filterModalOpen && (
        <SettingsFilterModal
          defaultFilter={{ fields: [], sortColumn: "CreatedAt", sortOrder: "DSCE" }}
          filter={filter}
          setFilter={setFilter}
          setIsFilterModalOpen={setFilterModalOpen}
          type="questionnaire"
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

export default QuestionnaireManagment;
