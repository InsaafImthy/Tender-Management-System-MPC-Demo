import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DepartmentManagment from '../../components/settings/department_managment/DepartmentManagment';
import ApprovalWorkflow from '../../components/settings/approval_workflow/ApprovalWorkflow';
import UserManagement from '../../components/settings/user_managment/UserManagment';
import RolesPermissions from '../../components/settings/roles_and_permissions/RolesPermissions';
import CommonTitleCard from '../../components/basic_components/CommonTitleCard';
import CategoryManagment from '../../components/settings/category_managment/CategoryManagment';
import CriteriaManagment from '../../components/settings/criteria_managment/CriteriaManagment';
import QuestionnaireManagment from '../../components/settings/questionnaire_managment/QuestionnaireManagment';
import BomManagment from '../../components/settings/bom_managment/BomManagment';

type SettingsSection =
  | 'User management'
  | 'Category management'
  | 'Manage department'
  | 'Roles & permissions'
  | 'Approval workflow'
  | 'Budget allocation'
  | 'Criteria management'
  | 'Questionnaire management'
  | 'Product list management'

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
    { name: 'Questionnaire management', path: '/settings/questionnaire-managment' },
    { name: 'Product list management', path: '/settings/bom-managment' },
  ];

  const getIcon = (section: SettingsSection) => {
    switch (section) {
      case 'User management': return 'UM';
      case 'Category management': return 'CM';
      case 'Manage department': return 'MD';
      case 'Roles & permissions': return 'RP';
      case 'Approval workflow': return 'AW';
      case 'Criteria management': return 'CR';
      case 'Budget allocation': return 'BA';
      case 'Questionnaire management': return 'QM';
      case 'Product list management': return 'PL';
      default: return 'ST';
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
      case 'Questionnaire management':
        return <QuestionnaireManagment />;
      case 'Product list management':
        return <BomManagment />;
      default:
        return <UserManagement />;
    }
  };

  // Mobile version with tabs
  if (isMobile) {
    return (
      <div className="min-h-screen bg-bgBlue">
        <CommonTitleCard/>
        
        {/* Header Section */}
        <div className="admin-page-header mx-4 mt-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-violet-700 rounded-xl flex items-center justify-center shadow-[0_14px_28px_rgba(109,40,217,0.24)]">
              <span className="text-white text-sm font-bold">ST</span>
            </div>
            <div>
              <h1 className="text-heading-2">Settings</h1>
              <p className="text-body-small text-muted">Manage your application preferences</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Mobile */}
        <div className="admin-tabs mx-4 mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex whitespace-nowrap p-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`px-4 py-3 text-button rounded-lg transition-all duration-200 flex-shrink-0 mr-2 flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-violet-100 ${
                    activeSection === item.name
                      ? 'bg-violet-700 text-white shadow-[0_10px_22px_rgba(109,40,217,0.22)]'
                      : 'text-muted hover:text-violet-800 hover:bg-violet-50'
                  }`}
                >
                  <span className="text-xs font-bold">{getIcon(item.name as SettingsSection)}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content for Mobile */}
        <div className="px-4 pb-6">
          <div className="app-surface overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version with top summary and content only.
  return (
    <div className="min-h-screen bg-bgBlue">
      <CommonTitleCard />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 app-surface p-6">
          <h1 className="text-heading-3">Settings</h1>
          <p className="mt-2 text-body-small text-muted">
            Use the expanded sidebar to switch between settings sections.
          </p>
        </div>

        <div className="app-surface overflow-hidden min-h-[600px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
