import React, { useEffect, useState } from "react";
import RfpDetailLeft from "../../components/rfp_request/rfp_details/RfpDetailLeft";
import { Button, notification } from "antd";
// import RequestDetailRight from "../../components/requests/RequestDetailRight";
// import { ICapexRequestDetail } from "../../types/capexTypes";
import { useNavigate, useParams } from "react-router-dom";
import buildingIcon from "../../assets/building-2.svg";
import {
  getRfpByIdAsync,
  openRfpForLiveBidding,
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
import Modal from "../../components/basic_components/Modal";
import DateTimePicker from "../../components/basic_components/date_time_picker/DateTimePicker";
import { getAllVendorsAsync } from "../../services/vendorService";
import PeoplePicker from "../../components/basic_components/PeoplePicker";

const RequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const [rfpData, setRfpData] = useState<any>();
  const [masterData, setMasterData] = useState<{ categories: any[] }>({
    categories: [],
  });
  const [vendorProposals, setVendorProposals] = useState<any[]>([]);
  const [isLiveBiddingModalOpen, setIsLiveBiddingModalOpen] = useState(false);
  const [liveBiddingStartDateTime, setLiveBiddingStartDateTime] = useState("");
  const [liveBiddingEndDateTime, setLiveBiddingEndDateTime] = useState("");
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<{ id: number; name: string; imageUrl: string }[]>([]);
  const navigate = useNavigate();

  const getRequestDetailData = async () => {
    if (id) {
      console.log(id, "requestId");
      const response = await getRfpByIdAsync(Number(id));
      console.log(response);
      setRfpData(response);
      const categoriesResponse = await getAllCategoriesAsync();
      setMasterData((prev) => ({ ...prev, categories: categoriesResponse }));
      const vendorsListResponse = await getAllVendorsAsync();
      setVendorsList(vendorsListResponse);
    }
  };

  const handleScheduleLiveBidding = async () => {
    if (!liveBiddingStartDateTime || !liveBiddingEndDateTime) {
      notification.error({
        message: "Please select both start and end date/time",
      });
      return;
    }

    if (new Date(liveBiddingStartDateTime) >= new Date(liveBiddingEndDateTime)) {
      notification.error({
        message: "End date/time must be after start date/time",
      });
      return;
    }

    if (!selectedVendors || selectedVendors.length === 0) {
      notification.error({
        message: "Please select at least one vendor",
      });
      return;
    }

    try {
      const response = await openRfpForLiveBidding({
        rfpId: rfpData?.id,
        liveBiddingStartDateTime,
        liveBiddingEndDateTime,
        vendorIds: selectedVendors.map((v) => v.id),
      });

      if (response) {
        notification.success({
          message: "Live bidding scheduled successfully",
        });
        setIsLiveBiddingModalOpen(false);
        setLiveBiddingStartDateTime("");
        setLiveBiddingEndDateTime("");
        setSelectedVendors([]);
        navigate(`/rfps/${rfpData?.id}/live-bidding`);
      }
    } catch (error) {
      notification.error({
        message: "Failed to schedule live bidding",
      });
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
                    rfpData?.status == 9 ? (
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
                        if (!vendorProposals || vendorProposals.length == 0) {
                          notification.warning({
                            message: "No vendor proposal submitted"
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
                  {rfpData?.status == 5 && rfpData?.isLiveBiddingOn == null && <Button
                    type="primary"
                    htmlType="button"
                    className="px-6 py-2 text-sm font-medium mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLiveBiddingModalOpen(true);
                    }}
                  >
                    Schedule Live Bidding
                  </Button>}
                  {!rfpData?.rfpType && (
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
                    </Button>)}
                </form>
              </div>
            </div>
          )}
      </div>

      {/* Live Bidding Schedule Modal */}
      <Modal
        modalPosition="end"
        isOpen={isLiveBiddingModalOpen}
        onClose={() => {
          setIsLiveBiddingModalOpen(false);
          setLiveBiddingStartDateTime("");
          setLiveBiddingEndDateTime("");
          setSelectedVendors([]);
        }}
        width="w-full md:w-2/5"
        content={
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Schedule Live Bidding</h2>

            <div className="space-y-4">
              <DateTimePicker
                label="Live Bidding Start Date & Time"
                value={liveBiddingStartDateTime}
                setValue={setLiveBiddingStartDateTime}
                required={true}
              />

              <DateTimePicker
                label="Live Bidding End Date & Time"
                value={liveBiddingEndDateTime}
                setValue={setLiveBiddingEndDateTime}
                required={true}
              />

              <PeoplePicker
                label="Select Vendors"
                users={(vendorsList || []).map((v:any) => ({
                  id: v.id,
                  name: v.organisationName || `${v.firstName || ""} ${v.lastName || ""}`.trim() || `Vendor #${v.id}`,
                  imageUrl: buildingIcon,
                }))}
                value={selectedVendors}
                setValue={setSelectedVendors}
                placeholder="Type to search vendors..."
                height="72px"
              />
            </div>

            

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => {
                  setIsLiveBiddingModalOpen(false);
                  setLiveBiddingStartDateTime("");
                  setLiveBiddingEndDateTime("");
                  setSelectedVendors([]);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleScheduleLiveBidding}
              >
                Schedule Live Bidding
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default RequestDetailPage;