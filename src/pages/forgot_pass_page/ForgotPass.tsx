import React, { useState } from 'react';
import { Form, Input, Button, Layout, Card, Typography, Divider, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { requestPasswordResetAsync } from '../../services/userService';

const { Content } = Layout;
const { Title, Text, Link } = Typography;

// Define interface for form values
interface ForgotPassFormValues {
  email: string;
}

const ForgotPassPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm(); // Use Ant Design's form instance for resetting

  const onFinish = async (values: ForgotPassFormValues): Promise<void> => {
    setLoading(true);
    try {
      // Call API to request password reset
      await requestPasswordResetAsync({ email: values.email });
      message.success('Password reset email sent! Please check your inbox.');
      form.resetFields(); // Clear form after success
    } catch (error: unknown) {
      console.error('Error during password reset request:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send reset email. Please try again.';
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
              Forgot Password
            </Title>
            <Text type="secondary">Enter your email to receive a password reset link.</Text>
          </div>

          {/* Form */}
          <Form<ForgotPassFormValues>
            form={form}
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Email"
                aria-label="Email address"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain className="my-4">
            <Text type="secondary" className="text-sm">OR</Text>
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

export default ForgotPassPage;