import { RFP_STATUS } from "../../utils/constants";

export const LOCAL_RFP_APPROVAL_STORAGE_KEY = "mpc-rfp-local-approval-v1";

export type LocalRfpApprovalFlowType = "rfp" | "rfpproposal" | "rfpaward";
export type LocalRfpApprovalStepStatus = 0 | 1 | 2;

export interface LocalRfpApprovalStepDefinition {
  id: number;
  status: LocalRfpApprovalStepStatus;
  approverId?: number;
  approverName?: string;
  approverEmail?: string;
  approverRole?: string;
  stepOrder?: number;
  actionDate?: string;
  comments?: string;
  photo?: string;
  approvalRequestId?: number;
}

export interface LocalRfpApprovalStep {
  stepId: number;
  status: LocalRfpApprovalStepStatus;
  comments?: string;
  actionDate?: string;
  approverId?: number;
  approverName?: string;
  approverEmail?: string;
  approverRole?: string;
  stepOrder?: number;
}

interface LocalRfpApprovalFlowHistory {
  steps: LocalRfpApprovalStep[];
  selectedProposalId?: number;
  archivedAt: string;
}

export interface LocalRfpApprovalFlow {
  flowType: LocalRfpApprovalFlowType;
  definitions: LocalRfpApprovalStepDefinition[];
  steps: LocalRfpApprovalStep[];
  selectedProposalId?: number;
  initializedAt: string;
  updatedAt: string;
  history?: LocalRfpApprovalFlowHistory[];
}

export interface LocalRfpApprovalRecord {
  rfpId: number;
  statusOverride?: number;
  flows: Partial<Record<LocalRfpApprovalFlowType, LocalRfpApprovalFlow>>;
}

interface LocalRfpApprovalState {
  version: 1;
  records: Record<string, LocalRfpApprovalRecord>;
}

export interface LocalRfpApprovalActionParams {
  rfpId: number;
  flowType: LocalRfpApprovalFlowType;
  stepId: number;
  comments: string;
  proposalId?: number;
  actingUserId?: number;
  approverName?: string;
  approverEmail?: string;
  approverRole?: string;
}

const EMPTY_STATE: LocalRfpApprovalState = { version: 1, records: {} };
const validFlowTypes: LocalRfpApprovalFlowType[] = ["rfp", "rfpproposal", "rfpaward"];

const isStepStatus = (value: unknown): value is LocalRfpApprovalStepStatus =>
  value === 0 || value === 1 || value === 2;

const isFlowType = (value: unknown): value is LocalRfpApprovalFlowType =>
  typeof value === "string" && validFlowTypes.includes(value as LocalRfpApprovalFlowType);

const toFiniteNumber = (value: unknown): number | undefined => {
  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
};

const readState = (): LocalRfpApprovalState => {
  if (typeof window === "undefined") return { ...EMPTY_STATE, records: {} };
  try {
    const raw = window.localStorage.getItem(LOCAL_RFP_APPROVAL_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE, records: {} };
    const parsed = JSON.parse(raw) as Partial<LocalRfpApprovalState>;
    if (
      parsed.version !== 1 ||
      !parsed.records ||
      typeof parsed.records !== "object" ||
      Array.isArray(parsed.records)
    ) {
      return { ...EMPTY_STATE, records: {} };
    }
    return { version: 1, records: parsed.records as Record<string, LocalRfpApprovalRecord> };
  } catch {
    return { ...EMPTY_STATE, records: {} };
  }
};

const writeState = (state: LocalRfpApprovalState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_RFP_APPROVAL_STORAGE_KEY, JSON.stringify(state));
};

const getOrCreateRecord = (state: LocalRfpApprovalState, rfpId: number): LocalRfpApprovalRecord => {
  const key = String(rfpId);
  const existing = state.records[key];
  if (existing && existing.rfpId === rfpId && existing.flows && typeof existing.flows === "object") {
    return existing;
  }
  const created: LocalRfpApprovalRecord = { rfpId, flows: {} };
  state.records[key] = created;
  return created;
};

const normalizeDefinition = (step: unknown): LocalRfpApprovalStepDefinition | undefined => {
  if (!step || typeof step !== "object") return undefined;
  const source = step as Record<string, unknown>;
  const id = toFiniteNumber(source.id);
  if (id === undefined) return undefined;
  const rawStatus = toFiniteNumber(source.status);
  const status: LocalRfpApprovalStepStatus = isStepStatus(rawStatus) ? rawStatus : 0;
  return {
    id,
    status,
    approverId: toFiniteNumber(source.approverId),
    approverName: typeof source.approverName === "string" ? source.approverName : undefined,
    approverEmail: typeof source.approverEmail === "string" ? source.approverEmail : undefined,
    approverRole: typeof source.approverRole === "string" ? source.approverRole : undefined,
    stepOrder: toFiniteNumber(source.stepOrder),
    actionDate: typeof source.actionDate === "string" ? source.actionDate : undefined,
    comments: typeof source.comments === "string" ? source.comments : undefined,
    photo: typeof source.photo === "string" ? source.photo : undefined,
    approvalRequestId: toFiniteNumber(source.approvalRequestId),
  };
};

