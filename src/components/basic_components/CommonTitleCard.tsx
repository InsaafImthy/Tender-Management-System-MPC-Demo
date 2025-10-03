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
                } catch (error) {
                    // console.error('Error fetching company details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCompanyDetails();
    }, [userCredentials?.companyId]);

    return (
        <div className="w-full flex justify-between bg-white items-center pl-8 pt-2 pr-8 border-b-[1px]">
            <div className="flex flex-col">
                <p className="text-[18px] flex justify-start items-center">
                    <span className="text-[18px] font-semibold">{companyDetails?.companyName}</span>
                </p>
            </div>
            <div>
                <Card 
                    size="small" 
                    className="bg-white/10 backdrop-blur-sm border-white/20"
                    bodyStyle={{ padding: '8px 12px' }}
                >
                    <div className="flex items-center gap-3">
                        <Avatar 
                            size="small" 
                            icon={<UserOutlined />} 
                            className="bg-blue-500"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium leading-tight">
                                {userCredentials.name}
                            </span>
                            <span className="text-xs opacity-80 leading-tight">
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