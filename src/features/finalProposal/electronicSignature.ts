import type { ElectronicSignature } from "./finalProposalTypes";

export const createDemoElectronicSignature = (
  signedAt: string,
): ElectronicSignature => ({
  type: "demo",
  signedBy: "Authorized Signatory",
  designation: "Muscat Pharmacy and Stores LLC",
  signedAt,
  verificationText: "DEMO E-SIGNATURE - NOT A LEGAL DIGITAL SIGNATURE",
});
