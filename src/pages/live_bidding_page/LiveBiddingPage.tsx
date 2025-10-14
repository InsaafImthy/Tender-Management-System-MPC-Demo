import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Statistic, Row, Col, Table, Tag, Space, notification, Spin } from "antd";
import { ArrowLeftOutlined, TrophyOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { getRfpByIdAsync, getAllProposalsByFilterAsync, getAllVendorLiveProposalsAsync } from "../../services/rfpService";
import { defaultFilter } from "../../utils/constants";
import PageLoader from "../../components/basic_components/PageLoader";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import { procurementContext } from "../../routes/RouteComponent";

interface VendorProposal {
  id: number;
  vendorName: string;
  totalAmount: number;
  submittedDate: string;
  status: string;
  isWinning: boolean;
  proposalDetails: any;
}

interface RfpData {
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
  const [proposals, setProposals] = useState<VendorProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      const response = getAllVendorLiveProposalsAsync(rfpData?.id ?? 0);
      setProposals(response as any|| []);
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
      setLoading(true);
      await Promise.all([fetchRfpData(), fetchProposals()]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProposals();
    }, 30000);

    return () => clearInterval(interval);
  }, [id]);

  // SignalR: join backend group/event OpenRfpForLiveBidding-{UID} and handle updates
  useEffect(() => {
    if (!connection || !rfpData) return;

    const rfpUid = (rfpData.uid || rfpData.UID || "").toString();
    if (!rfpUid) return;

    const groupAndEvent = `${rfpUid}`;
    let isMounted = true;

    const subscribe = async () => {
      try {
        // Ensure this connection is in the server-side RFP group
        // Backend: JoinRfpGroup(long rfpId, CancellationToken ct = default)
        await connection.invoke("JoinRfpGroup", rfpData.id);
        await connection.invoke("OpenRfpForLiveBidding", rfpData.id);

        // Backend sends SendAsync(eventName, eventName, message)
        connection.on("JoinedRfpGroup", (info) => { console.log(info,"info--------info") });
        connection.on("RfpMessageEvent", (msg) => { console.log(msg,"msg--------msg") });
        

      } catch (error) {
        console.warn("Live bidding subscription failed:", error);
      }
    };

    subscribe();

    return () => {
      isMounted = false;
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
    return Math.max(...proposals.map(p => p.totalAmount));
  };

  const getLowestBid = () => {
    if (proposals.length === 0) return 0;
    return Math.min(...proposals.map(p => p.totalAmount));
  };

  const getAverageBid = () => {
    if (proposals.length === 0) return 0;
    const sum = proposals.reduce((acc, p) => acc + p.totalAmount, 0);
    return sum / proposals.length;
  };

  const getWinningBid = () => {
    return proposals.find(p => p.isWinning) || null;
  };

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      key: "vendorName",
      render: (text: string, record: VendorProposal) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.isWinning && (
            <Tag color="gold" icon={<TrophyOutlined />}>
              Winning
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Bid Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-bold text-lg">
          ${amount.toLocaleString()}
        </span>
      ),
      sorter: (a: VendorProposal, b: VendorProposal) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Submitted Date",
      dataIndex: "submittedDate",
      key: "submittedDate",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "Approved" ? "green" : status === "Rejected" ? "red" : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: VendorProposal) => (
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
              <div className="text-sm text-gray-500">Budget</div>
              <div className="font-medium">${rfpData?.budget?.toLocaleString()}</div>
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
                  {getWinningBid()?.vendorName} - ${getWinningBid()?.totalAmount?.toLocaleString()}
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
          dataSource={proposals}
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