import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Layout,
  Card,
  Typography,
  Divider,
  Select,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { userRegisterAsync } from '../../services/userService';

const { Content } = Layout;
const { Title, Text, Link } = Typography;
const { Option } = Select;

// Define the type for form fields
interface RegisterFormValues {
  userName: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  place: string;
  terms: boolean;
}

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);

    const userData = {
      id: 0,
      photo: '',
      userName: values.userName,
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      gender: values.gender,
      place: values.place,
      isActive: true,
      roleId: 1,
    };

    try {
      const token = await userRegisterAsync(userData);
      console.log('Registration successful:', token);
      message.success('Account created successfully!');
      // Example redirect logic
      // localStorage.setItem('auth_token', token);
      // window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Error during registration:', error);
      message.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="flex items-center justify-center py-12">
        <Card
          className="w-full max-w-md shadow-lg rounded-lg"
          bordered={false}
          style={{ padding: '24px' }}
        >
          {/* Logo Area */}
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <Title level={2} className="mt-6">
              Create Account
            </Title>
            <Text type="secondary">Sign up for a new account</Text>
          </div>

          {/* Form */}
          <Form<RegisterFormValues>
            name="register"
            initialValues={{ terms: false }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="userName"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input prefix={<UserAddOutlined className="text-gray-400" />} placeholder="Full Name" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address!' },
              ]}
            >
              <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email address" />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[{ required: true, message: 'Please input your phone number!' }]}
            >
              <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Phone Number" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
            >
              <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="gender"
              rules={[{ required: true, message: 'Please select your gender!' }]}
            >
              <Select placeholder="Select Gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="place"
              rules={[{ required: true, message: 'Please input your location!' }]}
            >
              <Input prefix={<HomeOutlined className="text-gray-400" />} placeholder="Location/Place" />
            </Form.Item>

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms of service')),
                },
              ]}
            >
              <Checkbox>I agree to the Terms of Service</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                loading={loading}
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain className="my-4">
            <Text type="secondary" className="text-sm">
              OR
            </Text>
          </Divider>

          <div className="text-center">
            <Text type="secondary" className="text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default RegisterPage;
