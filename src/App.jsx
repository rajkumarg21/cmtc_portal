// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import Home from './components/homeSection/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import NewsManagementPage from './pages/cms/NewsManagementPage';
import NewsListPage from './pages/public/NewsListPage';
import NewsDetailPage from './pages/public/NewsDetailPage'
import LoginPage from './pages/auth/LoginPage';
//import SignupPage from './pages/auth/SignUp';
import CMSDashboardPage from './pages/cms/CMSDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import './i18n';
import { useTranslation } from 'react-i18next';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';


function AppContent() {
  const { isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  // Redirect after login/logout if needed
  useEffect(() => {
    document.title = t('siteTitle');
  }, [i18n.language, t]);

  if (authLoading) {
    return <LoadingSpinner />;
  }
  // const showSidebar = isAuthenticated && (userRole === 'PORTAL_ADMIN' || userRole === 'EDITOR' || userRole === 'PUBLISHER');
  console.log("App rendered");

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="/news" element={<NewsListPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/error" element={<NotFoundPage />} />

           {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/Signup" element={<SignupPage />} /> */}
        </Route>

        {/* CMS Private Routes */}
          <Route path="/cms/*" element={<PrivateRoute requiredRoles={['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN']} />}>
            <Route path="dashboard" element={<CMSDashboardPage />} />

            <Route path="news" element={<NewsManagementPage />} />
            <Route path="news/:id" element={<NewsManagementPage />} />

            {/* <Route path="circulars" element={<CircularManagementPage />} />
            <Route path="circulars/:id" element={<CircularManagementPage />} />

            <Route path="tenders" element={<TenderManagementPage />} />
            <Route path="tenders/:id" element={<TenderManagementPage />} /> */}

            {/* <Route path="pages" element={<StaticPageManagementPage />} />
            <Route path="pages/edit/:id" element={<StaticPageManagementPage />} />

            <Route path="gallery" element={<GalleryManagementPage />} />
            <Route path="gallery/:id" element={<GalleryManagementPage />} />

            <Route path="approvals" element={<ContentApprovalPage />} />
            <Route path="books" element={<BookManagementPage />} />
            <Route path="books/:id" element={<BookManagementPage />} />

            <Route path="authors" element={<AuthorManagementPage />} />
            <Route path="authors/:id" element={<AuthorManagementPage />} />

            <Route path="subscription/setting" element={<SubscriptionSettingPage />} />


            <Route path="samyiki" element={<SamyikiManagementPage />} />
            <Route path="samyiki/:id" element={<SamyikiManagementPage />} />

            <Route path="carousel" element={<CarouselManagementPage />} />
            <Route path="advertisement" element={<AdvertisementManagementPage />} />

            <Route path="advertisement-Section" element={<AdvertisementSectionMgmtPage />} />
            <Route path="advertisement-Section/:id" element={<AdvertisementSectionMgmtPage />} />

            <Route path="printing-Section" element={<PrintingSectionMgmtPage />} />
            <Route path="printing/:id" element={<PrintingSectionMgmtPage />} />

            <Route path="films" element={<FilmManagementPage />} />
            <Route path="film/edit/:id" element={<FilmManagementPage />} />

            <Route path="projects" element={<ProjectManagementPage />} />
            <Route path="project/edit/:id" element={<ProjectManagementPage />} />

            <Route path="events" element={<EventManagementPage />} />
            <Route path="event/edit/:id" element={<EventManagementPage />} /> */}
            {/* <Route path="youtube" element={<SrlmYoutubeAdmin />} />
            <Route path="leaders" element={<LeadersAdmin />} />
            <Route path="managempsrlm" element={<ManageMpsrlm />} /> */}
          </Route>

          <Route path="/admin/*" element={<PrivateRoute requiredRoles={['PORTAL_ADMIN']} />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            </Route>
      </Routes>
    </div>
  );
}

// Wrap AppContent with AuthProvider
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;