import { useEffect, useState } from "react";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import Table from "../../components/basic_components/Table";
import {
  defaultFilter,
  upcoming_tendor_sorting_fields,
} from "../../utils/constants";
import SortModal from "../../components/basic_components/SortModal";
import CreateButton from "../../components/buttons/CreateButton";
import TendorModal from "./TendorModal";
import { Modal as AntdModal, Button, notification } from "antd";
import { UpcomingTendorsMainIcon } from "../../utils/Icons";
import {
  createTenderAsync,
  deleteUpcomingTendersAsync,
  getUpcomingTendersAsync,
} from "../../services/categoryService";
import { IFilterDto } from "../../types/commonTypes";

export interface IUTendors {
  id: number;
  title: string;
  description: string;
  publishingDate: string;
  categories: {
    categoryId: number;
    value: string;
    label: string;
  }[];
  status?: number;
}

type VendorColumnKeys =
  | "title"
  | "description"
  | "publishingDate"
  | "categories";

const UpcomingTendors = () => {
  const columns = [
    "title",
    "description",
    "publishingDate",
    "categories",
    "actions",
  ];
  const vendor_column_labels: Record<VendorColumnKeys, string> = {
    title: "Title",
    description: "Description",
    publishingDate: "Tender Publishing Date",
    categories: "Category ID",
  };

  const [tendorlist, setTendorlist] = useState<IUTendors[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<any>(defaultFilter);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [istendorDeleteModalOpen, setTendorDeleteModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<IUTendors | null>(null);

  useEffect(() => {
    fetchTendorList();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery,filter]);

  const handleSearch = async () => {
    console.log(searchQuery, "searchquery after fetch");
    fetchTendorList({
      ...filter,globalSearch:searchQuery
    })
  };

  const [tendorData, setTendorData] = useState<IUTendors>({
    id: 0,
    title: "",
    description: "",
    publishingDate: "",
    categories: [],
    status: 0,
  });

  const fetchTendorList = async (filterData: IFilterDto = defaultFilter) => {
    console.log("Fetching tenders with filter:", filterData);

    const NewData = await getUpcomingTendersAsync(filterData);

    // Map API response to match Table's expected column keys
    const TenderValuesData = NewData.map((tender: any) => ({
      id: tender.id,
      title: tender.title,
      description: tender.description,
      publishingDate: tender.publishingDate,
      categories: Array.isArray(tender.categories)
        ? tender.categories.map((cat: any) => ({
            categoryId: cat.categoryId,
            value: cat.category.name, // ✅ Should be the name string
            label: cat.category.name, // ✅ Table renders this
          }))
        : [],
    }));

    console.log("Mapped tenders for table:", TenderValuesData);

    setTendorlist(TenderValuesData);
  };

  const handleSubmit = async () => {
    //Validation Function
    const Validatefields = vendor_column_labels;

    (Object.keys(Validatefields) as VendorColumnKeys[]).forEach((key) => {
      const value = tendorData[key];
      const label = Validatefields[key];

      if (
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0)
      ) {
        alert(`Please fill the ${label}`);
        throw new Error("Validation failed");
      }
    });

    //To Store the data to table
    const newTendor = { ...tendorData };
    await createTenderAsync(newTendor);

    //Fetch data for Showing into Table
    fetchTendorList();

    //Set Total count and Close modal
    setTotalCount((prev) => prev + 1);
    setCreateModalOpen(false);
    setTendorData({
      id: 0,
      title: "",
      description: "",
      publishingDate: "",
      categories: [],
      status: 0,
    });
  };

  const onCreateRequest = () => {
    setCreateModalOpen(true);
  };

  const handleDeleteTender = (item: IUTendors) => {
    setSelectedTender(item);
    setTendorDeleteModalOpen(true);
  };

  const handleConfirmDeleteTender = async() => {
    if (selectedTender) {
      await deleteUpcomingTendersAsync(selectedTender.id);
        notification.success({ message: "Category deleted successfully" });
      setTotalCount((prev) => prev - 1);
      fetchTendorList();
    }
    setSelectedTender(null);
    setTendorDeleteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CommonTitleCard />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  <UpcomingTendorsMainIcon />
                </span>
              </div>
              <div>
                <h1 className="text-heading-2">Upcoming Tenders</h1>
                <p className="text-body-small text-muted mt-1">
                  Overview and management of all upcoming tenders.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CreateButton name="Create Tendor" onClick={onCreateRequest} />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <Table
            title={""}
            columns={columns}
            columnLabels={vendor_column_labels}
            subtitle={""}
            items={tendorlist || []}
            totalCount={totalCount}
            setSearchQuery={setSearchQuery}
            setFilter={setFilter}
            setIsSortModalOpen={setIsSortModalOpen}
            type="tendors"
            rowNavigationPath="tendors"
            NoDataTitle={"No Upcoming Tendors Available"}
            NoDataDescription={
              "No upcoming tenders are available yet. Create upcoming tenders as per your requirement."
            }
            IsIcon={false}
            dots={true}
            setDeleteOption={(item: IUTendors) => handleDeleteTender(item)}
          />
        </div>

        {/* Sort Modal */}
        {isSortModalOpen && (
          <SortModal
            filter={filter}
            columns={upcoming_tendor_sorting_fields}
            setFilter={setFilter}
            setIsSortModalOpen={setIsSortModalOpen}
          />
        )}

        {/* Create Tender Modal */}
        <TendorModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          tendorData={tendorData}
          setTendorData={setTendorData}
          onSubmit={handleSubmit}
        />

        {/* Delete Confirmation Modal */}
        <AntdModal
          title="Confirm Delete"
          open={istendorDeleteModalOpen}
          onCancel={() => setTendorDeleteModalOpen(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setTendorDeleteModalOpen(false)}
            >
              Cancel
            </Button>,
            <Button
              key="confirm"
              type="primary"
              danger
              onClick={handleConfirmDeleteTender}
            >
              Delete
            </Button>,
          ]}
        >
          <p>Are you sure you want to delete this tender?</p>
        </AntdModal>
      </div>
    </div>
  );
};

export default UpcomingTendors;
