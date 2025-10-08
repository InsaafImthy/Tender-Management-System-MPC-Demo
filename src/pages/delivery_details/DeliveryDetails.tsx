import { useEffect, useState } from "react";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import CreateButton from "../../components/buttons/CreateButton";
import { DeliveryDetailsIconMain } from "../../utils/Icons";
import Table from "../../components/basic_components/Table";
import { defaultFilter } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { IFilterDto } from "../../types/commonTypes";
import { getDeliveryDataAsync } from "../../services/categoryService";

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
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const [deliveryData, setdeliveryData] = useState<IUDeliveryData>({
    Id: 0,
    poNumber: "",
    supplierName: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveryLocation: "",
    projectSite: "",
    status: 0,
  });

  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<any>(defaultFilter);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [deliveryList, setDeliveryList] = useState<IUDeliveryData[]>([]);
  
  const handleDeleteTender = (item:any) => {
 
  }

  const handleAddDelivery = () => {
    // setIsDeliveryModalOpen(true);
    navigate('/create-delivery-details')
  };

  const fetchDeliveryData = async(filterData: IFilterDto = defaultFilter) => {
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
  }

    useEffect(() => {
      fetchDeliveryData();
    }, []);

  const handleSubmit = () => {
    // Assign unique ID to each new delivery
    const newDelivery: IUDeliveryData = {
      ...deliveryData,
      Id: deliveryList.length + 1, // auto-increment ID
    };

    // Add new delivery to list
    const updatedList = [...deliveryList, newDelivery];
    setDeliveryList(updatedList);
    setTotalCount(updatedList.length);

    // Close modal
    setIsDeliveryModalOpen(false);

    // Reset form data
    setdeliveryData({
      Id: 0,
      poNumber: "",
      supplierName: "",
      deliveryDate: "",
      deliveryTime: "",
      deliveryLocation: "",
      projectSite: "",
      status: 0,
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
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
          NoDataDescription={
            "No delivery detils are available yet."
          }
          IsIcon={false}
          dots={true}
          setDeleteOption={(item: IUDeliveryData) => handleDeleteTender(item)}
          onView={(item: IUDeliveryData) => navigate(`/create-delivery-details/${item.Id}`)}
        />
      </div>
    </div>
  );
};

export default DeliveryDetails;


