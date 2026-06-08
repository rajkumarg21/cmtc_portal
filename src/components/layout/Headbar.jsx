import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useAuth } from '../../context/AuthContext';
import './Headbar.css'; // make sure to import the CSS
import { IMAGE_URL } from '../../utils/constants';

function Headbar() {
  const { t } = useTranslation();
  const { isAuthenticated, logout, userRole ,user} = useAuth();
  const navigate = useNavigate();

  // const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const officerDashboardLinks = [
    { label: t('sidebar.dashboard'), path: '/officer/officer_dashboard' },
  ];

  const userDashboardLinks = [
    { label: t('userDashboard'), path: '/user/dashboard' },
  ];

  const dashboardLinksToShow =
    userRole === 'GOV_DEPARTMENT' ? userDashboardLinks : officerDashboardLinks;
const closeMenu = () => {
  setMenuOpen(false);
};
  return (
    <>
      {/* Second header */}
      <div className="second-header bg-light">
        <div className="container-fluid">
          <div className="row py-2 align-items-center d-flex flex-nowrap">
            <div className="col-auto d-flex align-items-center gap-2">

              <img width={35} src={`${IMAGE_URL}/images/emblem.png`} className="img-fluid header_logo" alt="india-emblem" id="india_emblem" />
                  <img width={90} src={`${IMAGE_URL}/images/makeindialogo.png`} className="img-fluid header_logo" alt="make-in-india-logo" id="MIIlogo" />
              <img width={50} src={`${IMAGE_URL}/images/mplogo.png`} className="img-fluid header_logo" alt="mp-logo" id="MPlogo" />
           
            </div>
            <div className="col text-center px-1">
              <h5 className="header_text fw-bold mx-auto" style={{ color: "#0f766e" }}>
                {t("MPSRLM")}
              </h5>
              <h5 className="header_text mx-auto">
                {t("PRDDMP")}
              </h5>
            </div>

            <div className="col-auto text-end d-flex align-items-center gap-2">
                 <img width={50} src={`${IMAGE_URL}/images/cmtclogo.png`} className="img-fluid header_logo" alt="india-emblem" id="firtslogo" />
           
              <img width={90} src={`${IMAGE_URL}/images/AAJEEVIKALOGO.png`} className="img-fluid header_logo" alt="make-in-india-logo" id="MIIlogo" />
            </div>
          </div>
        </div>
      </div>

      {/* Third header */}
      <nav className="navbar py-1" id="Navbuttons">
        <div className="container-fluid">
          {/* Left: Hamburger */}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* Center / Left: Menu Links */}
          <ul  className={`nav-links list-unstyled mb-0 d-flex flex-column flex-lg-row 
            ${menuOpen ? "d-flex" : "d-none"} d-lg-flex`} >
            <li className="border-end px-2 text-sm">
              <Link to="/" onClick={closeMenu}>
                <strong>{t("home")}</strong>
              </Link>
            </li>

            <li className="border-end px-2 text-sm">
              <Link to="/Aboutus" onClick={closeMenu}>
                <strong>{t("aboutUs")}</strong>
              </Link>
            </li>

            <li className="border-end px-2 text-sm">
              <Link to="/Organization-structure" onClick={closeMenu}>
                <strong>{t("OrganizationStructure")}</strong>
              </Link>
            </li>

            <li className="border-end px-2 text-sm">
              <Link to="/HumanParliament" onClick={closeMenu}>
                <strong>{t("HumanResource")}</strong>
              </Link>
            </li>

            {isAuthenticated &&
              (userRole === 'GOV_DEPARTMENT' ||
                userRole === 'BLOCK_OFFICER' ||
                userRole === 'DISTRICT_OFFICER') &&
              dashboardLinksToShow.map((item) => (
                <li className="border-end px-2 text-sm" key={item.path}>
                  <Link to={item.path} onClick={closeMenu}>
                    <strong>{item.label}</strong>
                  </Link>
                </li>
              ))}
          </ul>

          <div className="auth-section">
            {!isAuthenticated ? (
               <>
              <Link className="btn-login text-white text-sm" to="/login">
              <strong>{t("login")}</strong>
              </Link>
              <span className="text-white mx-2">|</span>
              <Link className="btn-signup text-white text-sm" to="/signup">
                <strong>{t("Signup")}</strong>
              </Link>
              <span className="text-white mx-2">|</span>
              <Link className="text-sm" to="/lsb/login" style={{ color: "#fbbf24", textDecoration: "none" }}>
                <strong>Bank Portal</strong>
              </Link>
               </>
             
            ) : (
              <div className="dropdown">
              
                <button
                  className="btn-login dropdown-toggle d-flex align-items-center justify-content-center p-1"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={`${IMAGE_URL}/images/userlogo.png`}
                    alt="user-logo"
                    className="header_user_logo"
                  />
                  <p className="fw-bold text-white px-2">{user?.username || user?.fullName || 'User'}</p>
                </button>

                <ul className="dropdown-menu dropdown-menu-end mt-2">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      {t("profile")}
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <button
                      className="dropdown-item text-danger fw-bold"
                      onClick={handleLogout}
                    >
                      {t("logout")}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Headbar;
