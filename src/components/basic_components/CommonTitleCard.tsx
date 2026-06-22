import { Card, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getUserCredentials } from "../../utils/common";
import { getCompanyById } from "../../services/companyService";

interface ICompany {
  logo: string;
  companyName: string;
  companyCode: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string | null;
  countryId: number;
  cityId: number;
  stateId: number;
  address: string;
  noOfUsers: number;
  isActive: boolean;
  id: number;
  clientId: number;
  createdAt: string; // ISO date string
  createdBy: number;
  updatedAt: string | null;
  updatedBy: number | null;
  isdeleted: boolean;
  deletedBy: number | null;
  tenantId: number;
}

const CommonTitleCard = () => {
    const userCredentials = getUserCredentials();
    const [companyDetails, setCompanyDetails] = useState<ICompany>();
    const [, setLoading] = useState(false);


    useEffect(() => {
        const fetchCompanyDetails = async () => {
            if (userCredentials?.companyId) {
                try {
                    setLoading(true);
                    const response = await getCompanyById(userCredentials.companyId);
                    setCompanyDetails(response);
                    console.log('Company Details:', response);
                } catch {
                    // console.error('Error fetching company details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCompanyDetails();
    }, [userCredentials?.companyId]);

    return (
        <div className="w-full flex justify-between bg-white/95 items-center px-8 py-3 border-b border-slate-200/80 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col">
                <p className="text-[18px] flex justify-start items-center">
                    <span className="text-[18px] font-semibold text-slate-950">{companyDetails?.companyName}</span>
                </p>
            </div>
            <div>
                <Card 
                    size="small" 
                    className="border-slate-200 shadow-sm"
                    bodyStyle={{ padding: '8px 12px' }}
                >
                    <div className="flex items-center gap-3">
                        <Avatar 
                            size="small" 
                            icon={<UserOutlined />} 
                            className="bg-violet-700"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 leading-tight">
                                {userCredentials.name}
                            </span>
                            <span className="text-xs text-slate-500 leading-tight">
                                {userCredentials.role || 'User'}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default CommonTitleCard
