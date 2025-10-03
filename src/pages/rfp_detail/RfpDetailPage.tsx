import React, { useEffect, useState } from "react";
import RfpDetailLeft from "../../components/rfp_request/rfp_details/RfpDetailLeft";
import { Button, notification } from "antd";
// import RequestDetailRight from "../../components/requests/RequestDetailRight";
// import { ICapexRequestDetail } from "../../types/capexTypes";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRfpByIdAsync,
  openRfpProposalsAsync,
  publishRfpAsync,
} from "../../services/rfpService";
import PageLoader from "../../components/basic_components/PageLoader";
import RfpDetailRight from "../../components/rfp_request/rfp_details/RfpDetailRight";
import RfpApproveReject from "../../components/rfp_request/rfp_details/RfpApproveReject";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import { getAllCategoriesAsync } from "../../services/categoryService";
import { getUserCredentials } from "../../utils/common";
import RfpProposalApproveReject from "../../components/rfp_request/rfp_details/RfpProposalApproveReject";
import RfpAwardflow from "../../components/rfp_request/rfp_details/RfpAwardflow";

const RequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const [rfpData, setRfpData] = useState<any>();
  const [masterData, setMasterData] = useState<{ categories: any[] }>({
    categories: [],
  });
  const [vendorProposals, setVendorProposals] = useState<any[]>([]);
  const navigate = useNavigate();

  const getRequestDetailData = async () => {
    if (id) {
      console.log(id, "requestId");
      const response = await getRfpByIdAsync(Number(id));
      console.log(response);
      setRfpData(response);
      const categoriesResponse = await getAllCategoriesAsync();
      setMasterData((prev) => ({ ...prev, categories: categoriesResponse }));
    }
  };

  useEffect(() => {
    getRequestDetailData();
  }, []);

   const Newclass = rfpData?.status != 5 ? "space-y-3 desktop:max-w-[600px] px-3 py-3" : "";

  return (
    <div className="">
      <div className="desktop-wide:flex desktop:flex-row desktop-wide:justify-center">
        <CommonTitleCard />

        {/* Main Content */}
        <div className="">
          {rfpData ? (
            <>
              <div className="flex flex-col h-full grid grid-cols-2 desktop:justify-between desktop-wide:justify-center">
                {/* RFP Details Section */}
                <div className="h-full flex items-center bg-white flex-col px-10 pt-6 border-r border-gray-200">
                  <RfpDetailLeft
                    masterData={masterData}
                    requestData={rfpData}
                    trigger={() => {
                      getRequestDetailData();
                    }}
                  />
                </div>

                {/* Approval Flow Section - Top */}
                <div className={`w-full mx-auto rounded h-full ${Newclass}`}>
                  {rfpData.status == 5 ||
                  rfpData?.status == 9 ||
                  rfpData.status == 9 ? (
                    <RfpDetailRight
                      rfp={rfpData}
                      trigger={() => {
                        getRequestDetailData();
                      }}
                      vendorProposals={vendorProposals}
                      setVendorProposals={setVendorProposals}
                    />
                  ) : rfpData.status == 8 ? (
                    <RfpProposalApproveReject
                      rfpDetails={rfpData}
                      trigger={() => {
                        getRequestDetailData();
                      }}
                    />
                  ) : rfpData.status == 6 || rfpData.status == 10 ? (
                    <RfpAwardflow
                      rfpDetails={rfpData}
                      trigger={() => {
                        getRequestDetailData();
                      }}
                    />
                  ) : (
                    <RfpApproveReject
                      rfpDetails={rfpData}
                      trigger={() => {
                        getRequestDetailData();
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <PageLoader />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(rfpData?.status == 1 ||
          rfpData?.status == 5 ||
          rfpData?.status == 9) &&
          getUserCredentials().userId == rfpData?.createdBy.toString() && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-md z-9">
              <div className="max-w-4xl mx-auto px-4 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    (async () => {
                      if (rfpData?.status == 1) {
                        await publishRfpAsync(rfpData?.id);
                        notification.success({
                          message: "RFP published successfully",
                        });
                      } else if (rfpData?.status == 9) {
                        navigate(`/rfps/${id}/decision-form`);
                      } else {
                        if(!vendorProposals || vendorProposals.length == 0){
                          notification.warning({
                            message:"No vendor proposal submitted"
                          })
                          return;
                        }
                        await openRfpProposalsAsync(rfpData?.id);
                        notification.success({
                          message: "RFP sent for open proposal",
                        });
                      }
                      getRequestDetailData();
                    })();
                  }}
                  className="flex justify-end"
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="px-6 py-2 text-sm font-medium"
                  >
                    {rfpData?.status == 1
                      ? "Publish now"
                      : rfpData?.status == 9
                      ? "Create DP"
                      : "Request Approval to Open RFP"}
                  </Button>
                </form>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default RequestDetailPage;