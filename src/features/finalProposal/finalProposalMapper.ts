import { RFP_STATUS } from "../../utils/constants";
import { createDemoElectronicSignature } from "./electronicSignature";
import type {
  ApprovalStepSource,
  FinalApprovalDetails,
  FinalProposalDocument,
  FinalProposalItem,
  FinalProposalReadiness,
  FinalProposalRfpItemSource,
  FinalProposalSourceData,
  SelectedProposalSource,
} from "./finalProposalTypes";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const cleanOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return cleaned || undefined;
};

const selectApprovedProposal = (
  proposals: SelectedProposalSource[],
  awardedProposalId?: number,
): SelectedProposalSource | undefined => {
  if (isFiniteNumber(awardedProposalId) && awardedProposalId > 0) {
    return proposals.find((proposal) => proposal.id === awardedProposalId);
  }

  return proposals.length === 1 ? proposals[0] : undefined;
};

const mapApproval = (
  steps: ApprovalStepSource[] = [],
): FinalApprovalDetails | undefined => {
  const approvedSteps = steps
    .filter((step) => step.status === RFP_STATUS.APPROVED)
    .sort((left, right) => (left.stepOrder ?? 0) - (right.stepOrder ?? 0));
  const finalStep = approvedSteps[approvedSteps.length - 1];
  if (!finalStep) return undefined;

  const approval: FinalApprovalDetails = {
    approvedBy: cleanOptionalText(finalStep.approverName),
    approvalRole: cleanOptionalText(finalStep.approverRole),
    approvalDate: cleanOptionalText(finalStep.actionDate),
  };

  return Object.values(approval).some(Boolean) ? approval : undefined;
};

const resolveRfpItem = (
  proposalItemId: number | undefined,
  nestedItem: FinalProposalRfpItemSource | undefined,
  rfpItems: FinalProposalRfpItemSource[],
) => nestedItem ?? rfpItems.find((item) => item.id === proposalItemId);

export const buildFinalProposalDocument = ({
  rfp,
  selectedProposals,
  decisionPaper,
  approvalSteps,
}: FinalProposalSourceData): FinalProposalReadiness => {
  if (rfp.status !== RFP_STATUS.APPROVED) {
    return {
      ready: false,
      reason: "This proposal is not yet approved for external submission.",
    };
  }

  const tenderNumber = cleanOptionalText(rfp.tenderNumber);
  const tenderTitle = cleanOptionalText(rfp.rfpTitle);
  if (!tenderNumber || !tenderTitle) {
    return {
      ready: false,
      reason: "Tender reference and title are required before generating the final proposal.",
    };
  }

  const selectedProposal = selectApprovedProposal(
    selectedProposals,
    decisionPaper?.vendorRfpProposalId,
  );
  if (!selectedProposal) {
    return {
      ready: false,
      reason:
        selectedProposals.length > 1
          ? "Unable to generate the final proposal until one awarded proposal is identified."
          : "Unable to generate the final proposal because approved pricing data is unavailable.",
    };
  }

  if (!isFiniteNumber(selectedProposal.bidAmount) || selectedProposal.bidAmount <= 0) {
    return {
      ready: false,
      reason: "Unable to generate the final proposal because the final bid value is unavailable.",
    };
  }

  const proposalItems = selectedProposal.vendorRfpProposalItems ?? [];
  if (proposalItems.length === 0) {
    return {
      ready: false,
      reason: "Unable to generate the final proposal because approved item pricing is unavailable.",
    };
  }

  const mappedItems: FinalProposalItem[] = [];
  for (const proposalItem of proposalItems) {
    const rfpItem = resolveRfpItem(
      proposalItem.rfpItemId,
      proposalItem.rfpItem,
      rfp.rfpItems ?? [],
    );
    const itemName = cleanOptionalText(rfpItem?.itemName);
    const quantity = rfpItem?.quantity;

    if (
      !itemName ||
      !isFiniteNumber(quantity) ||
      quantity <= 0 ||
      !isFiniteNumber(proposalItem.amount) ||
      proposalItem.amount < 0
    ) {
      return {
        ready: false,
        reason:
          "Unable to generate the final proposal because one or more approved item values are incomplete.",
      };
    }

    mappedItems.push({
      productCode: cleanOptionalText(rfpItem?.itemCode) ?? "-",
      name: itemName,
      quantity,
      finalValue: proposalItem.amount,
    });
  }

  const generatedAt = new Date().toISOString();
  const approval = mapApproval(approvalSteps);
  const signatureDate = approval?.approvalDate ?? generatedAt;

  const document: FinalProposalDocument = {
    tenderNumber,
    tenderTitle,
    description:
      cleanOptionalText(rfp.finalProposalDescription) ??
      cleanOptionalText(rfp.rfpDescription),
    buyerName: cleanOptionalText(rfp.buyerName),
    buyerOrganization: cleanOptionalText(rfp.buyerOrganizationName),
    department: cleanOptionalText(rfp.departmentName),
    purchaseRequisitionId: cleanOptionalText(rfp.purchaseRequisitionId),
    currency: cleanOptionalText(rfp.rfpCurrency) ?? "OMR",
    estimatedContractValue: isFiniteNumber(rfp.estimatedContractValue)
      ? rfp.estimatedContractValue
      : undefined,
    finalBidValue: selectedProposal.bidAmount,
    closingDate: cleanOptionalText(rfp.closingDate),
    items: mappedItems,
    approval,
    generatedAt,
    signature: createDemoElectronicSignature(signatureDate),
  };

  return { ready: true, document };
};