const sortDefinitions = (steps: LocalRfpApprovalStepDefinition[]) =>
  [...steps].sort((a, b) => (a.stepOrder ?? Number.MAX_SAFE_INTEGER) - (b.stepOrder ?? Number.MAX_SAFE_INTEGER));

export const normalizeRfpApprovalFlowType = (flowType: string): LocalRfpApprovalFlowType => {
  const normalized = flowType === "rfpsubmission" ? "rfp" : flowType;
  if (!isFlowType(normalized)) throw new Error(`Unsupported RFP approval flow: ${flowType}`);
  return normalized;
};

export const getBackendRfpApprovalFlowType = (flowType: LocalRfpApprovalFlowType) =>
  flowType === "rfp" ? "rfpsubmission" : flowType;

export const cacheRfpApprovalDefinition = (
  rfpId: number,
  flowType: LocalRfpApprovalFlowType,
  steps: unknown[],
): void => {
  const deduplicated = new Map<number, LocalRfpApprovalStepDefinition>();
  steps.forEach((step) => {
    const normalized = normalizeDefinition(step);
    if (normalized) deduplicated.set(normalized.id, normalized);
  });

  const state = readState();
  const record = getOrCreateRecord(state, rfpId);
  const now = new Date().toISOString();
  const existing = record.flows[flowType];
  record.flows[flowType] = {
    flowType,
    definitions: sortDefinitions([...deduplicated.values()]),
    steps: Array.isArray(existing?.steps) ? existing.steps : [],
    selectedProposalId: existing?.selectedProposalId,
    initializedAt: existing?.initializedAt ?? now,
    updatedAt: now,
    history: existing?.history,
  };
  writeState(state);
};

export const hasCachedRfpApprovalDefinition = (
  rfpId: number,
  flowType: LocalRfpApprovalFlowType,
): boolean => {
  const flow = readState().records[String(rfpId)]?.flows?.[flowType];
  return Boolean(flow && Array.isArray(flow.definitions));
};

export const getEffectiveRfpApprovalSteps = (
  rfpId: number,
  flowType: LocalRfpApprovalFlowType,
  backendSteps: unknown[] = [],
): LocalRfpApprovalStepDefinition[] => {
  const flow = readState().records[String(rfpId)]?.flows?.[flowType];
  const source = backendSteps.length > 0
    ? backendSteps.map(normalizeDefinition).filter((step): step is LocalRfpApprovalStepDefinition => Boolean(step))
    : Array.isArray(flow?.definitions) ? flow.definitions.map(normalizeDefinition).filter((step): step is LocalRfpApprovalStepDefinition => Boolean(step)) : [];
  const actions = new Map(
    (Array.isArray(flow?.steps) ? flow.steps : [])
      .filter((step) => step && Number.isFinite(Number(step.stepId)) && isStepStatus(Number(step.status)))
      .map((step) => [Number(step.stepId), step]),
  );

  return sortDefinitions(source).map((definition) => {
    const action = actions.get(definition.id);
    if (!action) return definition;
    return {
      ...definition,
      status: action.status,
      comments: action.comments,
      actionDate: action.actionDate,
      approverId: action.approverId ?? definition.approverId,
      approverName: action.approverName ?? definition.approverName,
      approverEmail: action.approverEmail ?? definition.approverEmail,
      approverRole: action.approverRole ?? definition.approverRole,
      stepOrder: action.stepOrder ?? definition.stepOrder,
    };
  });
};

const completionStatus: Record<LocalRfpApprovalFlowType, number> = {
  rfp: RFP_STATUS.APPROVED,
  rfpproposal: RFP_STATUS.UNDER_EVALUATION,
  rfpaward: RFP_STATUS.CLOSED,
};

const rejectionStatus: Record<LocalRfpApprovalFlowType, number> = {
  rfp: RFP_STATUS.REJECTED,
  rfpproposal: RFP_STATUS.PUBLISHED,
  rfpaward: RFP_STATUS.UNDER_EVALUATION,
};

