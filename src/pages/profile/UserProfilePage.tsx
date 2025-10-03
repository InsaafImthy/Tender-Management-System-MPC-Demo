import { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { getUserDataByIdAsync } from '../../services/userService';
import { IUserDetails } from '../../types/userTypes';
import userLogo from "../../assets/profile_photo/userPhoto.png";
import {
  Modal,
  Card,
  Tag,
  Descriptions,
  Button,
  Divider,
} from 'antd';
import {
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Meta } = Card;

function UserProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLoggedOut, setUserLoggedOut] = useState(false);
  const [user, setUser] = useState<IUserDetails>();

  const navigate = useNavigate();
  const userId = Cookies.get("userId") || "";

  useEffect(() => {
    if (userLoggedOut) {
      navigate('/login');
    }
  }, [userLoggedOut, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserDataByIdAsync(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // notification.error({
        //   message: "Failed to load user data",
        //   description: "Please try again later.",
        // });
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = () => {
    // Remove all cookies
    Object.keys(Cookies.get()).forEach(cookie => Cookies.remove(cookie));
    setUserLoggedOut(true);
    setIsModalOpen(false);
  };

  const getStatusColor = (isActive: string) => {
    return isActive ? "green" : "red";
  };

  const getStatusText = (isActive: string) => {
    return isActive ? "Active" : "Inactive";
  };

  return (
    <div className="desktop-wide:flex desktop-wide:justify-center">
      <div className="min-h-screen bg-gray-100 w-full overflow-x-hidden">
        <Card
          className="max-w-full mx-auto"
          cover={
            <div className="h-[73px] bg-gradient-to-r from-blue-400 to-blue-300"></div>
          }
          actions={[
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Logout
            </Button>,
          ]}
        >
          {/* Avatar */}
          <div className="flex justify-center -mt-20">
            <div className="w-[130px] h-[130px] rounded-full overflow-hidden border-4 border-white shadow-md">
              <img
                className="w-full h-full object-cover"
                src={userLogo}
                alt="User"
              />
            </div>
          </div>

          {/* User Name and Basic Details */}
          <Meta
            title={user?.name || "Unknown"}
            description={
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Tag color={getStatusColor(user?.isActive as string)}>
                  {getStatusText(user?.isActive as string)}
                </Tag>
                {user?.roleName && <Tag color="blue">{user.roleName}</Tag>}
                {user?.departmentName && <Tag color="purple">{user.departmentName}</Tag>}
              </div>
            }
            className="text-center"
          />

          <Divider />

          {/* User Details */}
          <Descriptions
            title="Personal Information"
            bordered
            column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
            className="w-full"
            labelStyle={{ whiteSpace: 'normal' }}
            contentStyle={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
          >
            <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
              {user?.email || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label={<span><PhoneOutlined /> Phone</span>}>
              {user?.phone || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label={<span><EnvironmentOutlined /> Location</span>}>
              {user?.place || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label={<span><UserOutlined /> Username</span>}>
              {user?.userName || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label={<span><UserOutlined /> Gender</span>}>
              {user?.gender || "Not provided"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Logout Confirmation Modal */}
        <Modal
          title="Confirm Logout"
          open={isModalOpen}
          onOk={handleLogout}
          onCancel={() => setIsModalOpen(false)}
          okText="Yes, Logout"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to logout? You will be redirected to the login page.</p>
        </Modal>
      </div>
    </div>
  );
}

export default UserProfilePage;
