import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';

// Admin pages
import AdminHome from './pages/admin/Home';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOrgChart from './pages/admin/OrgChart';
import AdminRooms from './pages/admin/Rooms';
import AdminSales from './pages/admin/Sales';
import AdminAttendance from './pages/admin/Attendance';
import AdminReports from './pages/admin/Reports';
import AdminWeeklyReport from './pages/admin/WeeklyReport';
import AdminActivityFees from './pages/admin/ActivityFees';
import AdminMonthlyCommissions from './pages/admin/MonthlyCommissions';
import AdminProducts from './pages/admin/Products';

// Staff pages
import StaffLayout from './layouts/StaffLayout';
import StaffDashboard from './pages/staff/Dashboard';
import StaffReports from './pages/staff/Reports';
import StaffSales from './pages/staff/Sales';

import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/org-chart" element={<AdminOrgChart />} />
          <Route path="/admin/rooms" element={<AdminRooms />} />
          <Route path="/admin/sales" element={<AdminSales />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/weekly-report" element={<AdminWeeklyReport />} />
          <Route path="/admin/activity-fees" element={<AdminActivityFees />} />
          <Route path="/admin/monthly-commissions" element={<AdminMonthlyCommissions />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>

        {/* Staff Routes */}
        <Route
          element={
            <ProtectedRoute>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<StaffDashboard />} />
          <Route path="/dashboard/reports" element={<StaffReports />} />
          <Route path="/dashboard/sales" element={<StaffSales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
