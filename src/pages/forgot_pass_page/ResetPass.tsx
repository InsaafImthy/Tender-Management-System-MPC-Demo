import React, { useState } from 'react';
import { Form, Input, Button, Layout, Card, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { resetPasswordAsync } from '../../services/userService';

const { Content } = Layout;
const { Title, Text } = Typography;

// Define interface for form values
interface ResetPassFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

const ResetPassPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Extract token and email from URL query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token') || '';
  const email = queryParams.get('email') || '';

  const onFinish = async (values: ResetPassFormValues) => {
    setLoading(true);

    // Validate that passwords match
    if (values.newPassword !== values.confirmNewPassword) {
      message.error('Passwords do not match!');
      setLoading(false);
      return;
    }

    // Validate that token and email are present
    if (!token || !email) {
      message.error('Invalid or missing reset link. Please request a new one.');
      setLoading(false);
      return;
    }

    try {
      // Call API to reset password, including email
      await resetPasswordAsync({
        token,
        email,
        newPassword: values.newPassword,
      });
      message.success('Password reset successfully! You can now log in with your new password.');
      form.resetFields(); // Clear form after success
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: unknown) {
      console.error('Error during password reset:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-lg rounded-lg" bordered={false}>
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
                aria-label="Logo"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <Title level={2} className="mt-6">
              Reset Password
            </Title>
            <Text type="secondary">Enter your new password below.</Text>
          </div>

          {/* Form */}
          <Form<ResetPassFormValues>
            form={form}
            name="reset-password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
                  message:
                    'Password must contain at least one uppercase letter, one lowercase letter, and one number!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="New Password"
                aria-label="New password"
              />
            </Form.Item>

            <Form.Item
              name="confirmNewPassword"
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm New Password"
                aria-label="Confirm new password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                loading={loading}
                disabled={loading || !token || !email}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default ResetPassPage;