interface VendorCategory {
  id: number;
  categoryName: string;
}

interface UserDetail {
  name: string;
  email: string;
  phone: string;
  divissionName: string;
  divissionId: number;
}

interface Division {
  id: number;
  divisionName: string;
  location: string;
}

interface VendorDocument {
  id: number;
  filePath: string;
  fileTitle: string;
  fileName?: string;
}

export interface Vendor {
  id: number;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  city?:any;
  state?:any;
  country?:any;
  address1?:any;
  address2?:any;
  activitiesOfCompany?:any;
  bankIFSCCode?:any;
  bankAccountNumber?:any;
  bankAccountHolderName?:any;
  specialization?:any;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  vendorEmail: string;

  businessGrade: string;
  commercialRegNo: string;
  organisationName: string;
  principleActivities: string;

  mobile: string;
  phone: string;
  isTermsAndConditionsAccepted: boolean;

  wayNo: string;
  buildingNo: string;
  relatedToStakeholders: boolean;

  countryId: number | null;
  countryName: string;

  stateId: number | null;
  stateName: string;

  cityId: number | null;
  cityName: string;

  address: string | null;
  postalCode: string | null;
  fax: string | null;
  website: string | null;

  organisationLegalStructure: string;
  otherOrganisationLegalStructure: string | null;

  status: 1 | 2 | 3; // 1=Accepted, 2=Rejected, 3=Blocked
  isActive: boolean;
  vendorCode: string | null;

  bankName: string;
  bankBranch: string;
  ifscCode: string;
  accountNumber: string;
  accountBeneficiaryName: string;

  majorClients: string;
  awardsAndRecognitions: string;
  experience: number;
  specializations: string;

  vendorCategories: VendorCategory[];
  usersDetails: UserDetail[];
  vendorDivissions: Division[];
  vendorDocuments: VendorDocument[];
}