const persistAction = (
  params: LocalRfpApprovalActionParams,
  status: 1 | 2,
): LocalRfpApprovalRecord => {
  const state = readState();
  const record = getOrCreateRecord(state, params.rfpId);
  const flow = record.flows[params.flowType];
  if (!flow || !Array.isArray(flow.definitions) || flow.definitions.length === 0) {
    throw new Error("The approval workflow is unavailable. Reload it before taking action.");
  }

  const effectiveSteps = getEffectiveRfpApprovalSteps(params.rfpId, params.flowType);
  if (effectiveSteps.some((step) => step.status === 2)) {
    throw new Error("This approval phase has already been rejected.");
  }
  const currentIndex = effectiveSteps.findIndex((step) => step.status !== 1);
  const currentStep = effectiveSteps[currentIndex];
  if (!currentStep || currentStep.status !== 0 || currentStep.id !== params.stepId) {
    throw new Error("Only the current pending approval step can be actioned.");
  }
  if (currentIndex > 0 && effectiveSteps[currentIndex - 1].status !== 1) {
    throw new Error("The previous approval step must be approved first.");
  }
  if (
    currentStep.approverId === undefined ||
    params.actingUserId !== currentStep.approverId
  ) {
    throw new Error("Only the assigned approver can action this step.");
  }
  if (params.flowType === "rfpaward" && status === 1 && !params.proposalId) {
    throw new Error("Select a vendor proposal before approving the award.");
  }

  const now = new Date().toISOString();
  const action: LocalRfpApprovalStep = {
    stepId: currentStep.id,
    status,
    comments: params.comments,
    actionDate: now,
    approverId: currentStep.approverId,
    approverName: params.approverName ?? currentStep.approverName,
    approverEmail: params.approverEmail ?? currentStep.approverEmail,
    approverRole: params.approverRole ?? currentStep.approverRole,
    stepOrder: currentStep.stepOrder,
  };
  const existingActions = Array.isArray(flow.steps) ? flow.steps : [];
  flow.steps = [...existingActions.filter((step) => Number(step.stepId) !== currentStep.id), action];
  if (params.proposalId) flow.selectedProposalId = params.proposalId;
  flow.updatedAt = now;

  if (status === 2) {
    record.statusOverride = rejectionStatus[params.flowType];
  } else {
    const updatedSteps = effectiveSteps.map((step) => step.id === currentStep.id ? { ...step, status: 1 as const } : step);
    if (updatedSteps.every((step) => step.status === 1)) {
      record.statusOverride = completionStatus[params.flowType];
    }
  }
  writeState(state);
  return record;
};

export const approveRfpStepLocally = (params: LocalRfpApprovalActionParams) =>
  persistAction(params, 1);

export const rejectRfpStepLocally = (params: LocalRfpApprovalActionParams) =>
  persistAction(params, 2);

export const getLocalRfpStatusOverride = (rfpId: number): number | undefined => {
  const value = readState().records[String(rfpId)]?.statusOverride;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

export const getLocalRfpStatusOverrides = (): Array<{ rfpId: number; status: number }> =>
  Object.values(readState().records)
    .filter((record): record is LocalRfpApprovalRecord =>
      Boolean(
        record &&
        typeof record === "object" &&
        Number.isFinite(record.rfpId) &&
        Number.isFinite(record.statusOverride),
      ),
    )
    .map((record) => ({ rfpId: record.rfpId, status: record.statusOverride as number }));

export const setLocalRfpStatusOverride = (rfpId: number, status: number): void => {
  if (!Number.isFinite(rfpId) || !Number.isFinite(status)) {
    throw new Error("A valid RFP ID and status are required.");
  }
  const state = readState();
  getOrCreateRecord(state, rfpId).statusOverride = status;
  writeState(state);
};

export const applyLocalRfpStatus = <T extends { id: number; status: number }>(rfp: T): T => {
  const statusOverride = getLocalRfpStatusOverride(Number(rfp.id));
  return statusOverride === undefined ? rfp : { ...rfp, status: statusOverride };
};

export const resetRfpApprovalFlow = (
  rfpId: number,
  flowType: LocalRfpApprovalFlowType,
): void => {
  const state = readState();
  const record = getOrCreateRecord(state, rfpId);
  const flow = record.flows[flowType];
  if (!flow) return;
  const now = new Date().toISOString();
  const actions = Array.isArray(flow.steps) ? flow.steps : [];
  const history = Array.isArray(flow.history) ? [...flow.history] : [];
  if (actions.length > 0) {
    history.push({ steps: actions, selectedProposalId: flow.selectedProposalId, archivedAt: now });
  }
  const definitions = Array.isArray(flow.definitions) ? flow.definitions : [];
  flow.steps = definitions
    .map(normalizeDefinition)
    .filter((definition): definition is LocalRfpApprovalStepDefinition => Boolean(definition))
    .map((definition) => ({ stepId: definition.id, status: 0 }));
  flow.selectedProposalId = undefined;
  flow.updatedAt = now;
  flow.history = history;
  writeState(state);
};

export const restartRejectedRfpApprovalFlow = (
  rfpId: number,
  flowType: LocalRfpApprovalFlowType,
  nextStatus: number,
): boolean => {
  if (!getEffectiveRfpApprovalSteps(rfpId, flowType).some((step) => step.status === 2)) {
    return false;
  }
  resetRfpApprovalFlow(rfpId, flowType);
  setLocalRfpStatusOverride(rfpId, nextStatus);
  return true;
};
