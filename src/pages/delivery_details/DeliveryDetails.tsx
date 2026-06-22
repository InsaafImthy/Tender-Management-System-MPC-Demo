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
  projectSite: "Pharmacy/Warehouse Location",
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
    <div className="admin-page">
      <CommonTitleCard />
      <div className="admin-content">
        {/* Header Section */}
        <div className="admin-page-header mb-6">
          <div className="admin-page-header-row">
            <div className="admin-title-cluster">
              <div className="admin-title-icon">
                <span className="text-white text-2xl font-bold">
                  <DeliveryDetailsIconMain />
                </span>
              </div>
              <div>
                <h1 className="text-heading-2">Pharmacy Delivery Details</h1>
                <p className="text-body-small text-muted mt-1">
                  Track medicine and medical supply deliveries in real
                  time.
                </p>
              </div>
            </div>
            <div className="admin-title-actions">
              <CreateButton
                name="Add Delivery"
                onClick={handleAddDelivery}
              />
            </div>
          </div>
        </div>
        {/* Table Section */}
        <div className="admin-panel">
          <Table
            title={"Delivery Details"}
            columns={columns}
            columnLabels={column_details}
            subtitle={"Track and manage delivery records"}
            items={deliveryList}
            totalCount={totalCount}
            setSearchQuery={setSearchQuery}
            setFilter={setFilter}
            setIsSortModalOpen={setIsSortModalOpen}
            type="tendors"
            rowNavigationPath="tendors"
            NoDataTitle={"No Delivery Details Available"}
            NoDataDescription={"No pharmacy delivery details are available yet."}
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
