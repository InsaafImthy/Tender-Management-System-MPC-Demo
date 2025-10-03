import React, { useEffect, useState } from "react";
// import RequestDetailRight from "../../components/requests/RequestDetailRight";
// import { ICapexRequestDetail } from "../../types/capexTypes";
import { useParams } from "react-router-dom";
import PageLoader from "../../components/basic_components/PageLoader";
import VendorDetailLeft from "../../components/vendors/vendor_details/VendorDetailLeft";
import VendorDetailRight from "../../components/vendors/vendor_details/VendorDetailRight";
import { getVendorDocumentsAsync, getVendorsDetailsByIdAsync } from "../../services/vendorService";
import { Vendor } from "../../types/vendorTypes";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";

const VendorDetailPage: React.FC = () => {

    const { id } = useParams();

    const [vendorData, setVendorData] = useState<Vendor>({
        id: Number(id) || 0,
        createdAt: "0",
        createdBy: 0,
        updatedAt: "0",
        updatedBy: 0,
        firstName: "", // string
        lastName: "",  // string
        userName: "",  // string
        password: "",  // string
        vendorEmail: "", // string
        businessGrade: "",
        commercialRegNo: "",
        organisationName: "", // string
        mobile: "", // string
        phone: "", // string
        isTermsAndConditionsAccepted: false, // boolean
        wayNo: "",
        countryId: 0, // number | null
        countryName: "",     // object (you can define structure separately)
        buildingNo: "",
        relatedToStakeholders: false,
        stateId: 0,   // number | null
        stateName: "",       // object
        principleActivities: "",
        cityId: 0,    // number | null
        cityName: "",        // object
        address: "",       // string | null
        postalCode: "",    // string | null
        fax: "",           // string | null
        website: "",       // string | null
        organisationLegalStructure: "",
        otherOrganisationLegalStructure: "", // string | null
        status: 1,
        isActive: true, // boolean
        vendorCode: "", // string | null
        bankName: "",
        bankBranch: "",
        ifscCode: "",
        accountNumber: "",
        accountBeneficiaryName: "",
        majorClients: "",
        awardsAndRecognitions: ``,
        experience: 0,
        specializations: ``,

        vendorCategories: [
        ],
        usersDetails: [

        ],
        vendorDivissions: [
 
        ],
        vendorDocuments: [
            
        ]
    }
    );

    const getVendorDetailData = async () => {
        if (id) {
            console.log(id, "requestId")
            const response = await getVendorsDetailsByIdAsync(Number(id));
            const vendorDocuments = await getVendorDocumentsAsync(Number(id));
            response.vendorDocuments = vendorDocuments;
            console.log(response?.vendorCategory,"response?.vendorCategory")
            console.log(response,"response?.-----")
            setVendorData((prev) => ({ ...prev, ...response,vendorCategories:response?.vendorCategory, usersDetails:response?.vendorUsers, vendorDivissions:response?.vendorDivisions,}));
            // setRfpData(response);
        }
    }


    useEffect(() => {
        getVendorDetailData();
    }, [id])

    return (
        <div className="desktop-wide:flex desktop-wide:justify-center">
            <div>
                <CommonTitleCard />
                <div className="flex flex-col h-full desktop:flex-row desktop:justify-between desktop-wide:justify-center">
                    {true ? <>
                        <VendorDetailLeft vendorDetails={vendorData} />
                        <VendorDetailRight vendorDetails={vendorData as any} trigger={() => { }} /></> : <PageLoader />}
                </div>
            </div>
        </div>
    )
}

export default VendorDetailPage;