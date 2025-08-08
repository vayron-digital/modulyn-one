import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingBoundary from './components/common/LoadingBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageErrorBoundary from './components/common/PageErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #4371c5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
      <div style={{ color: '#6b7280', fontSize: 14 }}>Loading...</div>
    </div>
  </div>
);

// Landing Page - Lazy loaded
const LandingPage = React.lazy(() => import('./pages/LandingPage'));

// Auth Pages - Lazy loaded
const Login = React.lazy(() => import('./pages/auth/Login'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const Entry = React.lazy(() => import('./pages/auth/Entry'));
const SignupStepper = React.lazy(() => import('./components/signup/SignupStepper').then(module => ({ default: module.SignupStepper })));
const SignupForm = React.lazy(() => import('./components/signup/SignupForm'));
const AccountCreation = React.lazy(() => import('./pages/auth/AccountCreation'));
const AccountCreationSuccess = React.lazy(() => import('./pages/auth/AccountCreationSuccess'));
const OAuthCallback = React.lazy(() => import('./pages/auth/OAuthCallback'));

// Main Pages - Lazy loaded
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Properties = React.lazy(() => import('./pages/properties/Properties'));
const PropertyDetails = React.lazy(() => import('./pages/properties/PropertyDetails'));
const PropertyForm = React.lazy(() => import('./pages/properties/PropertyForm'));
const Leads = React.lazy(() => import('./pages/leads/Leads'));
const LeadDetails = React.lazy(() => import('./pages/leads/LeadDetails'));
const AddLead = React.lazy(() => import('./pages/leads/AddLead'));
const NewLead = React.lazy(() => import('./pages/leads/NewLead'));
const EditLead = React.lazy(() => import('./pages/leads/EditLead'));
const LeadForm = React.lazy(() => import('./pages/leads/LeadForm'));
const LeadsList = React.lazy(() => import('./pages/leads/LeadsList'));
const DumpedLeads = React.lazy(() => import('./pages/leads/DumpedLeads'));
const Calls = React.lazy(() => import('./pages/calls/Calls'));
const AddCall = React.lazy(() => import('./pages/calls/AddCall'));
const CallsList = React.lazy(() => import('./pages/calls/CallsList'));
const UploadCalls = React.lazy(() => import('./pages/calls/UploadCalls'));
const NewCall = React.lazy(() => import('./pages/calls/NewCall'));
const Scheduler = React.lazy(() => import('./pages/scheduler/Scheduler'));
const Calendar = React.lazy(() => import('./pages/scheduler/Calendar'));
const Team = React.lazy(() => import('./pages/team/Team'));
const TeamManagement = React.lazy(() => import('./pages/team/TeamManagement'));
const TeamHierarchy = React.lazy(() => import('./pages/team/TeamHierarchy'));
const Settings = React.lazy(() => import('./pages/settings/Settings'));
const Subscription = React.lazy(() => import('./pages/settings/Subscription'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Reports = React.lazy(() => import('./pages/reports/Reports'));
const Tasks = React.lazy(() => import('./pages/tasks/Tasks'));
const TaskForm = React.lazy(() => import('./pages/tasks/TaskForm'));
const Documents = React.lazy(() => import('./pages/documents/Documents'));
const Uploads = React.lazy(() => import('./pages/documents/Uploads'));
const BrochuresPage = React.lazy(() => import('./pages/brochures'));
const DeveloperBrochuresPage = React.lazy(() => import('./pages/brochures/DeveloperBrochuresPage'));
const UploadBrochurePage = React.lazy(() => import('./pages/brochures/UploadBrochurePage'));
const ManageDevelopersPage = React.lazy(() => import('./pages/brochures/ManageDevelopersPage'));
const ManageBrochuresPage = React.lazy(() => import('./pages/brochures/ManageBrochuresPage'));

// Admin Pages - Lazy loaded
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const EditUser = React.lazy(() => import('./pages/admin/EditUser'));
const UsersManagement = React.lazy(() => import('./pages/admin/UsersManagement'));
const UsersList = React.lazy(() => import('./pages/admin/UsersList'));
const AddUser = React.lazy(() => import('./pages/admin/AddUser'));
const NewUser = React.lazy(() => import('./pages/admin/NewUser'));
const AllReports = React.lazy(() => import('./pages/admin/AllReports'));
const AdminDesignationsPage = React.lazy(() => import('./pages/admin/AdminDesignationsPage'));
const AdminTeamRevenuePage = React.lazy(() => import('./pages/admin/AdminTeamRevenuePage'));

// Additional Pages - Lazy loaded
const LeadQuickActions = React.lazy(() => import('./pages/leads/LeadQuickActions'));
const ChatTemplates = React.lazy(() => import('./pages/chat/ChatTemplates'));
const LiveActivityTracker = React.lazy(() => import('./pages/activity/LiveActivityTracker'));
const ColdCalls = React.lazy(() => import('./pages/cold-calls'));
const ChatPage = React.lazy(() => import('./pages/chat/ChatPage'));
const Developers = React.lazy(() => import('./pages/developers/Developers'));
const DeveloperDetails = React.lazy(() => import('./pages/developers/DeveloperDetails'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminNewUserPage = React.lazy(() => import('./pages/admin/AdminNewUserPage'));
const AdminTeamHierarchyPage = React.lazy(() => import('./pages/admin/AdminTeamHierarchyPage'));
const StorageTest = React.lazy(() => import('./pages/admin/StorageTest'));

// Wrapper component for Suspense with Error Boundary
const SuspenseWrapper = ({ children, skeletonType, pageName }: { children: React.ReactNode; skeletonType?: 'table' | 'card' | 'form'; pageName?: string }) => (
  <PageErrorBoundary pageName={pageName} showDetails={import.meta.env.DEV}>
    <Suspense fallback={<PageLoader />}>
      <LoadingBoundary skeletonType={skeletonType}>
        {children}
      </LoadingBoundary>
    </Suspense>
  </PageErrorBoundary>
);

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />
        <Route path="/login" element={!user ? <Suspense fallback={<PageLoader />}><Login /></Suspense> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? (
          <Suspense fallback={<PageLoader />}>
            <SignupStepper>
              <SignupForm />
            </SignupStepper>
          </Suspense>
        ) : <Navigate to="/dashboard" />} />
        <Route path="/account-creation" element={<Suspense fallback={<PageLoader />}><AccountCreation /></Suspense>} />
        <Route path="/account-creation-success" element={!user ? <Suspense fallback={<PageLoader />}><AccountCreationSuccess /></Suspense> : <Navigate to="/dashboard" />} />
        <Route path="/auth/callback" element={<Suspense fallback={<PageLoader />}><OAuthCallback /></Suspense>} />
        <Route path="/forgot-password" element={!user ? <Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={!user ? <Suspense fallback={<PageLoader />}><ResetPassword /></Suspense> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes with layout */}
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SuspenseWrapper skeletonType="card" pageName="Dashboard">
                  <Dashboard />
                </SuspenseWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <SuspenseWrapper skeletonType="table" pageName="Properties">
                  <Properties />
                </SuspenseWrapper>
              </ProtectedRoute>
            }
          />
          <Route path="/properties/:id" element={<SuspenseWrapper skeletonType="card"><PropertyDetails /></SuspenseWrapper>} />
          <Route path="/properties/new" element={<SuspenseWrapper skeletonType="form"><PropertyForm /></SuspenseWrapper>} />
          <Route path="/properties/edit/:id" element={<SuspenseWrapper skeletonType="form"><PropertyForm /></SuspenseWrapper>} />
          <Route path="/properties/add" element={<Navigate to="/properties/new" replace />} />
          <Route path="/leads" element={<SuspenseWrapper skeletonType="table" pageName="Leads"><Leads /></SuspenseWrapper>} />
          <Route path="/leads/:id" element={<SuspenseWrapper skeletonType="card"><LeadDetails /></SuspenseWrapper>} />
          <Route path="/leads/add" element={<SuspenseWrapper skeletonType="form"><AddLead /></SuspenseWrapper>} />
          <Route path="/leads/new" element={<SuspenseWrapper skeletonType="form"><LeadForm /></SuspenseWrapper>} />
          <Route path="/leads/edit/:id" element={<SuspenseWrapper skeletonType="form"><LeadForm /></SuspenseWrapper>} />
          <Route path="/leads/form" element={<SuspenseWrapper skeletonType="form"><LeadForm /></SuspenseWrapper>} />
          <Route path="/leads/list" element={<SuspenseWrapper skeletonType="table"><LeadsList /></SuspenseWrapper>} />
          <Route path="/leads/dumped" element={<SuspenseWrapper skeletonType="table"><DumpedLeads /></SuspenseWrapper>} />
          <Route path="/calls" element={<SuspenseWrapper skeletonType="table"><Calls /></SuspenseWrapper>} />
          <Route path="/calls/add" element={<SuspenseWrapper skeletonType="form"><AddCall /></SuspenseWrapper>} />
          <Route path="/calls/list" element={<SuspenseWrapper skeletonType="table"><CallsList /></SuspenseWrapper>} />
          <Route path="/calls/upload" element={<SuspenseWrapper skeletonType="form"><UploadCalls /></SuspenseWrapper>} />
          <Route path="/calls/new" element={<SuspenseWrapper skeletonType="form"><NewCall /></SuspenseWrapper>} />
          <Route path="/scheduler" element={<SuspenseWrapper skeletonType="card"><Scheduler /></SuspenseWrapper>} />
          <Route path="/calendar" element={<SuspenseWrapper skeletonType="card"><Calendar /></SuspenseWrapper>} />
          <Route path="/reports" element={
            <ProtectedRoute requireAdmin>
              <SuspenseWrapper skeletonType="table">
                <Reports />
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={<SuspenseWrapper skeletonType="table" pageName="Tasks"><Tasks /></SuspenseWrapper>} />
          <Route path="/tasks/new" element={<SuspenseWrapper skeletonType="form"><TaskForm /></SuspenseWrapper>} />
          <Route path="/documents" element={<SuspenseWrapper skeletonType="table"><Documents /></SuspenseWrapper>} />
          <Route path="/documents/uploads" element={<SuspenseWrapper skeletonType="table"><Uploads /></SuspenseWrapper>} />
          <Route path="/team" element={<SuspenseWrapper skeletonType="table"><Team /></SuspenseWrapper>} />
          <Route path="/team/management" element={<SuspenseWrapper skeletonType="table"><TeamManagement /></SuspenseWrapper>} />
          <Route path="/team/hierarchy" element={<SuspenseWrapper skeletonType="table"><TeamHierarchy /></SuspenseWrapper>} />
          <Route path="/settings" element={<SuspenseWrapper skeletonType="form"><Settings /></SuspenseWrapper>} />
          <Route path="/settings/subscription" element={
            <ProtectedRoute requireAdmin>
              <SuspenseWrapper skeletonType="card" pageName="Subscription">
                <Subscription />
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/chat/templates" element={<SuspenseWrapper skeletonType="table"><ChatTemplates /></SuspenseWrapper>} />
          <Route path="/activity/live" element={<SuspenseWrapper skeletonType="card"><LiveActivityTracker /></SuspenseWrapper>} />
          <Route path="/cold-calls" element={<SuspenseWrapper skeletonType="table"><ColdCalls /></SuspenseWrapper>} />
          <Route path="/brochures/upload" element={user?.is_admin === true ? <SuspenseWrapper skeletonType="form"><UploadBrochurePage onUploadSuccess={() => {}} /></SuspenseWrapper> : <Navigate to="/" />} />
          <Route path="/brochures/developers" element={user?.is_admin === true ? <SuspenseWrapper skeletonType="form"><ManageDevelopersPage onDataChange={() => {}} /></SuspenseWrapper> : <Navigate to="/" />} />
          <Route path="/brochures/manage" element={user?.is_admin === true ? <SuspenseWrapper skeletonType="form"><ManageBrochuresPage onDataChange={() => {}} /></SuspenseWrapper> : <Navigate to="/" />} />
          <Route path="/brochures" element={<SuspenseWrapper skeletonType="table"><BrochuresPage /></SuspenseWrapper>} />
          <Route path="/brochures/:developerId" element={<SuspenseWrapper skeletonType="table"><DeveloperBrochuresPage /></SuspenseWrapper>} />
          <Route path="/chat" element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={user?.is_admin === true ? <Suspense fallback={<PageLoader />}><LoadingBoundary><AdminDashboard /></LoadingBoundary></Suspense> : <Navigate to="/" />} />
          <Route path="/admin/users/edit/:id" element={user?.is_admin === true ? <Suspense fallback={<PageLoader />}><LoadingBoundary><EditUser /></LoadingBoundary></Suspense> : <Navigate to="/" />} />
          <Route path="/admin/users/management" element={user?.is_admin === true ? <Suspense fallback={<PageLoader />}><LoadingBoundary><UsersManagement /></LoadingBoundary></Suspense> : <Navigate to="/login" />} />
          <Route path="/admin/users/list" element={user?.is_admin === true ? <Suspense fallback={<PageLoader />}><LoadingBoundary><UsersList /></LoadingBoundary></Suspense> : <Navigate to="/login" />} />
          <Route path="/admin/users/add" element={user?.is_admin === true ? <Suspense fallback={<PageLoader />}><LoadingBoundary><AddUser /></LoadingBoundary></Suspense> : <Navigate to="/login" />} />
          <Route path="/admin/users/new" element={user?.is_admin === true ? <Suspense fallback={<PageLoader />}><LoadingBoundary><NewUser /></LoadingBoundary></Suspense> : <Navigate to="/login" />} />
          <Route path="/admin/reports" element={user?.is_admin === true ? <Suspense fallback={<PageLoader />}><LoadingBoundary><AllReports /></LoadingBoundary></Suspense> : <Navigate to="/login" />} />
          <Route path="/developers" element={<Suspense fallback={<PageLoader />}><Developers /></Suspense>} />
          <Route path="/developers/:id" element={<Suspense fallback={<PageLoader />}><DeveloperDetails /></Suspense>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense></ProtectedRoute>} />
          <Route path="/admin/user/new" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<PageLoader />}><AdminNewUserPage /></Suspense></ProtectedRoute>} />
          <Route path="/admin/team-hierarchy" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<PageLoader />}><AdminTeamHierarchyPage /></Suspense></ProtectedRoute>} />
          <Route path="/admin/designations" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<PageLoader />}><AdminDesignationsPage /></Suspense></ProtectedRoute>} />
          <Route path="/admin/team-revenue" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<PageLoader />}><AdminTeamRevenuePage /></Suspense></ProtectedRoute>} />
          <Route path="/admin/storage-test" element={<ProtectedRoute requireAdmin={true}><Suspense fallback={<PageLoader />}><StorageTest /></Suspense></ProtectedRoute>} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes; 