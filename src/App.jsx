// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

import LoadingSpinner from './components/ui/LoadingSpinner';
import Layout from './components/layout/Layout';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import './i18n';
import { useTranslation } from 'react-i18next';

import NewsListPage from './pages/public/NewsListPage';
import NewsDetailPage from './pages/public/NewsDetailPage';
import StaticPageDetail from './pages/public/StaticPageDetail';
import CircularsPage from './pages/public/CircularsPage';
import TenderPage from './pages/public/TenderPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import FeedbackPage from './pages/public/FeedbackPage';
import RTIFormPage from './pages/public/RTIFormPage';
import RTITrackerPage from './pages/public/RTITrackerPage';
import BooksPage from './pages/public/BooksPage';
import BookReader from './pages/public/BookReader';
import AuthorsPage from './pages/public/AuthorsPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignUp';
import ProfilePage from './pages/auth/ProfilePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// CMS  section  admin sidebar imports
import CMSDashboardPage from './pages/cms/CMSDashboardPage';
import DepartmentManagementPage from './pages/cmtc/departmentManagementPage.jsx';
import CmtcCenterManagementPage from './pages/cmtc/CmtcCenterManagementPage.jsx';
//grading and audit import
import GradingPage from './pages/cmtc/GradingPage.jsx';
import AuditPage from './pages/cmtc/AuditPage.jsx';

// import CmtcOfficerManagement from './pages/cmtc/CmtcOfficerManagement.jsx';
import CmtcAmenityManagement from './pages/cmtc/cmtcAmenityManagement.jsx';

import CmtcBookingManagmentPage from './pages/cmtc/CmtcBookingManagmentPage.jsx';
import ImportantLinkManagementPage from './pages/cms/ImportantLinkManagementPage.jsx';
import NewsManagementPage from './pages/cms/NewsManagementPage';
import CircularManagementPage from './pages/cms/CircularManagementPage';
import TenderManagementPage from './pages/cms/TenderManagementPage';
import StaticPageManagementPage from './pages/cms/StaticPageManagementPage';
import GalleryManagementPage from './pages/cms/GalleryManagementPage';
import AuthorManagementPage from './pages/cms/AuthorManagementPage';
import BookManagementPage from './pages/cms/BookManagementPage';
// import SubscriptionSettingPage from './pages/cms/SubscriptionSettingPage';
import CarouselManagementPage from './pages/cms/CarouselManagementPage';
import SrlmYoutubeAdmin from './pages/cms/SrlmYoutubeAdmin';
import ManageMpsrlm from './pages/cms/manage-mpsrlm.jsx';
import LeadersAdmin from './pages/cms/photoAdmin.jsx';

import ContentApprovalPage from './pages/cms/ContentApprovalPage';


// Admin section sidebar
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
// import ManageServicesPage from './pages/admin/ManageServicesPage';
import ContactMessagesPage from './pages/admin/ContactMessagesPage';
import FeedbackManagementPage from './pages/admin/FeedbackManagementPage';
// import AddSubscriptionPage from './pages/admin/AddSubscription';
// import SubscriptionManagementPage from './pages/admin/SubscriptionManagementPage';

import NotFoundPage from './pages/NotFoundPage';

// subscription and payment
// import SubscriptionPlans from './pages/public/subscriptions/new/SubscriptionPlans';
// import MySubscriptionPlans from './pages/public/subscriptions/new/MySubscriptionPlans';
// import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
// import ContentAccessPage from './pages/ContentAccessPage';
//import PaymentPage from './pages/public/subscriptions/new/PaymentPage';
// import PlanSummaryPage from './pages/public/subscriptions/PlanSummaryPage';

import RtiDocumentPage from './pages/public/RtiDocumentPage';
import CategoryMaster from "./pages/public/CategoryMaster";

import AdvertisementManagementPage from './pages/cms/AdvertisementManagementPage';
import RtiDocumentManagementPage from './pages/admin/RtiDocumentManagementPage';
// import Home2 from './components/sections/Home2';
import CmtcPage from './components/sections/CmtcPage.jsx';

