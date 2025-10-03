import { useEffect, useState, useCallback } from "react";
import Table from "../../components/basic_components/Table";
import BudgetCard from "../../components/dashboard/BudgetCard";
import StatusBar from "../../components/dashboard/StatusBar";
import TitleCard from "../../components/dashboard/TitleCard";
import { IFilterDto, statusDataProp } from "../../types/commonTypes";
import RequestCard from "../../components/dashboard/RequestCard";
import PageLoader from "../../components/basic_components/PageLoader";
import { convertCurrencyLabel } from "../../utils/common";
import { rfp_column_labels } from "../../utils/constants";
import { getAllRfpsByFilterAsync } from "../../services/rfpService";
import { useNavigate } from "react-router-dom";

const defaultFilter: IFilterDto = {
  fields: [
    {
      columnName: "status",
      value: 5,
    },
  ],
  sortColumn: "CreatedAt",
  sortDirection: "DESC",
  pageNo: 1,
  pageSize: 10,
};

function Dashboard() {
  const commonColumns = [
    "tenderNumber",
    "rfpTitle",
    "buyerName",
    "estimatedContractValueLabel",
    "status",
  ];

  const [requestStatus, setRequestStatus] = useState([0, 0, 0]);

  // State definitions
  const [dashboardData, setDashboardData] = useState({
    newRequests: [] as any[],
    // requestStatus: [0, 0, 0],
    rfpRequests: [
    ] as any[],
    totalCount: 0,
  });

  const [budgetDetails, setBudgetDetails] = useState<any>({
    years: ["2020", "2021", "2022", "2023", "2024"],
    budgets: [0, 0, 0, 0, 0],
    spend: [0, 0, 0, 0, 0],
  });
  const navigate = useNavigate();
  const [, setTrigger] = useState(false);
  const [, setIsSortModalOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);
  const [statusData, setStatusData] = useState<statusDataProp[]>([
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-pen-icon lucide-file-pen"
        >
          <path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
        </svg>
      ),
      label: "Total RFPs",
      value: 0,
      color: "bg-blue-500/30",
      textColor: "text-blue-900",
    },
    {
      icon: (
        <div className="small-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-file-lock2-icon lucide-file-lock-2"
          >
            <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v1" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <rect width="8" height="5" x="2" y="13" rx="1" />
            <path d="M8 13v-2a2 2 0 1 0-4 0v2" />
          </svg>
        </div>
      ),
      label: "Closed RFPs",
      value: 0,
      color: "bg-blue-500/30",
      textColor: "text-blue-900",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-down-icon lucide-file-down"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M12 18v-6" />
          <path d="m9 15 3 3 3-3" />
        </svg>
      ),
      label: "Open RFPs",
      value: 0,
      color: "bg-blue-500/30",
      textColor: "text-blue-900",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-file-clock-icon lucide-file-clock"
        >
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
          <path d="M8 14v2.2l1.6 1" />
          <circle cx="8" cy="16" r="6" />
        </svg>
      ),
      label: "Under Approval",
      value: 0,
      color: "bg-blue-500/30",
      textColor: "text-blue-900",
    },
  ]);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setTrigger(false);
      setShowLoader(true);
      const rfpResponse = await getAllRfpsByFilterAsync();
      const requests = rfpResponse.map((r: any) => ({
        ...r,
        bidValueLabel: `${convertCurrencyLabel(
          r.rfpCurrency as string
        )}${r.bidValue?.toFixed(2)}`,
      }));
      const statusCounts = [0, 0, 0];
      const approvedRequests: any[] = [];

      // Process requests and count statuses
      requests.forEach((request: any) => {
        switch (request.status) {
          case 6:
            statusCounts[0]++;
            if (approvedRequests) {
              approvedRequests.push(request as any);
            }
            break;
          case 5:
            statusCounts[1]++;
            break;
          default:
            statusCounts[2]++;
            break;
        }
      });

      // Update status data
      setStatusData([
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-file-pen-icon lucide-file-pen"
            >
              <path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
            </svg>
          ),
          label: "Total RFPs",
          value: statusCounts[0] + statusCounts[1] + statusCounts[2],
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
        {
          icon: (
            <div className="small-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-file-lock2-icon lucide-file-lock-2"
              >
                <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v1" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <rect width="8" height="5" x="2" y="13" rx="1" />
                <path d="M8 13v-2a2 2 0 1 0-4 0v2" />
              </svg>
            </div>
          ),
          label: "Closed RFPs",
          value: statusCounts[0],
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-file-down-icon lucide-file-down"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M12 18v-6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
          ),
          label: "Open RFPs",
          value: statusCounts[1],
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-file-clock-icon lucide-file-clock"
            >
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
              <path d="M8 14v2.2l1.6 1" />
              <circle cx="8" cy="16" r="6" />
            </svg>
          ),
          label: "Under Approval",
          value: statusCounts[2],
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
      ]);

      // Process budget data
      const budgetsByYear = approvedRequests.reduce(
        (acc: { [key: string]: number }, budget: any) => {
          const year = budget.createdAt.slice(0, 4);
          acc[year] = (acc[year] || 0) + budget.estimatedContractValue;
          return acc;
        },
        {}
      );

      const years = Object.keys(budgetsByYear).sort();
      const spendByYear = years.reduce(
        (acc: { [key: string]: number }, year) => {
          acc[year] = approvedRequests
            .filter((m: any) => m.closingDate?.slice(0, 4) === year)
            .reduce((sum: number, m: any) => sum + (m.bidValue || 0), 0);
          return acc;
        },
        {}
      );

      setBudgetDetails({
        years,
        budgets: years.map((year) => budgetsByYear[year]),
        spend: years.map((year) => spendByYear[year]),
      });

      setRequestStatus(statusCounts);

      // Update status data with actual values
      setStatusData([
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-file-pen-icon lucide-file-pen"
            >
              <path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
            </svg>
          ),
          label: "Total RFPs",
          value: statusCounts[0] + statusCounts[1] + statusCounts[2],
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
        {
          icon: (
            <div className="small-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-file-lock2-icon lucide-file-lock-2"
              >
                <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v1" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <rect width="8" height="5" x="2" y="13" rx="1" />
                <path d="M8 13v-2a2 2 0 1 0-4 0v2" />
              </svg>
            </div>
          ),
          label: "Closed RFPs",
          value: statusCounts[0] || 0,
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-file-down-icon lucide-file-down"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M12 18v-6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
          ),
          label: "Open RFPs",
          value: statusCounts[1] || 0,
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-file-clock-icon lucide-file-clock"
            >
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
              <path d="M8 14v2.2l1.6 1" />
              <circle cx="8" cy="16" r="6" />
            </svg>
          ),
          label: "Under Approval",
          value: statusCounts[2] || 0,
          color: "bg-blue-500/30",
          textColor: "text-blue-900",
        },
      ]);

      // Update dashboard data
      setDashboardData({
        newRequests: [],
        rfpRequests: approvedRequests,
        totalCount: statusCounts.reduce((a, b) => a + b, 0), // Total all requests
      });
    } catch (error: any) {
      console.log("Error fetching dashboard data:", error);
      // notification.error({
      //   message: error.message,
      // });
    } finally {
      setShowLoader(false);
    }
  }, []);

  const getRfpRequestFilter = useCallback(async (filterData = filter) => {
    try {
      const response: any[] = await getAllRfpsByFilterAsync(filterData);
      const filtered_requests = response.map((r) => ({
        ...r,
        estimatedContractValueLabel: `${convertCurrencyLabel(
          r.rfpCurrency as string
        )}${r.estimatedContractValue?.toFixed(2)}`,
      }));
      setDashboardData((prev) => ({
        ...prev,
        totalCount: 20,
        rfpRequests: filtered_requests,
      }));
    } catch (error) {
      console.error("Error fetching filtered RFPs", error);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const updatedFilter = {
      ...filter,
      globalSearch: searchQuery,
    };
    setFilter(updatedFilter);
  }, [searchQuery]);

  useEffect(() => {
    getRfpRequestFilter(filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {showLoader ? (
        <PageLoader />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Header Section */}
          <div className="mb-6">
            <TitleCard trigger={() => setTrigger(true)} />
          </div>

          {/* Main Dashboard Layout */}
          <div className="space-y-6">
            {/* Top Section - Status Cards and Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
              <div className="col-span-4">
                {/* StatusBar handles all 4 cards including Total RFPs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatusBar statuses={statusData || []} />
                </div>
              </div>
            </div>

            {/* Middle Section - Charts and Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Budget Chart - Takes 2/3 width */}
              <div className="xl:col-span-2 relative">
                <BudgetCard budgetDetails={budgetDetails} />
              </div>

              {/* Request Status Chart - Takes 1/3 width */}
              <div className="xl:col-span-1">
                <RequestCard
                  labels={["Closed", "Open", "Under Approval"]}
                  data={requestStatus || [0, 0, 0]}
                  colors={["#1365AA", "#3B82F6", "#60A5FA"]}
                />
              </div>
            </div>

            {/* Bottom Section - Main Content and Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {/* RFPs Table - Takes 3/4 width */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-slate-50 to-gray-50 rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="relative z-10">
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-heading-3">Published RFPs</h3>
                            <p className="text-body-small text-muted">
                              Manage and view your RFP requests
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Table
                      filter={filter}
                      setFilter={setFilter}
                      title={""}
                      setIsSortModalOpen={setIsSortModalOpen}
                      columns={commonColumns}
                      items={dashboardData.rfpRequests || []}
                      columnLabels={rfp_column_labels}
                      setIsFilterModalOpen={() => { }}
                      setSearchQuery={setSearchQuery}
                      totalCount={20}
                      type="rfps"
                      rowNavigationPath="rfps"
                      trigger={() => setTrigger(true)}
                      subtitle={""}
                      IsIcon={false}
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Takes 1/4 width */}
              <div className="xl:col-span-1">
                <div className="space-y-4">
                  {/* Recent Activity Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-0 p-6 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center mb-6">
                        <div>
                          <h3 className="text-heading-4">Recent Activity</h3>
                          <p className="text-body-small text-muted">
                            Latest updates
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              New RFP created
                            </p>
                            <p className="text-xs text-slate-500 mt-1 font-normal">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all duration-300">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              RFP approved
                            </p>
                            <p className="text-xs text-slate-500 mt-1 font-normal">
                              5 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-all duration-300">
                          <div className="w-3 h-3 bg-amber-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              RFP under review
                            </p>
                            <p className="text-xs text-slate-500 mt-1 font-normal">
                              1 day ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-0 p-6 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center mb-6">
                        <div>
                          <h3 className="text-heading-4">Quick Actions</h3>
                          <p className="text-body-small text-muted">
                            Common tasks
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button onClick={()=>navigate("/rfps/create-rfp")} className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-semibold">
                          <span className="mr-3 text-base">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="lucide lucide-circle-plus-icon lucide-circle-plus"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 12h8" />
                              <path d="M12 8v8" />
                            </svg>
                          </span>
                          Create New RFP
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-xl hover:from-slate-200 hover:to-gray-200 transition-all duration-300 font-semibold">
                          <span className="mr-3 text-base">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="lucide lucide-eye-icon lucide-eye"
                            >
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </span>
                          View Reports
                        </button>
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-xl hover:from-slate-200 hover:to-gray-200 transition-all duration-300 font-semibold">
                          <span className="mr-3 text-base">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="lucide lucide-settings-icon lucide-settings"
                            >
                              <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </span>
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
