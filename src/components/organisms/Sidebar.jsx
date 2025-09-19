import { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { AuthContext } from '../../App';

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const navigationItems = [
    { name: "Dashboard", path: "/", icon: "BarChart3" },
    { name: "Students", path: "/students", icon: "Users" },
    { name: "Classes", path: "/classes", icon: "BookOpen" },
    { name: "Grades", path: "/grades", icon: "GraduationCap" },
    { name: "Reports", path: "/reports", icon: "FileText" },
  ];

  const NavItem = ({ item, onClick }) => {
    const isActive = location.pathname === item.path || 
      (item.path !== "/" && location.pathname.startsWith(item.path));

    return (
      <NavLink
        to={item.path}
        onClick={onClick}
        className={`flex items-center px-4 py-3 mx-3 rounded-lg transition-all duration-200 group ${
          isActive
            ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-md"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.02]"
        }`}
      >
        <ApperIcon 
          name={item.icon} 
          className={`w-5 h-5 mr-3 transition-colors ${
            isActive ? "text-primary-700" : "text-gray-500 group-hover:text-gray-700"
          }`} 
        />
        <span className="font-medium">{item.name}</span>
      </NavLink>
    );
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <ApperIcon name={isMobileOpen ? "X" : "Menu"} className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 z-40 w-64 h-full bg-white shadow-xl transform transition-transform duration-300 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                ClassTrack
              </h1>
              <p className="text-sm text-gray-500">Student Management</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.path} 
              item={item} 
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200 space-y-3">
          {isAuthenticated && user && (
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">{user.emailAddress}</p>
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full"
          >
            <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                ClassTrack
              </h1>
              <p className="text-sm text-gray-500">Student Management</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1">
          {navigationItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200 space-y-3">
          {isAuthenticated && user && (
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">{user.emailAddress}</p>
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full"
          >
            <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;