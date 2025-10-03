import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DepartmentManagment from '../../components/settings/department_managment/DepartmentManagment';
import ApprovalWorkflow from '../../components/settings/approval_workflow/ApprovalWorkflow';
import UserManagement from '../../components/settings/user_managment/UserManagment';
import RolesPermissions from '../../components/settings/roles_and_permissions/RolesPermissions';
import CommonTitleCard from '../../components/basic_components/CommonTitleCard';
import CategoryManagment from '../../components/settings/category_managment/CategoryManagment';
import CriteriaManagment from '../../components/settings/criteria_managment/CriteriaManagment';

type SettingsSection =
  | 'User management'
  | 'Category management'
  | 'Manage department'
  | 'Roles & permissions'
  | 'Approval workflow'
  | 'Budget allocation'
  | 'Criteria management'

interface SettingsRoute {
  name: SettingsSection;
  path: string;
}

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>('User management');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const navigationItems: SettingsRoute[] = [
    { name: 'User management', path: '/settings/user-managment' },
    { name: 'Category management', path: '/settings/category-managment' },
    { name: 'Manage department', path: '/settings/department-managment' },
    { name: 'Roles & permissions', path: '/settings/roles-managment' },
    { name: 'Approval workflow', path: '/settings/workflow-managment' },
    { name: 'Criteria management', path: '/settings/criteria-managment' },
  ];

  const getIcon = (section: SettingsSection) => {
    switch (section) {
      case 'User management': return '👥';
      case 'Category management': return '📂';
      case 'Manage department': return '🏢';
      case 'Roles & permissions': return '🔐';
      case 'Approval workflow': return '⚡';
      case 'Criteria management': return '📋';
      case 'Budget allocation': return '💰';
      default: return '⚙️';
    }
  };

  // Set active section based on current URL path
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingRoute = navigationItems.find(item => item.path === currentPath);

    if (matchingRoute) {
      setActiveSection(matchingRoute.name);
    } else {
      // Default to User management if no match
      setActiveSection('User management');
      navigate('/settings/user-managment');
      console.log("user");

    }
  }, [location.pathname]);

  // Check for mobile/desktop size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigation = (route: SettingsRoute) => {
    navigate(route.path);
    setActiveSection(route.name);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'User management':
        return <UserManagement />;
      case 'Category management':
        return <CategoryManagment />;
      case 'Manage department':
        return <DepartmentManagment />;
      case 'Budget allocation':
        //return <BudgetAllocation />;
        return <></>;
      case 'Roles & permissions':
        return <RolesPermissions />;
      case 'Approval workflow':
        return <ApprovalWorkflow />;
      case 'Criteria management':
        return <CriteriaManagment />;
      default:
        return <UserManagement />;
    }
  };

  // Mobile version with tabs
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <CommonTitleCard/>
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mx-4 mt-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">⚙️</span>
            </div>
            <div>
              <h1 className="text-heading-2">Settings</h1>
              <p className="text-body-small text-muted">Manage your application preferences</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Mobile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mx-4 mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex whitespace-nowrap p-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`px-4 py-3 text-button rounded-lg transition-all duration-200 flex-shrink-0 mr-2 flex items-center space-x-2 ${
                    activeSection === item.name
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform -translate-y-0.5'
                      : 'text-muted hover:text-slate-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{getIcon(item.name as SettingsSection)}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content for Mobile */}
        <div className="px-4 pb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version with sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CommonTitleCard />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation for Desktop */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center space-x-3 mb-8">
                
                <div>
                  <h1 className="text-heading-3">Settings</h1>
                  <p className="text-body-small text-muted">Configure system and user settings.</p>
                </div>
              </div>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left space-x-3 ${
                      activeSection === item.name 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm' 
                        : 'text-muted hover:text-slate-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-label">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content for Desktop */}
          <div className="col-span-9">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden min-h-[600px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;