//Film
import FilmManagementPage from './pages/public/film/FilmManagementPage';
import FilmDetailsPage from './pages/public/film/FilmDetailsPage';
import FilmListPage from './pages/public/film/FilmListPage';
// project
import ProjectManagementPage from './pages/public/project/ProjectManagementPage';
import ProjectDetailsPage from './pages/public/project/ProjectDetailsPage';
import ProjectListPage from './pages/public/project/ProjectListPage';
// Event
import EventManagementPage from './pages/public/event/EventManagementPage';
import EventDetailsPage from './pages/public/event/EventDetailsPage';
import EventListPage from './pages/public/event/EventListPage';
// Advertisement
import AdvertisementSectionMgmtPage from './pages/cms/AdvertisementSectionMgmtPage';
import AdvertisementSectionListPage from './pages/public/AdvertisementSectionListPage';
import AdvertisementSectionDetailPage from './pages/public/AdvertisementSectionDetailPage';
// Print
import PrintingSectionMgmtPage from './pages/cms/PrintingSectionMgmtPage';
import PrintingSectionListPage from './pages/public/PrintingSectionListPage';
import PrintingSectionDetailsPage from './pages/public/PrintingSectionDetailsPage';
// ActionPlan
import ActionPlanManagementPage from './pages/public/action-plan/ActionPlanManagementPage';
import ActionPlanDetailsPage from './pages/public/action-plan/ActionPlanDetailsPage';
import ActionPlanListPage from './pages/public/action-plan/ActionPlanListPage';


import MpsrlmPage from './pages/public/MpsrLmPage.jsx';
import ServiceListPage from './pages/public/services/ServiceListPage';
import ServiceDetailPage from './pages/public/services/ServiceDetailPage';

// important-links
import ModelClfDataEntry from "./pages/public/important-links/ModelClfDataEntry";
import VidyutSakhi from "./pages/public/important-links/VidyutSakhi";
import Pfms from "./pages/public/important-links/Pfms";
import Iprp from "./pages/public/important-links/Iprp";
import CaderRegistration from "./pages/public/important-links/CaderRegistration";
import BcSakhiCbo from "./pages/public/important-links/BcSakhiCbo";
import ShgRegistration from "./pages/public/important-links/ShgRegistration";
import RuralSoft from "./pages/public/important-links/RuralSoft";
import NrlmMisPortal from "./pages/public/important-links/NrlmMisPortal";
import NrlmWebsites from "./pages/public/important-links/NrlmWebsites";

import MpMap from './components/map/MpMap';
import CmtcCenterList from './pages/public/cmtc/CmtcCenterList.jsx';
import CmtcCenterDetails from './pages/public/cmtc/CmtcCenterDetails.jsx';
import CmtcBookingPage from "./pages/public/cmtc/CmtcBookingPage";
import Officerdashboard from './components/sections/Officerdashboard.jsx';
//Training report form and data
import TrainingReport from './components/sections/TrainingReport.jsx';
import TrainingDataPage from './components/sections/TrainingDataPage.jsx';
import UserDashboardPage from "./pages/user/UserDashboardPage.jsx";
import { Grading } from '@mui/icons-material';
import CmtcGalleryAdminPage from './pages/cmtc/CmtcGalleryAdminPage.jsx';
import CmtcEventsManagementPage from './pages/cmtc/CmtcEventsManagement.jsx'
import CmtcEventDetailsPage from './pages/public/CmtcEventsDetailPage.jsx';
import PaymentPage from './pages/public/payment/PaymentPage.jsx';
import AboutUs from './pages/public/AboutUs.jsx'
import OrganizationStructure from './pages/public/OrganizationStructure.jsx'
import HumanParliament from "./pages/HumanParliament.jsx"
import PaymentResult from "./pages/payment/PaymentResult.jsx";
import Invoice from './pages/cmtc/Invoice.jsx';
import FinancialForm from "./pages/admin/FinancialForm.jsx"
import TotalBookings from './pages/admin/TotalBookings.jsx'
import MisReport from './pages/admin/MisReport.jsx'
import MisInternalBooking from './pages/admin/MisInternalBooking.jsx'
import MisAllBookings from './pages/admin/MisAllBookings.jsx'

