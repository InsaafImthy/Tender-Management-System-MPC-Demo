import React, { useEffect, useState } from 'react';
import ApprovalWorkflowForm from './ApprovalWorkflowForm';
import { getApprovalFlowAsync } from '../../../services/flowService';
import { IUserDetails } from '../../../types/userTypes';
import ViewApprovalFlow from './ViewApprovalFlowCard';
import { getAllUsersByFilterAsync } from '../../../services/userService';
import { ApprovalFlowIcon } from '../../../utils/Icons';

const tabs = [
  { label: "Vendor Approvalflow", type: "vendor", flowType: 1 },
  { label: "RFP Approvalflow", type: "rfpsubmission", flowType: 2 },
  { label: "RFP Proposal", type: "rfpproposal", flowType: 3 },
  { label: "RFP Award", type: "rfpaward", flowType: 4 },
];

const ApprovalWorkflow: React.FC = () => {
  const [trigger, setTrigger] = useState(false);
  const [, setIsCreateModalOpen] = useState(false);
  const [usersData, setUsersData] = useState<IUserDetails[] | null>(null);
  const [workflow, setWorkflow] = useState<any>();
  const [viewType, seViewType] = useState<"view" | "edit" | "create" | "no-access">("view");
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const setWorkflowsData = async () => {
    try {
      try {
        const response = await getApprovalFlowAsync(activeTab.type);
        console.log(response, "response-approv");
        setWorkflow(response);
      } catch (err: any) {
        console.log(err);
        if (err.status && err.status === 403) {
          seViewType("no-access");
          return;
        } else {
          seViewType("create");
        }
      }

      let users: any = await getAllUsersByFilterAsync();
      setUsersData(users.items);
      setTrigger(false);
    } catch (error: any) {
      // notification.error({
      //   message: "Error",
      //   description: error.message,
      // });
    }
  };

  useEffect(() => {
    setWorkflowsData();
    setWorkflow(undefined);
  }, [activeTab, trigger]);

  return (
    <div className="admin-inner">
      {/* Header Section */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div className="admin-title-cluster">
            <div className="admin-title-icon">
              <span className="text-white text-2xl font-bold"><ApprovalFlowIcon/></span>
            </div>
            <div>
              <h1 className="text-heading-2">Approval Workflow</h1>
              <p className="text-body-small text-muted">Configure approval processes and workflows</p>
            </div>
          </div>
          <div className="admin-count-badge">
            <span>
              Workflow Management
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <div className="admin-tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab);
                seViewType("view");
              }}
              className={`admin-tab ${
                activeTab.label === tab.label
                  ? "admin-tab-active"
                  : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="app-surface p-6">
        {viewType === "view" ? (
          <ViewApprovalFlow
            label={activeTab.label}
            seViewType={seViewType as any}
            flowDetails={workflow as any}
            usersData={usersData || []}
            closeModal={() => setIsCreateModalOpen(false)}
            trigger={() => {}}
          />
        ) : viewType === "no-access" ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-violet-50 border border-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-sm font-bold text-violet-700">NA</span>
            </div>
            <h3 className="text-heading-4 mb-2">Access Denied</h3>
            <p className="text-body text-muted">You don't have access to view this workflow</p>
          </div>
        ) : (
          <ApprovalWorkflowForm
            flowType={activeTab.flowType}
            seViewType={seViewType as any}
            type={viewType as any}
            closeModal={() => setIsCreateModalOpen(false)}
            trigger={() => {
              setTrigger(true);
            }}
            initialData={workflow}
          />
        )}
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
