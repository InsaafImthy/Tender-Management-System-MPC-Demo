import { useEffect, useState } from "react";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import CreateButton from "../../components/buttons/CreateButton";
import { DeliveryDetailsIconMain } from "../../utils/Icons";
import Table from "../../components/basic_components/Table";
import { defaultFilter, delivery_details_sorting_fields } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { IFilterDto } from "../../types/commonTypes";
import {
  deleteDeliveryDetailsAsync,
  getDeliveryDataAsync,
} from "../../services/categoryService";
import { notification } from "antd";
import SortModal from "../../components/basic_components/SortModal";

export interface IUDeliveryData {
  Id: number;
  poNumber: string;
  supplierName: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryLocation: string;
  projectSite: string;
  status: number;
}

const columns = [
  "Id",
  "poNumber",
  "supplierName",
  "deliveryDate",
  "deliveryLocation",
  "projectSite",
];

const column_details = {
  Id: "Delivery ID",
  poNumber: "PO Number",
  supplierName: "Supplier Name",
  deliveryDate: "Delivery Date",
  deliveryLocation: "Delivery Location",
  projectSite: "Project Site",
};

const DeliveryDetails = () => {
  const navigate = useNavigate();

  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<any>(defaultFilter);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [deliveryList, setDeliveryList] = useState<IUDeliveryData[]>([]);

  const handleDeleteDeliveryData = async (item: any) => {
    if (item) {
      await deleteDeliveryDetailsAsync(item.Id);
      notification.success({ message: "data deleted successfully" });
      fetchDeliveryData();
    }
  };

  const handleAddDelivery = () => {
    // setIsDeliveryModalOpen(true);
    navigate("/create-delivery-details");
  };

  const fetchDeliveryData = async (filterData: IFilterDto = defaultFilter) => {
    const Data = await getDeliveryDataAsync(filterData);

    const DeliveryValuesData = Data.items.map((data: any) => ({
      Id: data.id,
      poNumber: data.poNumber,
      supplierName: data.supplierName,
      deliveryDate: data.deliveryDate,
      deliveryTime: data.deliveryTime,
      deliveryLocation: data.deliveryLocation,
      projectSite: data.projectSite,
    }));

    console.log("Mapped tenders for table:", DeliveryValuesData);

    setDeliveryList(DeliveryValuesData);
    setTotalCount(DeliveryValuesData.length);
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, filter]);

  const handleSearch = async () => {
    console.log(searchQuery, "searchquery after fetch");
    fetchDeliveryData({
      ...filter,
      globalSearch: searchQuery,
    });
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
                  <DeliveryDetailsIconMain />
                </span>
              </div>
              <div>
                <h1 className="text-heading-2">Delivery Details</h1>
                <p className="text-body-small text-muted mt-1">
                  Track delivery timelines and monitor shipment status in real
                  time.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CreateButton
                name="Delivery Details"
                onClick={handleAddDelivery}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mx-8">
        <Table
          title={""}
          columns={columns}
          columnLabels={column_details}
          subtitle={""}
          items={deliveryList}
          totalCount={totalCount}
          setSearchQuery={setSearchQuery}
          setFilter={setFilter}
          setIsSortModalOpen={setIsSortModalOpen}
          type="tendors"
          rowNavigationPath="tendors"
          NoDataTitle={"No Delivery Details Available"}
          NoDataDescription={"No delivery detils are available yet."}
          IsIcon={false}
          dots={true}
          setDeleteOption={(item: IUDeliveryData) =>
            handleDeleteDeliveryData(item)
          }
          onView={(item: IUDeliveryData) =>
            navigate(`/create-delivery-details/${item.Id}`)
          }
        />
      </div>
      {/* Sort Modal */}
        {isSortModalOpen && (
          <SortModal
            filter={filter}
            columns={delivery_details_sorting_fields}
            setFilter={setFilter}
            setIsSortModalOpen={setIsSortModalOpen}
          />
        )}
    </div>
  );
};

export default DeliveryDetails;