import InternalCmtcCenterList from './pages/public/cmtc/InternalCenterListPage.jsx';
import GradingWorkspace from './grading-audit/grading/pages/GradingWorkspace.jsx';
import AuditWorkspace from './grading-audit/audit/pages/AuditWorkspace.jsx';
import { LSB_ROLES, USER_ROLES } from './utils/constants.js';
import LsbRegistration from './lsb/auth/pages/LsbRegistration.jsx';
import LsbLoginPage from './lsb/auth/pages/LsbLoginPage.jsx';
import LsbUserManagement from './lsb/user-management/pages/LsbUserManagement.jsx';
import RequestLoanSubsidy from './lsb/loan-management/pages/RequestLoanSubsidy.jsx';
import LoanRequests from './lsb/loan-management/pages/LoanRequests.jsx';
import { LoanRequestDetails } from './lsb/loan-management/pages/LoanRequestDetails.jsx';

function AppContent() {
  const { isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('siteTitle');
  }, [i18n.language, t]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
          <Route path="/lsb/login" element={<LsbLoginPage />} />
             <Route path="/lsb/registration" element={<LsbRegistration />} />
        <Route path="/" element={<Layout />}>

          <Route index element={<CmtcPage />} />

          {/* Public Routes */}
          <Route path="/news" element={<NewsListPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/circulars" element={<CircularsPage />} />
          <Route path="/tenders" element={<TenderPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/payment-status" element={<paymentStatus />} />
          <Route path="/Aboutus" element={<AboutUs />} />
          <Route path="/Organization-structure" element={<OrganizationStructure />} />

          <Route path="/payment/result" element={<PaymentResult />} />


          <Route path="/pages/:slug" element={<StaticPageDetail />} />
          {/* Subscriptions */}
          {/* <Route path="/SubscriptionPlans" element={<SubscriptionPlans />} />//
          <Route path="/MySubscriptionPlans" element={<MySubscriptionPlans />} />
          <Route path="/subscriptions/new" element={<AddSubscriptionPage />} />
          <Route path="/subscriptions/plans" element={<SubscriptionPlansPage />} /> */}

          {/* FIXED: only 2 correct service routes */}
          <Route path="/services/:serviceSlug" element={<ServiceListPage />} />
          <Route path="/services/:serviceSlug/:id" element={<ServiceDetailPage />} />

          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cmtc-page" element={<CmtcPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/rti/submit" element={<RTIFormPage />} />
          <Route path="/rti/track" element={<RTITrackerPage />} />
          <Route path="/rti/document" element={<RtiDocumentPage />} />
          <Route path="/admin/category-master" element={<CategoryMaster />} />
          <Route path="/mpsrlm" element={<MpsrlmPage />} />

          {/* training report form*/}
          <Route path="training_report" element={<TrainingReport />} />
          {/* training data*/}
          <Route path="training_data" element={<TrainingDataPage />} />

          {/* Books */}
          <Route path="/books" element={<BooksPage />} />
          <Route path="/reader" element={<BookReader />} />
          <Route path="/authors" element={<AuthorsPage />} />

          {/* payment */}
          {/*<Route path="/payment/:planId" element={<PaymentPage />} /> */}
          {/*<Route path="/summary/:planId" element={<PlanSummaryPage />} />*/}

          {/* Advertisement Section HSG PRODUCTS */}
          <Route path="/advertisementSectionList" element={<AdvertisementSectionListPage />} />
          <Route path="/advertisementSectionDetails/:id" element={<AdvertisementSectionDetailPage />} />

          {/* Printing Section */}
          <Route path="/printingSectionList" element={<PrintingSectionListPage />} />
          <Route path="/printingSectionDetails/:id" element={<PrintingSectionDetailsPage />} />

          {/* Films */}
          <Route path="/filmSectionList" element={<FilmListPage />} />
          <Route path="/film/:id" element={<FilmDetailsPage />} />

          {/* Projects */}
          <Route path="/projectSectionList" element={<ProjectListPage />} />
          <Route path="/project/:id" element={<ProjectDetailsPage />} />

          {/* Events */}
          <Route path="/eventSectionList" element={<EventListPage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/HumanParliament" element={<HumanParliament />} />
          {/* important-links */}
          <Route path="/important/model-clf-data-entry" element={<ModelClfDataEntry />} />
          <Route path="/important/vidyut-sakhi" element={<VidyutSakhi />} />
          <Route path="/important/pfms" element={<Pfms />} />
          <Route path="/important/iprp" element={<Iprp />} />
          <Route path="/important/cader-registration" element={<CaderRegistration />} />
          <Route path="/important/bc-sakhi-cbo" element={<BcSakhiCbo />} />
          <Route path="/important/shg-registration" element={<ShgRegistration />} />
          <Route path="/important/rural-soft" element={<RuralSoft />} />
          <Route path="/important/nrlm-mis" element={<NrlmMisPortal />} />
          <Route path="/important/nrlm-websites" element={<NrlmWebsites />} />
          <Route path="/map" element={<MpMap />} />
          <Route path="/district" element={<CmtcCenterList />} />
          <Route path="/district/:districtName" element={<CmtcCenterList />} />
          <Route path="/center-details/:centerId" element={<CmtcCenterDetails />} />
          <Route path="/cmtc-booking/:centerId" element={<CmtcBookingPage />} />
          <Route path="/cmtc-events/:id" element={<CmtcEventDetailsPage />} />
          <Route path="/invoice/:bookingId" element={<Invoice/>} />



          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
        
          <Route path="/Signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
       

          {/* <Route path="/profile/*" element={<PrivateRoute  />}>
            <Route path="edit" element={<ProfilePage />} />
          </Route> */}

          <Route path="/profile" element={<PrivateRoute />}>
            {/* This will match exactly "/profile" */}
            <Route index element={<ProfilePage />} />
            {/* This will match "/profile/edit" */}
            <Route path="edit" element={<ProfilePage />} />
          </Route>

          
          <Route path="/lsb/*" element={<PrivateRoute requiredRoles={LSB_ROLES} />}>
            <Route path="user-management" element={<LsbUserManagement />} />
            <Route path="request-new-loan-subsidy" element={<RequestLoanSubsidy />} />
            <Route path="loan-requests" element={<LoanRequests />} />
            <Route path="loan-requests/:applicationId" element={<LoanRequestDetails />} />
          </Route>

          
          {/* CMS Private Routes */}
          <Route path="/cms/*" element={<PrivateRoute requiredRoles={['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN', 'DISTRICT_OFFICER', 'BLOCK_OFFICER']} />}>
            <Route path="dashboard" element={<CMSDashboardPage />} />

            <Route path="departments" element={<DepartmentManagementPage />} />
            <Route path="departments/:id" element={<DepartmentManagementPage />} />

            <Route path="cmtc-centers" element={<CmtcCenterManagementPage />} />
            <Route path="cmtc-centers/:centerId" element={<CmtcCenterManagementPage />} />

            {/* <Route path="cmtc-officer" element={<CmtcOfficerManagement />} />
            <Route path="cmtc-officer/:officerId" element={<CmtcOfficerManagement />} /> */}
            <Route path="cmtc-amenity" element={<CmtcAmenityManagement />} />
            <Route path="cmtc-amenity/:amenityId" element={<CmtcAmenityManagement />} />
            {/* <Route path="cmtc-subamenity" element={<CmtcSubAmenityManagement />} />
            <Route path="cmtc-subamenity/:subamenityId" element={<CmtcSubAmenityManagement />} /> */}
            <Route path="cmtc-bookingManagement" element={<CmtcBookingManagmentPage />} />

            <Route path="important-links" element={<ImportantLinkManagementPage />} />
            <Route path="important-links/:id" element={<ImportantLinkManagementPage />} />

            <Route path="news" element={<NewsManagementPage />} />
            <Route path="news/:id" element={<NewsManagementPage />} />

            <Route path="circulars" element={<CircularManagementPage />} />
            <Route path="circulars/:id" element={<CircularManagementPage />} />

            <Route path="tenders" element={<TenderManagementPage />} />
            <Route path="tenders/:id" element={<TenderManagementPage />} />

            <Route path="pages" element={<StaticPageManagementPage />} />
            <Route path="pages/edit/:id" element={<StaticPageManagementPage />} />

            <Route path="gallery" element={<GalleryManagementPage />} />
            <Route path="gallery/:id" element={<GalleryManagementPage />} />

            <Route path="authors" element={<AuthorManagementPage />} />
            <Route path="authors/:id" element={<AuthorManagementPage />} />

            <Route path="books" element={<BookManagementPage />} />
            <Route path="books/:id" element={<BookManagementPage />} />

            <Route path="approvals" element={<ContentApprovalPage />} />

            {/* <Route path="subscription/setting" element={<SubscriptionSettingPage />} /> */}
            <Route path="carousel" element={<CarouselManagementPage />} />
            <Route path="youtube" element={<SrlmYoutubeAdmin />} />
            <Route path="managempsrlm" element={<ManageMpsrlm />} />
            <Route path="leaders" element={<LeadersAdmin />} />
            <Route path="advertisement" element={<AdvertisementManagementPage />} />

            <Route path="cmtc-gallery" element={<CmtcGalleryAdminPage />} />

          </Route>

          {/* ===== PORTAL_ADMIN ONLY ROUTES ===== */}
          <Route path="/admin/*" element={<PrivateRoute requiredRoles={['PORTAL_ADMIN']} />}>
            {/* Dashboard - ONLY for PORTAL_ADMIN */}
            <Route path="admin_dashboard" element={<AdminDashboardPage />} />
            <Route path="bookings/:type" element={<TotalBookings />} />
            <Route path="mis_report" element={<MisReport />} />
            <Route path="mis_internal_booking" element={<MisInternalBooking />} />
            <Route path="mis_all_booking" element={<MisAllBookings />} />
           

            {/* Subscriptions, Services, etc - ONLY for PORTAL_ADMIN */}
            {/* <Route path="subscriptions" element={<SubscriptionManagementPage />} /> */}
            {/* <Route path="subscriptions/add" element={<AddSubscriptionPage />} /> */}
            {/* <Route path="services" element={<ManageServicesPage />} /> */}
            <Route path="contact-messages" element={<ContactMessagesPage />} />
            
            <Route path="feedback" element={<FeedbackManagementPage />} />
            <Route path="rti-documents" element={<RtiDocumentManagementPage />} />

            <Route path="advertisement-Section" element={<AdvertisementSectionMgmtPage />} />
            <Route path="advertisement-Section/:id" element={<AdvertisementSectionMgmtPage />} />

            <Route path="printing-Section" element={<PrintingSectionMgmtPage />} />
            <Route path="printing/:id" element={<PrintingSectionMgmtPage />} />

            <Route path="films" element={<FilmManagementPage />} />
            <Route path="film/edit/:id" element={<FilmManagementPage />} />

            <Route path="projects" element={<ProjectManagementPage />} />
            <Route path="project/edit/:id" element={<ProjectManagementPage />} />

            <Route path="events" element={<EventManagementPage />} />
            <Route path="event/edit/:id" element={<EventManagementPage />} />

            <Route path="action-plan" element={<ActionPlanManagementPage />} />
            <Route path="action-plan/edit/:id" element={<ActionPlanManagementPage />} />
            


          </Route>

          {/* ===== ALL ADMIN ROLES - User Management Only ===== */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute
                requiredRoles={[
                  'PORTAL_ADMIN',
                  'ZONAL_HEAD',
                  'DISTRICT_OFFICER',
                  'BLOCK_OFFICER',
                  'CMTC_MANAGER'
                ]}
              />
            }
          >
            {/* User Management - Available to all admin roles */}
            <Route path="users" element={<UserManagementPage />} />
            <Route path="users/:id" element={<UserManagementPage />} />
            <Route path="officer_dashboard" element={<Officerdashboard />} />
            <Route path="cmtc-events" element={<CmtcEventsManagementPage />} />
            <Route path="cmtc-events/:id" element={<CmtcEventsManagementPage />} />
            <Route path="center-list" element={<InternalCmtcCenterList />} />

          </Route>

          <Route path="/officer/*" element={<PrivateRoute requiredRoles={['BLOCK_OFFICER', 'DISTRICT_OFFICER',USER_ROLES.MISSION_STAFF,USER_ROLES.AUDIT_ACCOUNTANT,USER_ROLES.AUDITOR]} />}>
            <Route path="officer_dashboard" element={<Officerdashboard />} />
             {/* grading and audit routes */}
            <Route path="grading-page" element={<GradingWorkspace/>} />
            <Route path="audit-page" element={<AuditWorkspace/>} /> 
            <Route path="grading" element={<GradingWorkspace />} />
             <Route path="financial-form" element={<FinancialForm />} /> 
             <Route path="my-bookings" element={<UserDashboardPage />} />         
          </Route>

          {/* GOV_DEPARTMENT - User Dashboard */}
          <Route path="/user/*" element={<PrivateRoute requiredRoles={['GOV_DEPARTMENT']} />}>
            <Route path="dashboard" element={<UserDashboardPage />} />
          </Route>


          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/error" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

// Wrap with Auth
function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />

      {/* <BrowserRouter > */}
     <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <AppContent />

        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;