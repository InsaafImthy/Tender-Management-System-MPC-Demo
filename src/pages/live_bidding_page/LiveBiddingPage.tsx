import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Statistic, Row, Col, Table, Tag, Space, notification, Spin } from "antd";
import { ArrowLeftOutlined, TrophyOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { getRfpByIdAsync, getAllVendorLiveProposalsAsync } from "../../services/rfpService";
import PageLoader from "../../components/basic_components/PageLoader";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import { procurementContext } from "../../routes/RouteComponent";

export interface Vendor {
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  vendorEmail: string;
  organisationName: string;
  companyPhone: string;
  phone: string;
  isTermsAndConditionsAccepted: boolean;
  relatedTostakeholders: boolean;
  countryId: number;
  country: string | null;
  stateId: number;
  state: string | null;
  cityId: number;
  city: string | null;
  address1: string;
  address2: string;
  postalCode: string;
  fax: string;
  website: string;
  organisationLegalStructure: string;
  otherOrganisationLegalStructure: string;
  status: number;
  isActive: boolean;
  vendorCode: string;
  bankName: string;
  bankAccountNumber: string;
  bankIFSCCode: string;
  bankBranch: string;
  bankAccountHolderName: string;
  majorClients: string;
  experience: string;
  specialization: string;
  businessGrade: string;
  activitiesOfCompany: string;
  id: number;
  clientId: number;
  createdAt: string | null;
  createdBy: number | null;
  updatedAt: string | null;
  updatedBy: number | null;
  isdeleted: boolean;
  deletedBy: number | null;
  tenantId: number;
  tenant: string | null;
  companyId: number;
  company: string | null;
  branchId: number;
  branch: string | null;
}

export interface VendorMessage {
  uniqueId: number;
  uid: string;
  messageType: string;
  message: string;
  rank: number | null;
  amount: number;
  status: string | null;
  priority: string | null;
  isRead: boolean;
  userType: string;
  userId: number;
  vendorId: number;
  vendor: Vendor;
  id: number;
  clientId: number;
  createdAt: string;
  createdBy: number;
  updatedAt: string | null;
  updatedBy: number | null;
  isdeleted: boolean;
  deletedBy: number | null;
  tenantId: number;
  tenant: string | null;
  companyId: number;
  company: string | null;
  branchId: number;
  branch: string | null;
}

interface RfpData {
  estimatedContractValue: number;
  id: number;
  title: string;
  description: string;
  status: number;
  createdDate: string;
  closingDate: string;
  budget: number;
  category: string;
  uid?: string; // prefer lower-case if API serializes that way
  UID?: string; // fallback in case API sends upper-case
}

const LiveBiddingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connection } = useContext(procurementContext);
  const [rfpData, setRfpData] = useState<RfpData | null>(null);
  const [proposals, setProposals] = useState<VendorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Winning bid is derived from filtered proposals below

  const fetchRfpData = async () => {
    try {
      const rfp = await getRfpByIdAsync(Number(id));
      setRfpData(rfp);
    } catch (error) {
      console.error("Error fetching RFP data:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch RFP details"
      });
    }
  };

  const fetchProposals = async () => {
    try {
      setRefreshing(true);
      const response = await getAllVendorLiveProposalsAsync(Number(id || "0"));
      setProposals(response as any || []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch vendor proposals"
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        await Promise.all([fetchRfpData(), fetchProposals()]);
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // SignalR: join backend group/event OpenRfpForLiveBidding-{UID} and handle updates
  useEffect(() => {
    if (!connection || !rfpData) return;

    const rfpUid = (rfpData.uid || rfpData.UID || "").toString();
    if (!rfpUid) return;

    const groupAndEvent = `${rfpUid}`;

    const subscribe = async () => {
      try {
        // Ensure this connection is in the server-side RFP group
        // Backend: JoinRfpGroup(long rfpId, CancellationToken ct = default)
        await connection.invoke("JoinRfpGroup", rfpData.id);
        await connection.invoke("OpenRfpForLiveBidding", rfpData.id);

        // Backend sends SendAsync(eventName, eventName, message)
        connection.on("JoinedRfpGroup", (info) => { console.log(info, "info--------info") });
        connection.on("RfpMessageEvent", (msg) => { 
          setProposals((prev)=>([...prev, msg])); 
        });


      } catch (error) {
        console.warn("Live bidding subscription failed:", error);
      }
    };

    subscribe();

    return () => {
      try {
        connection.off(groupAndEvent);
        // Prefer server-side LeaveRfpGroup if available; fallback to generic LeaveGroup
        connection.invoke("LeaveRfpGroup", rfpData.id)
          .catch(() => connection.invoke("LeaveGroup", groupAndEvent).catch(() => { }));
      } catch { }
    };
  }, [connection, rfpData]);

  const getHighestBid = () => {
    if (proposals.length === 0) return 0;
    return Math.max(...proposals.map(p => p.amount));
  };

  const getLowestBid = () => {
    if (proposals.length === 0) return 0;
    return Math.min(...proposals.map(p => p.amount));
  };

  const getAverageBid = () => {
    if (proposals.length === 0) return 0;
    const sum = proposals.reduce((acc, p) => acc + p.amount, 0);
    return sum / proposals.length;
  };

  const getWinningBid = () => {
    if (!proposals || proposals.length === 0) return null;

    // Find the proposal with the lowest amount
    const winningProposal = proposals.reduce((lowest, current) =>
      current.amount < lowest.amount ? current : lowest
    );

    return winningProposal;
  };

  // Build a filtered list with only the lowest bid per vendor
  const lowestPerVendor = React.useMemo(() => {
    if (!proposals || proposals.length === 0) return [] as VendorMessage[];
    const vendorIdToLowest = new Map<number, VendorMessage>();
    for (const proposal of proposals) {
      const vendorKey = proposal.vendorId || proposal.vendor?.id || proposal.id;
      const existing = vendorIdToLowest.get(vendorKey);
      if (!existing || proposal.amount < existing.amount) {
        vendorIdToLowest.set(vendorKey, proposal);
      }
    }
    return Array.from(vendorIdToLowest.values()).sort((a, b) => a.amount - b.amount);
  }, [proposals]);

  const winningId = React.useMemo(() => (lowestPerVendor[0]?.id ?? 0), [lowestPerVendor]);

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: ["vendor", "organisationName"],
      key: "vendorName",
      render: (_: unknown, record: VendorMessage) => (
        <div>
          <div className="font-medium">{record.vendor?.organisationName}</div>
          {record.id === winningId && (
            <Tag color="gold" icon={<TrophyOutlined />}>
              Winning
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Bid Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span className="font-bold text-lg">
          ${amount}
        </span>
      ),
      sorter: (a: VendorMessage, b: VendorMessage) => a.amount - b.amount,
    },
    {
      title: "Submitted Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, _record: VendorMessage) => (
        <Space>
          <Button size="small" type="link">
            View Details
          </Button>
          <Button size="small" type="link">
            Download
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <CommonTitleCard />
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <CommonTitleCard />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/rfps/${id}`)}
              className="flex items-center"
            >
              Back to RFP Details
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Bidding</h1>
              <p className="text-gray-600">RFP ID: {rfpData?.id}</p>
            </div>
          </div>
          <Button
            type="primary"
            onClick={fetchProposals}
            loading={refreshing}
            className="flex items-center"
          >
            <ClockCircleOutlined />
            Refresh
          </Button>
        </div>

        {/* RFP Info Card */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{rfpData?.title}</h2>
          <p className="text-gray-600 mb-4">{rfpData?.description}</p>
          <Row gutter={16}>
            <Col span={6}>
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium">{rfpData?.category}</div>
            </Col>
            <Col span={6}>
              <div className="text-sm text-gray-500">Estimated Contract Value</div>
              <div className="font-medium">${rfpData?.estimatedContractValue}</div>
            </Col>
            <Col span={6}>
              <div className="text-sm text-gray-500">Closing Date</div>
              <div className="font-medium">
                {rfpData?.closingDate ? new Date(rfpData.closingDate).toLocaleDateString() : "N/A"}
              </div>
            </Col>
            <Col span={6}>
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-medium">
                <Tag color="blue">Live Bidding</Tag>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Proposals"
              value={proposals.length}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Highest Bid"
              value={getHighestBid()}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lowest Bid"
              value={getLowestBid()}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Bid"
              value={getAverageBid()}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Winning Bid Highlight */}
      {getWinningBid() && (
        <Card className="mb-6 border-2 border-yellow-400 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TrophyOutlined className="text-2xl text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Current Winning Bid</h3>
                <p className="text-yellow-700">
                  {getWinningBid()?.vendor?.organisationName} - ${getWinningBid()?.amount?.toLocaleString()}
                </p>
              </div>
            </div>
            <Tag color="gold" className="text-lg px-4 py-2">
              WINNING
            </Tag>
          </div>
        </Card>
      )}

      {/* Proposals Table */}
      <Card title="Vendor Proposals" extra={
        <div className="flex items-center space-x-2">
          <Spin spinning={refreshing} size="small" />
          <span className="text-sm text-gray-500">
            Auto-refreshes every 30 seconds
          </span>
        </div>
      }>
        <Table
          columns={columns}
          dataSource={lowestPerVendor}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} proposals`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default LiveBiddingPage;