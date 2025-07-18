import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingBoundary from './components/common/LoadingBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Entry from './pages/auth/Entry';
import { SignupStepper } from './components/signup/SignupStepper';
import SignupForm from './components/signup/SignupForm';

// Main Pages
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/properties/Properties';
import PropertyDetails from './pages/properties/PropertyDetails';
import PropertyForm from './pages/properties/PropertyForm';
import Leads from './pages/leads/Leads';
import LeadDetails from './pages/leads/LeadDetails';
import AddLead from './pages/leads/AddLead';
import NewLead from './pages/leads/NewLead';
import EditLead from './pages/leads/EditLead';
import LeadForm from './pages/leads/LeadForm';
import LeadsList from './pages/leads/LeadsList';
import DumpedLeads from './pages/leads/DumpedLeads';
import Calls from './pages/calls/Calls';
import AddCall from './pages/calls/AddCall';
import CallsList from './pages/calls/CallsList';
import UploadCalls from './pages/calls/UploadCalls';
import NewCall from './pages/calls/NewCall';
import Scheduler from './pages/scheduler/Scheduler';
import Calendar from './pages/scheduler/Calendar';
import Team from './pages/team/Team';
import TeamManagement from './pages/team/TeamManagement';
import TeamHierarchy from './pages/team/TeamHierarchy';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';
import Reports from './pages/reports/Reports';
import Tasks from './pages/tasks/Tasks';
import TaskForm from './pages/tasks/TaskForm';
import Documents from './pages/documents/Documents';
import Uploads from './pages/documents/Uploads';
import BrochuresPage from './pages/brochures';
import DeveloperBrochuresPage from './pages/brochures/DeveloperBrochuresPage';
import UploadBrochurePage from './pages/brochures/UploadBrochurePage';
import ManageDevelopersPage from './pages/brochures/ManageDevelopersPage';
import ManageBrochuresPage from './pages/brochures/ManageBrochuresPage';
import DashboardV2 from './pages/dashboard/DashboardV2';
import DashboardPro from './pages/dashboard/DashboardPro';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EditUser from './pages/admin/EditUser';
import UsersManagement from './pages/admin/UsersManagement';
import UsersList from './pages/admin/UsersList';
import AddUser from './pages/admin/AddUser';
import NewUser from './pages/admin/NewUser';
import AllReports from './pages/admin/AllReports';
import AdminDesignationsPage from './pages/admin/AdminDesignationsPage';
import AdminTeamRevenuePage from './pages/admin/AdminTeamRevenuePage';

