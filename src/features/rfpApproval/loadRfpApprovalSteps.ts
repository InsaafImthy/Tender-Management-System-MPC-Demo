import { getRpfApprovalFlowsByIdAsync } from "../../services/flowService";
import type { IStep } from "../../types/approvalflowTypes";
import {
  cacheRfpApprovalDefinition,
  getBackendRfpApprovalFlowType,
  getEffectiveRfpApprovalSteps,
  hasCachedRfpApprovalDefinition,
  type LocalRfpApprovalFlowType,
} from "./localRfpApprovalStore";

export interface EffectiveRfpApprovalResult {
  steps: IStep[];
  usedCachedDefinition: boolean;
}

export interface EffectiveRfpApprovalDefinitionResult {
  steps: ReturnType<typeof getEffectiveRfpApprovalSteps>;
  usedCachedDefinition: boolean;
}

const toDisplaySteps = (steps: ReturnType<typeof getEffectiveRfpApprovalSteps>, currentUserId: string): IStep[] => {
  const rejected = steps.some((step) => step.status === 2);
  const currentIndex = rejected ? -1 : steps.findIndex((step) => step.status === 0);
  return steps.map((step, index) => ({
    id: step.id,
    photo: step.photo ?? "",
    current: index === currentIndex && String(step.approverId ?? "") === currentUserId,
    approvalRequestId: step.approvalRequestId ?? 0,
    approverName: step.approverName ?? "",
    approverRole: step.approverRole ?? "",
    approverEmail: step.approverEmail ?? "",
    stepOrder: step.stepOrder ?? index + 1,
    status: step.status === 0 ? "pending" : step.status === 1 ? "approved" : "rejected",
    actionDate: step.actionDate ?? "",
    comments: step.comments ?? "",
    approverId: step.approverId ?? 0,
  }));
};

export const loadRfpApprovalStepDefinitions = async (
  rfpId: number,
  flowType: LocalRfpApprovalFlowType,
): Promise<EffectiveRfpApprovalDefinitionResult> => {
  try {
    const response = await getRpfApprovalFlowsByIdAsync(
      String(rfpId),
      getBackendRfpApprovalFlowType(flowType),
    );
    const backendSteps = Array.isArray(response) ? response : [];
    cacheRfpApprovalDefinition(rfpId, flowType, backendSteps);
    return {
      steps: getEffectiveRfpApprovalSteps(rfpId, flowType, backendSteps),
      usedCachedDefinition: false,
    };
  } catch (error) {
    if (!hasCachedRfpApprovalDefinition(rfpId, flowType)) throw error;
    return {
      steps: getEffectiveRfpApprovalSteps(rfpId, flowType),
      usedCachedDefinition: true,
    };
  }
};

export const loadRfpApprovalSteps = async (
  rfpId: number,
  flowType: LocalRfpApprovalFlowType,
  currentUserId: string,
): Promise<EffectiveRfpApprovalResult> => {
  const result = await loadRfpApprovalStepDefinitions(rfpId, flowType);
  return {
    steps: toDisplaySteps(result.steps, currentUserId),
    usedCachedDefinition: result.usedCachedDefinition,
  };
};
