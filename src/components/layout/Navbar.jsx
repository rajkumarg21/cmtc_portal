
import React from 'react'
import { useState, useEffect } from "react";
import {Button} from 'react-bootstrap'
import Headbar from './Headbar.jsx'
import {Link} from 'react-router-dom'
import { useTranslation } from "react-i18next";
function Navbar() {
   
  const { t,i18n } = useTranslation();
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("appLanguage", lng);
  };

  /* Display current time functionality*/
const [dateTime, setDateTime] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let formatted = now.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true
      });
      // Remove the extra comma before the time
      formatted = formatted.replace(",", "");
      setDateTime(formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

/* Increase size button functionality*/
  const increaseFontSize = () => {
  const currentSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize);

  const newSize = Math.min(currentSize + 1, 20); // max limit
  document.documentElement.style.fontSize = `${newSize}px`;

  localStorage.setItem("fontSize", newSize);
};
useEffect(() => {
  const savedSize = localStorage.getItem("fontSize");
  if (savedSize) {
    document.documentElement.style.fontSize = `${savedSize}px`;
  }
}, []);

/* Reset size button functionality*/
const resetFontSize = () => {
  const defaultSize = 16; // browser default
  document.documentElement.style.fontSize = `${defaultSize}px`;
  localStorage.removeItem("fontSize");
};

/* Decrease size button functionality*/
const decreaseFontSize = () => {
  const currentSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize);

  const newSize = Math.max(currentSize - 1, 12); // min limit
  document.documentElement.style.fontSize = `${newSize}px`;

  localStorage.setItem("fontSize", newSize);
};

  return (
    <>
 <nav className="navbar navbar-expand-lg text-white bg-dark p-0 small-navbar">

    <div className="container-fluid">
         {/* nav-text*/}
        <p className=" text-white" style={{fontSize:"12px"}}><i className="bi bi-alarm"></i> {dateTime}</p>
    
     <ul className="navbar-nav flex-row flex-wrap align-items-center ms-auto">

        {/* nav-links*/}
        <li className="nav-item border-end">
        <Link className="btn btn-link text-decoration-none text-white  rounded-0 btn-small"
        style={{fontSize:"12px"}} to="/">
         {t("home")}
        </Link>
        </li>

        {/* Bank Portal Dropdown */}
       
       
      {/* nav-Buttons*/}
      <li className="nav-item dropdown">
          <button
            className="btn btn-light text-dark m-1 rounded-1 btn-sm dropdown-toggle"
            style={{ fontSize: "10px" }}
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={handleOpen}
          >
          {t("language")}
          </button>

          <ul className="dropdown-menu" onClose={handleClose}>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleLanguageChange("en")}
              >
                English
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleLanguageChange("hi")}
              >
                हिन्दी
              </button>
            </li>
          </ul>
        </li> 
        <li className="nav-item">
          <Button className="btn btn-light text-dark m-1 rounded-1 btn btn-sm" style={{fontSize:"10px"}}  onClick={decreaseFontSize}>{t("A")}-</Button>
        </li>
        <li className="nav-item">
          <Button className="btn btn-light text-dark m-1 rounded-1 btn btn-sm" style={{fontSize:"10px"}} onClick={resetFontSize}>{t("A")}</Button>
        </li>
        <li className="nav-item">
          <Button className="btn btn-light text-dark m-1 rounded-1 btn btn-sm" style={{fontSize:"10px"}} onClick={increaseFontSize}>{t("A")}+</Button>
        </li>
      </ul> 
  </div>
</nav>
<Headbar />
    </>
  )
}
export default Navbar