import LeadQuickActions from './pages/leads/LeadQuickActions';
import ChatTemplates from './pages/chat/ChatTemplates';
import LiveActivityTracker from './pages/activity/LiveActivityTracker';
import ColdCalls from './pages/cold-calls';
import ChatPage from './pages/chat/ChatPage';
import Developers from './pages/developers/Developers';
import DeveloperDetails from './pages/developers/DeveloperDetails';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminNewUserPage from './pages/admin/AdminNewUserPage';
import AdminTeamHierarchyPage from './pages/admin/AdminTeamHierarchyPage';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return null;
  }

  const handleLeadSubmit = async (lead: any) => {
    try {
      // TODO: Implement lead submission
      navigate('/leads');
    } catch (error) {
      console.error('Error submitting lead:', error);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Entry Route */}
        {!user && <Route path="/" element={<Entry />} />}
        {/* Auth Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? (
          <SignupStepper>
            <SignupForm />
          </SignupStepper>
        ) : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/" />} />

        {/* Protected Routes with Layout */}
        {user && (
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<LoadingBoundary skeletonType="card"><Dashboard /></LoadingBoundary>} />
            <Route path="/properties" element={<LoadingBoundary skeletonType="table"><Properties /></LoadingBoundary>} />
            <Route path="/properties/:id" element={<LoadingBoundary skeletonType="card"><PropertyDetails /></LoadingBoundary>} />
            <Route path="/properties/new" element={<LoadingBoundary skeletonType="form"><PropertyForm /></LoadingBoundary>} />
            <Route path="/properties/edit/:id" element={<LoadingBoundary skeletonType="form"><PropertyForm /></LoadingBoundary>} />
            <Route path="/properties/add" element={<Navigate to="/properties/new" replace />} />
            <Route path="/leads" element={<LoadingBoundary skeletonType="table"><Leads /></LoadingBoundary>} />
            <Route path="/leads/:id" element={<LoadingBoundary skeletonType="card"><LeadDetails /></LoadingBoundary>} />
            <Route path="/leads/add" element={<LoadingBoundary skeletonType="form"><AddLead /></LoadingBoundary>} />
            <Route path="/leads/new" element={<LoadingBoundary skeletonType="form"><LeadForm /></LoadingBoundary>} />
            <Route path="/leads/edit/:id" element={<LoadingBoundary skeletonType="form"><LeadForm /></LoadingBoundary>} />
            <Route path="/leads/form" element={<LoadingBoundary skeletonType="form"><LeadForm /></LoadingBoundary>} />
            <Route path="/leads/list" element={<LoadingBoundary skeletonType="table"><LeadsList /></LoadingBoundary>} />
            <Route path="/leads/dumped" element={<LoadingBoundary skeletonType="table"><DumpedLeads /></LoadingBoundary>} />
            <Route path="/calls" element={<LoadingBoundary skeletonType="table"><Calls /></LoadingBoundary>} />
            <Route path="/calls/add" element={<LoadingBoundary skeletonType="form"><AddCall /></LoadingBoundary>} />
            <Route path="/calls/list" element={<LoadingBoundary skeletonType="table"><CallsList /></LoadingBoundary>} />
            <Route path="/calls/upload" element={<LoadingBoundary skeletonType="form"><UploadCalls /></LoadingBoundary>} />
            <Route path="/calls/new" element={<LoadingBoundary skeletonType="form"><NewCall /></LoadingBoundary>} />
            <Route path="/scheduler" element={<LoadingBoundary skeletonType="card"><Scheduler /></LoadingBoundary>} />
            <Route path="/calendar" element={<LoadingBoundary skeletonType="card"><Calendar /></LoadingBoundary>} />
            <Route path="/reports" element={
              <ProtectedRoute requireAdmin>
                <LoadingBoundary skeletonType="table">
                  <Reports />
                </LoadingBoundary>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={<LoadingBoundary skeletonType="table"><Tasks /></LoadingBoundary>} />
            <Route path="/tasks/new" element={<LoadingBoundary skeletonType="form"><TaskForm /></LoadingBoundary>} />
            <Route path="/documents" element={<LoadingBoundary skeletonType="table"><Documents /></LoadingBoundary>} />
            <Route path="/documents/uploads" element={<LoadingBoundary skeletonType="table"><Uploads /></LoadingBoundary>} />
            <Route path="/team" element={<LoadingBoundary skeletonType="table"><Team /></LoadingBoundary>} />
            <Route path="/team/management" element={<LoadingBoundary skeletonType="table"><TeamManagement /></LoadingBoundary>} />
            <Route path="/team/hierarchy" element={<LoadingBoundary skeletonType="table"><TeamHierarchy /></LoadingBoundary>} />
            <Route path="/settings" element={<LoadingBoundary skeletonType="form"><Settings /></LoadingBoundary>} />
            <Route path="/chat/templates" element={<LoadingBoundary skeletonType="table"><ChatTemplates /></LoadingBoundary>} />
            <Route path="/activity/live" element={<LoadingBoundary skeletonType="card"><LiveActivityTracker /></LoadingBoundary>} />
            <Route path="/cold-calls" element={<LoadingBoundary skeletonType="table"><ColdCalls /></LoadingBoundary>} />
            <Route path="/brochures/upload" element={user?.is_admin === true ? <LoadingBoundary skeletonType="form"><UploadBrochurePage onUploadSuccess={() => {}} /></LoadingBoundary> : <Navigate to="/" />} />
            <Route path="/brochures/developers" element={user?.is_admin === true ? <LoadingBoundary skeletonType="form"><ManageDevelopersPage onDataChange={() => {}} /></LoadingBoundary> : <Navigate to="/" />} />
            <Route path="/brochures/manage" element={user?.is_admin === true ? <LoadingBoundary skeletonType="form"><ManageBrochuresPage onDataChange={() => {}} /></LoadingBoundary> : <Navigate to="/" />} />
            <Route path="/brochures" element={<LoadingBoundary skeletonType="table"><BrochuresPage /></LoadingBoundary>} />
            <Route path="/brochures/:developerId" element={<LoadingBoundary skeletonType="table"><DeveloperBrochuresPage /></LoadingBoundary>} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/dashboard-v2" element={<DashboardV2 />} />
            <Route path="/dashboard-pro" element={<DashboardPro />} />
            {/* Admin Routes (optional: move these out if you want a different layout for admin) */}
            <Route path="/admin" element={user?.is_admin === true ? <LoadingBoundary><AdminDashboard /></LoadingBoundary> : <Navigate to="/" />} />
            <Route path="/admin/users/edit/:id" element={user?.is_admin === true ? <LoadingBoundary><EditUser /></LoadingBoundary> : <Navigate to="/" />} />
            <Route path="/admin/users/management" element={user?.is_admin === true ? <LoadingBoundary><UsersManagement /></LoadingBoundary> : <Navigate to="/login" />} />
            <Route path="/admin/users/list" element={user?.is_admin === true ? <LoadingBoundary><UsersList /></LoadingBoundary> : <Navigate to="/login" />} />
            <Route path="/admin/users/add" element={user?.is_admin === true ? <LoadingBoundary><AddUser /></LoadingBoundary> : <Navigate to="/login" />} />
            <Route path="/admin/users/new" element={user?.is_admin === true ? <LoadingBoundary><NewUser /></LoadingBoundary> : <Navigate to="/login" />} />
            <Route path="/admin/reports" element={user?.is_admin === true ? <LoadingBoundary><AllReports /></LoadingBoundary> : <Navigate to="/login" />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/developers/:id" element={<DeveloperDetails />} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/user/new" element={<ProtectedRoute requireAdmin={true}><AdminNewUserPage /></ProtectedRoute>} />
            <Route path="/admin/team-hierarchy" element={<ProtectedRoute requireAdmin={true}><AdminTeamHierarchyPage /></ProtectedRoute>} />
            <Route path="/admin/designations" element={<ProtectedRoute requireAdmin={true}><AdminDesignationsPage /></ProtectedRoute>} />
            <Route path="/admin/team-revenue" element={<ProtectedRoute requireAdmin={true}><AdminTeamRevenuePage /></ProtectedRoute>} />
          </Route>
        )}

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes; 