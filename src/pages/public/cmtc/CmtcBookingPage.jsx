// CmtcBookingPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/apiService";
import swal from "sweetalert";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { isLoggedIn } from "../../../context/AuthContext.jsx";
import "./CmtcBookingPage.css";
import {
  confirmBooking,
  getAllDistricts,
  getBlocksByDistrict,
  getMonthlyCalendar,
  getCenterAmenities,
  normalizeAmenitiesSimple, // ✅ IMPORTANT: same normalizer as details page
} from "../../../services/cmtcCenterService.js";

import "../../../components/sections/cmtcStyle.css";
import { getCenterDetails } from "../../../services/cmtcCenterService.js";
import { useTranslation } from "react-i18next";
import { USER_ROLES } from "../../../utils/constants.js";

function CmtcBookingPage() {
  const { centerId } = useParams();
  const [selectedCalendarIds, setSelectedCalendarIds] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [blockList, setBlockList] = useState([]);
  const [districtsLoaded, setDistrictsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState({ centerId: centerId });
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [amount, setamount] = useState(0);
  const calendarRef = useRef(null);
  const dateSourceRef = useRef(null);
  const { isAuthenticated, user, userRole } = useAuth();
  const { i18n, t } = useTranslation();
  const isHindi = i18n.language;

  // ✅ NEW: keep center details for capacity + centerType based training options
  const [centerDetails, setCenterDetails] = useState(null);

  const isInternal = userRole === USER_ROLES.BLOCK_OFFICER || userRole === USER_ROLES.DISTRICT_OFFICER;

  // ✅ FIX: Initialize formData with empty strings instead of null
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    designation: "",
    organisation: "",
    cmtcName: "",
    trainingType: "",
    fromDate: "",
    toDate: "",
    district: "",
    block: "",
    participants: "",
    facilities: [],
    otherAmenitiesEnabled: false, //newly added
    otherAmenitiesText: "", //newlly added
    otherAmenitiesList: [],
    letterFile: null,
    amount: 0,
  });

  // ✅ NEW STATE: Amenities from database
  const [centerAmenities, setCenterAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  // ✅ NEW: grouped amenities (same idea as details page)
  const [groupedAmenities, setGroupedAmenities] = useState({});

  const navigate = useNavigate();

  // -------------------------
  // Helpers (safe accessors)
  // -------------------------
  const toNum = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const getCenterType = (c) => {
    const ct = (c?.centerType || "").toString().toLowerCase();
    // handle possible values: "Residential", "NonResidential", "Non-Residential", "Both"
    if (ct.includes("both")) return "Both";
    if (ct.includes("non")) return "NonResidential";
    if (ct.includes("res")) return "Residential";
    return ""; // unknown
  };

  const getCapacityByTrainingType = (c, trainingTypeText) => {
    // DB columns in your table: residential_capacity, non_residential_capacity
    // API might return: residentialCapacity / nonResidentialCapacity OR resCapacity/nonResCapacity OR res_capacity/non_res_capacity
    const resCap =
      toNum(c?.residentialCapacity) ??
      toNum(c?.resCapacity) ??
      toNum(c?.residential_capacity) ??
      toNum(c?.res_capacity);

    const nonResCap =
      toNum(c?.nonResidentialCapacity) ??
      toNum(c?.nonResCapacity) ??
      toNum(c?.non_residential_capacity) ??
      toNum(c?.non_res_capacity);

    if (
      (trainingTypeText || "").toLowerCase().includes("residential") &&
      !(trainingTypeText || "").toLowerCase().includes("non")
    ) {
      return resCap;
    }
    // Non-Residential
    return nonResCap;
  };

  // User details name and mobile number
  const fetchUser = async () => {
    try {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user?.fullName || "",
        mobile: prev.mobile || user.mobileNo || "",
        designation: prev?.designation || user.departmentUser?.designation || user?.originalDesignation,
        organisation: prev.organizationName || user.organizationName,
      }));
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  // Call fetch user when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const price = calculateamount();

    setamount(price);

    setFormData((prev) => ({
      ...prev,
      amount: price,
    }));
  }, [
    selectedDates,
    formData.trainingType,
    formData.participants,
    formData.otherAmenitiesList,
    centerDetails,
  ]);

  const calculateamount = () => {
    if (!centerDetails) return 0;

    const days = selectedDates.length;
    const participants = Number(formData.participants || 0);

    if (days === 0 || participants === 0 || !formData.trainingType) {
      return 0;
    }

    const pricePerDayPerPerson = getPrice(formData.trainingType);

    const baseAmount = days * participants * pricePerDayPerPerson;

    return baseAmount;
  };

  // ✅ Fetch center amenities from database (use SAME normalization as details page)
  const fetchCenterAmenities = async (cId) => {
    try {
      setLoadingAmenities(true);

      const rawAmenitiesData = await getCenterAmenities(cId);

      // ✅ normalize exactly like details page
      const normalizedAmenities = normalizeAmenitiesSimple(
        rawAmenitiesData || [],
      );

      setCenterAmenities(normalizedAmenities);

      // ✅ group by amenityTypeName (dynamic: Training Facilities, Furniture, Utilities & Facilities, etc.)
      const grouped = {};
      normalizedAmenities.forEach((item) => {
        const typeName = item.amenityTypeName || "Other Facilities";
        const colorCode = item.amenityTypeColor || "#95a5a6";
        if (!grouped[typeName]) {
          grouped[typeName] = {
            name: typeName,
            color: colorCode,
            amenities: [],
          };
        }
        grouped[typeName].amenities.push({
          id: item.id,
          amenityName: item.amenityName || "Facility",
          amenityCode: item.amenityCode || "N/A",
          description: item.description || "",
          quantity: item.quantity || 1,
          notes: item.notes || "",
          subAmenities: item.subAmenities || [],
          amenityTypeName: typeName,
          amenityTypeColor: colorCode,
        });
      });

      setGroupedAmenities(grouped);
    } catch (error) {
      console.error("Failed to load amenities:", error);
      setCenterAmenities([]);
      setGroupedAmenities({});
    } finally {
      setLoadingAmenities(false);
    }
  };

  // AUTO-FILL CMTC NAME, DISTRICT & BLOCK FROM CENTER
  useEffect(() => {
    if (!centerId || !districtsLoaded) return;

    const loadCenterDetails = async () => {
      try {
        const res = await getCenterDetails(centerId);
        const center = res.data;

        // ✅ store full center details for capacity + centerType logic
        setCenterDetails(center);

        // ✅ FIX: Check if districtId is valid before using it
        const hasValidDistrict =
          center.districtId &&
          center.districtId !== "null" &&
          center.districtId !== "undefined" &&
          center.districtId !== null &&
          center.districtId !== undefined;

        // ✅ determine allowed training types based on centerType coming from DB
        const cType = getCenterType(center);
        let defaultTrainingType = "";
        if (cType === "Residential") defaultTrainingType = "Residential";
        if (cType === "NonResidential") defaultTrainingType = "Non-Residential";
        // Both -> keep blank so user selects

        setFormData((prev) => ({
          ...prev,
          cmtcName: center.centerName || center.name || "",
          district: hasValidDistrict ? String(center.districtId) : "",
          block: "",
          // ✅ if centerType is only one, auto set trainingType (do not override if already selected)
          trainingType: prev.trainingType || defaultTrainingType,
        }));

        // ✅ Load amenities for this center
        fetchCenterAmenities(centerId);

        // ✅ FIX: Only load blocks if we have a valid districtId
        if (hasValidDistrict) {
          setTimeout(async () => {
            try {
              const blockRes = await getBlocksByDistrict(center.districtId);
              const blocks = Array.isArray(blockRes.data) ? blockRes.data : [];

              setBlockList(blocks);

              // Check if block exists and is valid
              const hasValidBlock =
                center.blockId &&
                center.blockId !== "null" &&
                center.blockId !== "undefined";

              if (hasValidBlock) {
                const exists = blocks.find((b) => b.blockId === center.blockId);
                if (exists) {
                  setFormData((prev) => ({
                    ...prev,
                    block: String(center.blockId),
                  }));
                }
              }
            } catch (err) {
              console.error("Block load failed", err);
              setBlockList([]);
            }
          }, 300);
        } else {
          console.warn("⚠️ Center has no districtId, skipping block load");
          setBlockList([]);
        }

        // Set centerId for calendar
        if (center.centerId) {
          setCalendarStatus((prev) => ({
            ...prev,
            centerId: center.centerId,
          }));
        }
      } catch (err) {
        console.error("Failed to load center details", err);
      }
    };

    loadCenterDetails();
  }, [centerId, districtsLoaded]);

  const getPrice = (cType) => {
    if (cType === "Residential") return centerDetails.resPrice;
    if (cType === "NonResidential" || cType === "Non-Residential")
      return centerDetails.nonResPrice;
  };

  // UPDATE FIELD

  const updateField = (field, value) => {
    // mark manual date input source
    if (field === "fromDate" || field === "toDate") {
      dateSourceRef.current = "manual";
    }
    //  handle boolean for isInternal
    if (field === "isInternal") {
      setFormData((prev) => ({ ...prev, isInternal: value === true }));
      return;
    }
    // ✅ keep File object as-is (DO NOT Stringify)
    if (field === "letterFile") {
      setFormData((prev) => ({ ...prev, letterFile: value || null }));
      return;
    }

    // district special handling
    if (field === "district") {
      setBlockList([]);
      const districtValue = value ? String(value) : "";

      setFormData((prev) => ({
        ...prev,
        district: districtValue,
        block: "",
      }));

      if (districtValue && districtValue.trim() !== "") {
        loadBlocks(districtValue);
      } else {
        setBlockList([]);
      }
      return;
    }

    // block special handling
    if (field === "block") {
      const blockValue = value ? String(value) : "";
      setFormData((prev) => ({ ...prev, block: blockValue }));
      return;
    }

    // ✅ keep array as-is
    if (field === "facilities") {
      setFormData((prev) => ({
        ...prev,
        facilities: Array.isArray(value) ? value : [],
      }));
      return;
    }

    // default string
    const fieldValue =
      value !== null && value !== undefined ? String(value) : "";
    setFormData((prev) => ({ ...prev, [field]: fieldValue }));
  };

  useEffect(() => {
    if (dateSourceRef.current === "manual") {
      processDateRange(formData.fromDate, formData.toDate);
    }
  }, [formData.fromDate, formData.toDate]);

  // LOAD DISTRICTS
  const loadDistricts = async () => {
    try {
      const res = await getAllDistricts();
      setDistrictList(Array.isArray(res.data) ? res.data : []);
      setDistrictsLoaded(true);
    } catch (err) {
      console.error("Failed to load districts", err);
    }
  };

  // LOAD BLOCKS ON DISTRICT CHANGE
  const loadBlocks = async (districtId) => {
    if (
      !districtId ||
      districtId === "null" ||
      districtId === "undefined" ||
      districtId === ""
    ) {
      console.warn("Invalid districtId provided for block load:", districtId);
      setBlockList([]);
      return;
    }

    try {
      const res = await getBlocksByDistrict(districtId);
      setBlockList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load blocks", err);
      setBlockList([]);
    }
  };

  // GET ALL DATES IN RANGE
  const getDatesInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];

    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // ➕ Add new row
  const addAmenityRow = () => {
    setFormData((prev) => ({
      ...prev,
      otherAmenitiesList: [
        ...prev.otherAmenitiesList,
        { name: "", quantity: 1, maxPrice: 0, remark: "" },
      ],
    }));
  };

  // ✏️ Update row field
  const updateAmenity = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      otherAmenitiesList: prev.otherAmenitiesList.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  // ❌ Remove row
  const removeAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      otherAmenitiesList: prev.otherAmenitiesList.filter((_, i) => i !== index),
    }));
  };

  // VALIDATE DATE RANGE FROM INPUT FIELDS
  const validateDateRangeFromInputs = (startDate, endDate) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().unselect();
    }

    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      swal({
        text: "Start date cannot be after end date",
        icon: "warning",
      });
      setFormData((prev) => ({ ...prev, fromDate: "", toDate: "" }));
      setSelectedCalendarIds([]);
      setSelectedDates([]);
      return;
    }

    const datesInRange = getDatesInRange(startDate, endDate);
    const availableDates = [];
    const unavailableDates = [];

    datesInRange.forEach((date) => {
      const event = eventMap.get(date);
      if (event) {
        if (event.title === "AVAILABLE") {
          availableDates.push({
            date: date,
            calendarId: event.calendarId,
          });
        } else {
          unavailableDates.push({
            date: date,
            status: event.title,
          });
        }
      } else {
        unavailableDates.push({
          date: date,
          status: "NOT_FOUND",
        });
      }
    });

    if (availableDates.length === 0) {
      swal({
          text: "No available dates in selected range",
          icon: "error",
        });
      setSelectedCalendarIds([]);
      setSelectedDates([]);
      return;
    }

    if (unavailableDates.length > 0) {
      const unavailableMessage = unavailableDates
        .map(
          (ud) =>
            `${ud.date} (${
              ud.status === "BOOKED"
                ? "Already Booked"
                : ud.status === "RESERVED"
                  ? "Reserved"
                  : ud.status === "CLOSED"
                    ? "Closed/Past Date"
                    : "Not Available"
            })`,
        )
        .join(", ");
      swal({
        title: "Warning",
        text: ` ${unavailableDates.length} date(s) in your range are not available:\n${unavailableMessage}\n\nOnly ${availableDates.length} available date(s) will be booked.`,
        icon: "warning",
      });
    }

    const ids = availableDates.map((d) => d.calendarId);
    const dateStrings = availableDates.map((d) => d.date);

    setSelectedCalendarIds(ids);
    setSelectedDates(dateStrings);
    swal({
      text: `Selected ${availableDates.length}available date(s) from ${startDate} to ${endDate}`,
      icon: "success",
    });
  };

  // HANDLE DATE RANGE SELECT (from calendar drag)
  const handleDateRangeSelect = (info) => {
    dateSourceRef.current = "calendar";

    const start = info.startStr;
    const endDateObj = new Date(info.endStr);
    endDateObj.setDate(endDateObj.getDate() - 1);
    const end = endDateObj.toISOString().split("T")[0];

    const datesInRange = getDatesInRange(start, end);
    const availableDates = [];
    const unavailableDates = [];

    datesInRange.forEach((date) => {
      const event = eventMap.get(date);
      if (event) {
        if (event.title === "AVAILABLE") {
          availableDates.push({
            date: date,
            calendarId: event.calendarId,
          });
        } else {
          unavailableDates.push({
            date: date,
            status: event.title,
          });
        }
      }
    });

    if (availableDates.length === 0) {
      swal({
        text: "No available dates in selected range",
        icon: "warning",
      });
      return;
    }

    if (unavailableDates.length > 0) {
      const unavailableMessage = unavailableDates
        .map(
          (ud) =>
            `${ud.date} (${
              ud.status === "BOOKED"
                ? "Already Booked"
                : ud.status === "RESERVED"
                  ? "Reserved"
                  : ud.status === "CLOSED"
                    ? "Closed/Past Date"
                    : "Not Available"
            })`,
        )
        .join(", ");
      swal({
        text: `${unavailableDates.length} date(s) in your range are not available:\n${unavailableMessage}\n\nOnly ${availableDates.length} available date(s) will be booked.`,
        icon: "warning",
      });
    }

    const ids = availableDates.map((d) => d.calendarId);
    const dateStrings = availableDates.map((d) => d.date);

    setSelectedCalendarIds(ids);
    setSelectedDates(dateStrings);
    setFormData((prev) => ({
      ...prev,
      fromDate: start,
      toDate: end,
    }));

    swal({
      text: `Selected ${availableDates.length} available date(s)`,
      icon: "success",
    });
  };

  const handleMonthChange = async (info) => {
    setCalendarEvents([]);
    const months = getMonthsBetween(info.start, info.end);

    const allEvents = [];

    for (const month of months) {
      try {
        const res = await getMonthlyCalendar(calendarStatus.centerId, month);
        if (Array.isArray(res.data)) {
          allEvents.push(...res.data);
        }
      } catch (e) {
        console.error("Calendar fetch failed for", month);
      }
    }

    const uniqueMap = new Map();
    allEvents.forEach((item) => {
      uniqueMap.set(item.date, item);
    });

    const today = new Date().toISOString().split("T")[0];

    const events = Array.from(uniqueMap.values()).map((item) => {
      let status = item.status || "AVAILABLE";

      if (item.date < today) status = "CLOSED";

      return {
        title: status,
        date: item.date,
        calendarId: item.calendarId || null,
        backgroundColor:
          status === "AVAILABLE"
            ? "#28a745"
            : status === "BOOKED"
              ? "#dc3545"
              : status === "RESERVED"
                ? "#ffcc00"
                : "#bdbdbd",
        extendedProps: {
          calendarId: item.calendarId,
          isAvailable: status === "AVAILABLE",
        },
      };
    });

    setCalendarEvents(events);
  };

  const getMonthsBetween = (start, end) => {
    const months = [];
    const date = new Date(start);

    date.setDate(1);

    while (date < end) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      months.push(`${year}-${month}`);
      date.setMonth(date.getMonth() + 1);
    }

    return months;
  };

  // ON DATE CLICK (single date selection)
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    const calendarApi = calendarRef.current.getApi();

    if (!rangeStart) {
      setRangeStart(clickedDate);
      setRangeEnd(null);

      setFormData((prev) => ({
        ...prev,
        fromDate: clickedDate,
        toDate: "",
      }));

      calendarApi.unselect();
      return;
    }

    if (rangeStart && !rangeEnd) {
      let start = rangeStart;
      let end = clickedDate;

      if (new Date(end) < new Date(start)) {
        [start, end] = [end, start];
      }

      setRangeStart(start);
      setRangeEnd(end);

      setFormData((prev) => ({
        ...prev,
        fromDate: start,
        toDate: end,
      }));

      const endExclusive = new Date(end);
      endExclusive.setDate(endExclusive.getDate() + 1);
      calendarApi.select(start, endExclusive.toISOString().split("T")[0]);
      return;
    }

    if (rangeStart && rangeEnd) {
      let start = rangeStart;
      let end = clickedDate;

      if (new Date(clickedDate) < new Date(start)) {
        start = clickedDate;
      }

      setRangeStart(start);
      setRangeEnd(end);

      processDateRange(start, end);
    }
  };

  // MAP TRAINING TYPE TO ID
  const getTrainingTypeId = (type) => {
    if (type === "Residential") return 1;
    if (type === "Non-Residential") return 2;
    if (type === "Workshop") return 3;
    if (type === "Meeting / Review") return 4;
    return null;
  };

  // ✅ CenterType based allowed training types
  const getAllowedTrainingTypes = () => {
    // const cType = getCenterType(centerDetails);
    // if (cType === "Residential") return ["Residential"];
    // if (cType === "NonResidential") return ["Non-Residential"];
    // if (cType === "Both") return ["Residential", "Non-Residential"];
    // // fallback (unknown)
    return ["Residential", "Non-Residential"];
  };

  const translatedTrainingTypes = {
    Residential: "आवासीय",
    "Non-Residential": "गैर-आवासीय",
  };

  // VALIDATE FORM
  const validateForm = () => {
    if (!formData.letterFile) {
        swal({
        text: "booking approval letter is required",
        icon: "warning",
      });
      return;
    }
    if (selectedCalendarIds.length === 0) {
       swal({
        text: "Please select date(s) from calendar or enter dates manually",
        icon: "warning",
      });
      return false;
    }

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      swal({
        text: "Please enter a valid full name",
        icon: "warning",
      });
      return false;
    }

    if (!formData.mobile || !/^[0-9]{10}$/.test(formData.mobile)) {
       swal({
        text: "Please enter a valid 10-digit mobile number",
        icon: "warning",
      });
      return false;
    }

    if (!formData.organisation || formData.organisation.trim().length < 2) {
       swal({
        text: "Please enter organization name",
        icon: "warning",
      });
      return false;
    }

    if (!formData.trainingType) {
       swal({
        text: "Please select training type",
        icon: "warning",
      });
      return false;
    }

    // ✅ NEW: training type must be allowed by centerType
    const allowed = getAllowedTrainingTypes();
    if (!allowed.includes(formData.trainingType)) {
       swal({
        text: `This center does not allow "${formData.trainingType}" booking.`,
        icon: "warning",
      });
      return false;
    }

    if (
      !formData.participants ||
      Number(formData.participants) < 1 ||
      Number(formData.participants) > 9999
    ) {
       swal({
        text: "Please enter number of participants between 1 and 9999",
        icon: "warning",
      });
      return false;
    }

    // ✅ NEW: capacity validation against center table
    const cap = getCapacityByTrainingType(centerDetails, formData.trainingType);
    if (cap !== null && Number(formData.participants) > Number(cap)) {
       swal({
        text: `Participants cannot exceed center capacity (${cap}) for ${formData.trainingType}.`,
        icon: "warning",
      });
      return false;
    }

    return true;
  };

  const eventMap = React.useMemo(() => {
    const map = new Map();
    calendarEvents.forEach((e) => map.set(e.date, e));
    return map;
  }, [calendarEvents]);

  // SUBMIT BOOKING
  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();

    // 🔒 LOGIN CHECK
    if (!isLoggedIn()) {
      swal({
        title: "Login Required",
        text: "Please login to confirm your booking. Your booking details will be saved.",
        icon: "info",
        buttons: {
          cancel: "Cancel",
          confirm: {
            text: "Login Now",
            value: true,
          },
        },
      }).then((willLogin) => {
        if (willLogin) {
          sessionStorage.setItem(
            "PENDING_BOOKING_FORM",
            JSON.stringify({
              formData,
              selectedCalendarIds,
              selectedDates,
              calendarStatus,
            }),
          );

          sessionStorage.setItem("BOOK_AFTER_LOGIN", "true");

          navigate("/login");
        }
      });

      return;
    }

    // ✅ existing validation (+ capacity check added)
    if (!validateForm()) return;

    setIsSubmitting(true);

    const trainingTypeId = getTrainingTypeId(formData.trainingType);

    // Prepare payload - include facilities as array of amenity IDs or names
    const payload = {
      centerId: calendarStatus.centerId,
      calendarIds: selectedCalendarIds,
      numberOfTrainees: Number(formData.participants),
      trainingTypeId: trainingTypeId,
      purpose: formData.cmtcName,
      organizationName: formData.organisation,
      residential: trainingTypeId === 1,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      fullName: formData.fullName,
      mobile: formData.mobile,
      isInternal: formData.isInternal ? 1 : 0,
      districtId: formData.district ? Number(formData.district) : null,
      blockId: formData.block ? Number(formData.block) : null,
      cmtcName: formData.cmtcName,
      trainingTypeText: formData.trainingType,

      // ✅ IMPORTANT: keep facilities array (IDs)
      facilities: formData.facilities,
      amount: formData.amount,

      // ✅ keep facilitiesDetails (now using normalized list)
      facilitiesDetails: formData.facilities
        .map((facilityId) => {
          const amenity = centerAmenities.find((a) => a.id === facilityId);
          return amenity
            ? {
                id: amenity.id,
                name: amenity.amenityName,
                code: amenity.amenityCode,
                type: amenity.amenityTypeName,
              }
            : null;
        })
        .filter((f) => f !== null),

      otherAmenitiesList: formData.otherAmenitiesList
        .filter((a) => a.name && a.name.trim() !== "")
        .map((a) => ({
          name: a.name.trim(),
          quantity: Number(a.quantity) || 1,
          maxPrice: a.maxPrice !== "" ? Number(a.maxPrice) : null,
          remark: a.remark?.trim() || null,
        })),
      // ✅ NEW: other amenities (optional)
      otherAmenities: formData.otherAmenitiesEnabled
        ? (formData.otherAmenitiesText || "").trim()
        : "",
      letterUploaded: formData.letterFile instanceof File,
    };

    try {
      const res = await confirmBooking(payload, formData.letterFile);

      if (res.data && res.data.success) {
        swal({
          text: `✅ Booking request Has been Forwarded to Block Incharge for further approval!\nReference: ${
            res.data.bookingRef || "N/A"
          }\nDates Booked: ${selectedDates.length}`,
          icon: "success",
          button: "OK",
        });

        // Reset form
        setFormData({
          fullName: "",
          mobile: "",
          isInternal: false,
          organisation: "",
          cmtcName: "",
          trainingType: "",
          fromDate: "",
          toDate: "",
          district: "",
          block: "",
          participants: "",
          facilities: [],
          otherAmenitiesEnabled: false, // added newlly
          otherAmenitiesText: "", // added newlly
          letterFile: null,
          amount: 0,
        });
        setSelectedCalendarIds([]);
        setSelectedDates([]);
        setSelectedDate("");
        setRangeStart(null);
        setRangeEnd(null);

        if (calendarRef.current) {
          const api = calendarRef.current.getApi();
          api.refetchEvents?.();
        }
      } else {
        swal({
          text: `Booking Failed: ${res.data?.message || "Unknown error"}`,
          icon: "error",
        });
      }
      navigate(`/user/dashboard`);
    } catch (error) {
      console.error("🔥 API Error Details:", error);

      let errorMessage = "Booking failed. Please try again.";

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        console.error("Request setup error:", error.message);
        errorMessage = `Request error: ${error.message}`;
      }

      swal({
        text: `${errorMessage}`,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const pending = sessionStorage.getItem("PENDING_BOOKING_FORM");

    if (!pending) return;

    try {
      const parsed = JSON.parse(pending);

      setFormData(
        parsed.formData || {
          fullName: "",
          mobile: "",
          isInternal: false,
          organisation: "",
          cmtcName: "",
          trainingType: "",
          fromDate: "",
          toDate: "",
          district: "",
          block: "",
          participants: "",
          facilities: [],
          letterFile: null,
        },
      );

      setSelectedCalendarIds(parsed.selectedCalendarIds || []);
      setSelectedDates(parsed.selectedDates || []);
      setCalendarStatus(parsed.calendarStatus || calendarStatus);

      sessionStorage.removeItem("PENDING_BOOKING_FORM");
    } catch (e) {
      console.error("Invalid pending booking data", e);
    }
  }, []);

  // LOAD INITIAL DATA
  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (!rangeStart || !rangeEnd) return;

    const dates = getDatesInRange(rangeStart, rangeEnd);

    const available = dates.filter((date) => {
      const event = eventMap.get(date);
      return event && event.title === "AVAILABLE";
    });

    setSelectedDates(available);

    setSelectedCalendarIds(
      available.map((d) => {
        const e = calendarEvents.find((x) => x.date === d);
        return e?.calendarId;
      }),
    );
  }, [rangeStart, rangeEnd]);

  const processDateRange = (startDate, endDate, showAlert = true) => {
    if (!startDate || !endDate) return;

    if (new Date(startDate) > new Date(endDate)) {
      swal({
        text: "Start date cannot be after end date",
        icon: "warning",
      });
      return;
    }

    const dates = getDatesInRange(startDate, endDate);
    const available = [];
    const unavailable = [];

    dates.forEach((date) => {
      const event = eventMap.get(date);
      if (event?.title === "AVAILABLE") {
        available.push({
          date,
          calendarId: event.calendarId,
        });
      } else {
        unavailable.push({ date, status: event?.title || "NOT_FOUND" });
      }
    });

    if (available.length === 0) {
      swal({
        text: "No available dates in selected range",
        icon: "success",
      });
      return;
    }

    setSelectedDates(available.map((d) => d.date));
    setSelectedCalendarIds(available.map((d) => d.calendarId));

    setFormData((prev) => ({
      ...prev,
      fromDate: startDate,
      toDate: endDate,
    }));

    if (showAlert && unavailable.length) {
      swal({
        text: `${unavailable.length} unavailable date(s) skipped`,
        icon: "success",
      });
    }
  };

  const allowedTrainingTypes = getAllowedTrainingTypes();

  return (
    <>
      <div className="container mt-3">
        {!isAuthenticated && (
          <div className="alert alert-danger text-center fw-bold" role="alert">
            {t("booking.loginRequiredShort")}
          </div>
        )}
        <div className="row">
          {/* LEFT SIDE FORM */}
          <div className="col-lg-7">
            <div className="w-100 rounded-2 shadow mb-2 p-3">
              <h3 className="text-primary mb-3 fw-bold fs-4">
                {t("booking.submitTitle")}
              </h3>
              <form className="row g-2 p-1" onSubmit={handleBookingSubmit}>
                {/* FULL NAME */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    {t("booking.fullName")}
                    <span className="text-danger">*</span>
                  </label>
                  {!isAuthenticated ? (
                    <input
                      type="text"
                      className="form-control border-secondary rounded-2"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder={t("booking.fullNamePlaceholder")}
                      disabled
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control border-secondary rounded-2"
                      required
                      value={formData.fullName}
                      placeholder={t("booking.fullNamePlaceholder")}
                      disabled
                    />
                  )}
                </div>

                {/* MOBILE */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    {t("booking.mobile")}
                    <span className="text-danger">*</span>
                  </label>
                  {!isAuthenticated ? (
                    <input
                      type="tel"
                      className="form-control border-secondary rounded-2"
                      required
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      placeholder={t("booking.mobilePlaceholder")}
                      disabled
                    />
                  ) : (
                    <input
                      type="tel"
                      className="form-control border-secondary rounded-2"
                      required
                      value={formData.mobile}
                      placeholder={t("booking.mobilePlaceholder")}
                      disabled
                      onKeyDown={(e) => {
                        if (
                          !/^[0-9]$/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "Tab",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 10) return;
                        updateField("mobile", value);
                      }}
                    />
                  )}
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-bold">
                    {t("booking.designation")}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary rounded-2"
                    required
                    value={formData.designation}
                    placeholder={t("booking.designation")}
                    disabled
                  />
                </div>

                {/* ✅ NEW FIELD: INTERNAL / EXTERNAL BOOKING */}
                {/* <div className="col-md-12">
                  <label className="form-label fw-bold">
                    Is Internal Booking? <span className="text-danger">*</span>
                  </label>

                  <select
                    className="form-select border-secondary rounded-2"
                    value={formData.isInternal ? "true" : "false"}
                    onChange={(e) =>
                      updateField("isInternal", e.target.value === "true")
                    }
                  >
                    <option value="false">No (External)</option>
                    <option value="true">Yes (Internal)</option>
                  </select>

                  <small className="text-muted">
                    Select "Yes" if booking is from internal department.
                  </small>
                </div> */}

                {/* ORGANISATION */}
                <div className="col-md-12">
                  <label className="form-label fw-bold">
                    {t("booking.organisation")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  {!isAuthenticated ? (
                    <input
                      type="text"
                      className="form-control border-secondary rounded-2"
                      required
                      value={formData.organisation}
                      onChange={(e) =>
                        updateField("organisation", e.target.value)
                      }
                      placeholder={t("booking.organisationPlaceholder")}
                      disabled
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control border-secondary rounded-2"
                      required
                      value={formData.organisation}
                      placeholder={t("booking.organisationPlaceholder")}
                      onKeyDown={(e) => {
                        if (
                          !/^[a-zA-Z ]$/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete" &&
                          e.key !== "ArrowLeft" &&
                          e.key !== "ArrowRight" &&
                          e.key !== "Tab"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const cleanedValue = e.target.value.replace(
                          /[^a-zA-Z ]/g,
                          "",
                        );
                        updateField("organisation", cleanedValue);
                      }}
                      disabled={!isInternal}
                    />
                  )}
                </div>

                {/* CMTC NAME */}
                <div className="col-md-12">
                  <label className="form-label fw-bold">
                    {t("booking.cmtcName")}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-secondary rounded-2"
                    value={formData.cmtcName}
                    disabled
                  />
                </div>

                {/* TRAINING TYPE (restricted by centerType) */}
                <div className="col-12">
                  <label className="form-label fw-bold">
                    {t("booking.trainingType")}
                    <span className="text-danger">*</span>
                  </label>

                  {!isAuthenticated ? (
                    <select
                      className="form-select border-secondary rounded-2"
                      required
                      value={formData.trainingType}
                      onChange={(e) =>
                        updateField("trainingType", e.target.value)
                      }
                      disabled
                    >
                      <option value="">{t("booking.trainingType")}</option>
                      {allowedTrainingTypes.map((opt) => (
                        <option key={opt} value={opt}>
                          {isHindi ? translatedTrainingTypes[opt] : opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="form-select border-secondary rounded-2"
                      required
                      value={formData.trainingType || ""}
                      onChange={(e) =>
                        updateField("trainingType", e.target.value)
                      }
                    >
                      <option value="">{t("booking.trainingType")}</option>
                      {allowedTrainingTypes.map((opt) => (
                        <option key={opt} value={opt}>
                          {isHindi ? translatedTrainingTypes[opt] : opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* ✅ capacity hint */}
                  {formData.trainingType && (
                    <small className="text-muted d-block mt-1">
                      {t("booking.capacityForTrainingType")}
                      {translatedTrainingTypes[formData.trainingType]}:{" "}
                      <strong>
                        {getCapacityByTrainingType(
                          centerDetails,
                          formData.trainingType,
                        ) ?? "N/A"}
                      </strong>
                    </small>
                  )}
                </div>
                {/* PARTICIPANTS */}
                <div className="col-md-12">
                  <label className="form-label fw-bold">
                    {t("booking.participants")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  {!isAuthenticated ? (
                    <input
                      type="number"
                      className="form-control border-secondary rounded-2"
                      required
                      value={formData.participants}
                      onChange={(e) =>
                        updateField("participants", e.target.value)
                      }
                      disabled
                    />
                  ) : (
                    <input
                      type="number"
                      className="form-control border-secondary rounded-2"
                      required
                      min="1"
                      max="9999"
                      value={formData.participants}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "") {
                          updateField("participants", "");
                          return;
                        }
                        const num = Number(value);
                        if (num < 1 || num > 9999) return;

                        // ✅ instant capacity guard (does NOT remove validation; just prevents typing over)
                        const cap = getCapacityByTrainingType(
                          centerDetails,
                          formData.trainingType,
                        );
                        if (cap !== null && num > cap) {
                          swal({
                              text:  `Participants cannot exceed center capacity (${cap}) for ${formData.trainingType || "this"} booking.`,
                              icon: "error",
                            });
                          return;
                        }

                        updateField("participants", num);
                      }}
                    />
                  )}
                </div>

                {/* DATE RANGE - EDITABLE */}
                <div className="col-md-12">
                  <label className="form-label fw-bold">
                    {t("booking.dateRange")}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-3 mb-2">
                    <div className="flex-grow-1">
                      <label className="form-label small">
                        {t("booking.fromDate")}
                      </label>
                      <input
                        type="date"
                        className="form-control border-secondary rounded-2"
                        value={formData.fromDate}
                        onChange={(e) =>
                          updateField("fromDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        onClick={(e) => {
                          if (!isAuthenticated) {
                            e.preventDefault();
                            swal({
                              text: "Please login to book your slot.",
                              icon: "warning",
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label small">
                        {t("booking.toDate")}
                      </label>
                      <input
                        type="date"
                        className="form-control border-secondary rounded-2"
                        value={formData.toDate}
                        onChange={(e) => updateField("toDate", e.target.value)}
                        min={
                          formData.fromDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        onClick={(e) => {
                          if (!isAuthenticated) {
                            e.preventDefault();
                            swal({
                              text: "Please login to book your slot.",
                              icon: "warning",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <small className="text-muted">
                    {t("booking.selectDatesHint")}
                  </small>
                </div>

                {/* DISTRICT */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    {t("booking.district")}
                  </label>
                  <select
                    className="form-select border-secondary rounded-2"
                    value={formData.district || ""}
                    onChange={(e) => updateField("district", e.target.value)}
                    disabled
                  >
                    <option value="">{t("booking.selectDistrict")}</option>
                    {Array.isArray(districtList) &&
                      districtList.map((d) => (
                        <option key={d.districtId} value={String(d.districtId)}>
                          {isHindi ? d.districtNameHi : d.districtNameEn}
                        </option>
                      ))}
                  </select>
                </div>

                {/* BLOCK */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    {t("booking.block")}
                  </label>
                  {!isAuthenticated ? (
                    <select
                      className="form-select border-secondary rounded-2"
                      value={formData.block || ""}
                      onChange={(e) =>
                        updateField("block", Number(e.target.value))
                      }
                      disabled
                    >
                      <option value="">{t("booking.selectBlock")}</option>
                      {Array.isArray(blockList) &&
                        blockList.map((b) => (
                          <option key={b.blockId} value={String(b.blockId)}>
                            {isHindi ? b.blockNameHi : b.blockNameEn}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <select
                      className="form-select border-secondary rounded-2"
                      value={formData.block || ""}
                      onChange={(e) =>
                        updateField("block", Number(e.target.value))
                      }
                      disabled
                    >
                      <option value="">
                        {formData.district
                          ? t("booking.selectBlock")
                          : t("booking.selectDistrictFirst")}
                      </option>
                      {Array.isArray(blockList) &&
                        blockList.map((b) => (
                          <option key={b.blockId} value={String(b.blockId)}>
                            {isHindi ? b.blockNameHi : b.blockNameEn}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div className="col-md-12">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="fw-bold">
                      {t("booking.otherAmenitiesLabel")}
                    </label>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      disabled={!isAuthenticated}
                      onClick={addAmenityRow}
                    >
                      + Add
                    </button>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>{t("booking.amenityName")}</th>
                          <th>{t("booking.quantity")}</th>
                          <th>{t("booking.unitPrice")}</th>
                          <th>{t("booking.amount")}</th>
                          <th>{t("booking.remark")}</th>
                          <th className="text-center">{t("booking.action")}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {formData.otherAmenitiesList?.length > 0 ? (
                          formData.otherAmenitiesList.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={item.name}
                                  disabled={!isAuthenticated}
                                  onChange={(e) =>
                                    updateAmenity(index, "name", e.target.value)
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="1"
                                  value={item.quantity}
                                  disabled={!isAuthenticated}
                                  onChange={(e) =>
                                    updateAmenity(
                                      index,
                                      "quantity",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="0"
                                  value={item.maxPrice}
                                  disabled={!isAuthenticated}
                                  onChange={(e) =>
                                    updateAmenity(
                                      index,
                                      "maxPrice",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={
                                    (item.quantity || 0) * (item.maxPrice || 0)
                                  } // compute amount
                                  disabled // read-only
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={item.remark}
                                  disabled={!isAuthenticated}
                                  onChange={(e) =>
                                    updateAmenity(
                                      index,
                                      "remark",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeAmenity(index)}
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center text-muted">
                              No amenities added
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Info text */}
                  <small className="text-danger d-block mt-1">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    {t("booking.otherAmenities")}
                  </small>
                </div>
                <div>
                  <input type="hidden" name="amount" value={amount} />
                </div>

                {/* FILE UPLOAD */}
                <div className="col-md-12">
                  <label className="form-label fw-bold">
                    {t("booking.uploadLetter")}
                  </label>
                  {!isAuthenticated ? (
                    <input
                      type="file"
                      className="form-control border-dark"
                      onChange={(e) =>
                        updateField("letterFile", e.target.files[0])
                      }
                      accept=".pdf,.doc,.docx"
                      disabled
                    />
                  ) : (
                    <input
                      type="file"
                      className="form-control border-dark"
                      onChange={(e) =>
                        updateField("letterFile", e.target.files[0])
                      }
                      accept=".pdf,.doc,.docx"
                    />
                  )}
                  <small className="text-muted">
                    {t("booking.acceptedFormats")}
                  </small>
                </div>

                {/* PREVIEW BUTTON */}
                <div className="col-12">
                  {!isAuthenticated ? (
                    <button
                      type="button"
                      className="btn btn-success w-100 mb-2"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      disabled
                    >
                      {t("booking.previewConfirm")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-success w-100 mb-2"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      disabled={selectedCalendarIds.length === 0}
                    >
                      {selectedCalendarIds.length === 0
                        ? t("booking.previewConfirm")
                        : `Preview & Confirm Booking(${selectedDates.length} date${
                            selectedDates.length !== 1 ? "s" : ""
                          })`}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE CALENDAR */}
          <div className="col-lg-5">
            <div className="shadow rounded-3 p-2">
              <h5 className="text-center text-primary fw-bold mb-3 fs-4">
                {t("booking.calendarTitle")}
              </h5>

              <div className="alert alert-info small mb-3">
                <strong>Color Guide:</strong>
                <div className="d-flex flex-row flew-md-wrap gap-4">
                  <div>
                    <span className="badge bg-success me-1">●</span> Available
                  </div>
                  <div>
                    <span className="badge bg-danger me-1">●</span> Booked
                  </div>
                  <div>
                    <span className="badge bg-warning me-1">●</span> Reserved
                  </div>
                  <div>
                    <span className="badge bg-secondary me-1">●</span> Closed
                  </div>
                </div>
              </div>

              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={false}
                dateClick={handleDateClick}
                events={calendarEvents}
                datesSet={handleMonthChange}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "",
                }}
              />

              {selectedDates.length > 0 && (
                <div className="alert alert-success mt-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>
                        ✅ {selectedDates.length} Date(s) Selected
                      </strong>
                      <div className="mt-1">
                        <small>
                          From: {formData.fromDate} To: {formData.toDate}
                        </small>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedCalendarIds([]);
                        setSelectedDates([]);
                        setFormData((prev) => ({
                          ...prev,
                          fromDate: "",
                          toDate: "",
                        }));
                        setRangeStart(null);
                        setRangeEnd(null);
                        if (calendarRef.current) {
                          calendarRef.current.getApi().unselect();
                        }
                      }}
                    >
                      {t("booking.clear")}
                    </button>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      {selectedDates.length <= 8
                        ? selectedDates.join(", ")
                        : `${selectedDates.slice(0, 5).join(", ")}... and ${selectedDates.length - 5} more`}
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" style={{ zIndex: 1400 }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">{t("booking.previewTitle")}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-primary">
                    <tr>
                      <th>{t("booking.field")}</th>
                      <th>{t("booking.value")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>{t("booking.fullName")}</strong>
                      </td>
                      <td>{formData.fullName || t("booking.notProvided")}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.mobile")}</strong>
                      </td>
                      <td>{formData.mobile || t("booking.notProvided")}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.organisation")}</strong>
                      </td>
                      <td>
                        {formData.organisation || t("booking.notProvided")}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.cmtcName")}</strong>
                      </td>
                      <td>{formData.cmtcName || t("booking.notProvided")}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.trainingType")}</strong>
                      </td>
                      <td>
                        {formData.trainingType || t("booking.notProvided")}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Dates</strong>
                      </td>
                      <td>
                        {selectedDates.length > 0 ? (
                          <>
                            {formData.fromDate === formData.toDate
                              ? formData.fromDate
                              : `${formData.fromDate} to ${formData.toDate}`}
                            <br />
                            <small className="text-muted">
                              ({selectedDates.length} day
                              {selectedDates.length !== 1 ? "s" : ""})
                            </small>
                            {selectedDates.length <= 10 && (
                              <div className="mt-1 small">
                                <strong>{t("booking.selectedDates")}:</strong>{" "}
                                {selectedDates.join(", ")}
                              </div>
                            )}
                          </>
                        ) : (
                          "No dates selected"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.district")}</strong>
                      </td>
                      <td>
                        {districtList.find(
                          (d) => String(d.districtId) === formData.district,
                        )?.districtNameEn || t("booking.notSelected")}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.block")}</strong>
                      </td>
                      <td>
                        {blockList.find(
                          (b) => String(b.blockId) === formData.block,
                        )?.blockNameEn || t("booking.notSelected")}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.participants")}</strong>
                      </td>
                      <td>
                        {formData.participants || "0"}
                        {formData.trainingType && (
                          <div className="small text-muted mt-1">
                            Capacity:{" "}
                            {getCapacityByTrainingType(
                              centerDetails,
                              formData.trainingType,
                            ) ?? "N/A"}
                          </div>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>{t("booking.uploadLetter")}</strong>
                      </td>
                      <td>
                        {formData.letterFile ? (
                          <span>{t("booking.uploaded")}</span>
                        ) : (
                          t("booking.notUploaded")
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t("booking.otherAmenitiesLabel")}</strong>
                      </td>
                      <td>
                        {formData.otherAmenitiesList &&
                        formData.otherAmenitiesList.length > 0 ? (
                          <>
                            <table className="table table-sm table-bordered mb-1">
                              <thead className="table-light">
                                <tr>
                                  <th>{t("booking.amenityName")}</th>
                                  <th>{t("booking.quantity")}</th>
                                  <th>{t("booking.unitPrice")}</th>
                                  <th>{t("booking.amount")}</th>
                                  <th>{t("booking.remark")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formData.otherAmenitiesList.map(
                                  (amenity, idx) => {
                                    const quantity =
                                      Number(amenity.quantity) || 0;
                                    const unitPrice =
                                      Number(amenity.maxPrice) || 0;
                                    const totalAmount = quantity * unitPrice;

                                    return (
                                      <tr key={idx}>
                                        <td>{amenity.name || "-"}</td>
                                        <td>{quantity || "-"}</td>
                                        <td>{unitPrice || "-"}</td>
                                        <td>
                                          {totalAmount > 0
                                            ? `₹${totalAmount}`
                                            : "-"}
                                        </td>
                                        <td>{amenity.remark || "-"}</td>
                                      </tr>
                                    );
                                  },
                                )}
                              </tbody>
                            </table>

                            {/* Grand total for amenities */}
                            <div className="text-end me-2">
                              <strong>
                                {t("booking.totalAmenities")} : ₹
                                {formData.otherAmenitiesList.reduce(
                                  (sum, amenity) =>
                                    sum +
                                    (Number(amenity.quantity) || 0) *
                                      (Number(amenity.maxPrice) || 0),
                                  0,
                                )}
                              </strong>
                            </div>
                          </>
                        ) : (
                          <span>{t("booking.notSelected")}</span>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>{t("booking.trainingAmount")}</strong>
                      </td>
                      <td>
                        <strong>
                          {formData.participants && formData.trainingType
                            ? `₹${formData.participants * selectedDates.length * getPrice(formData.trainingType)}`
                            : "₹0"}
                        </strong>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <strong>{t("booking.totalAmount")}</strong>
                      </td>
                      <td>
                        <strong>
                          ₹
                          {(() => {
                            const amenitiesTotal =
                              formData.otherAmenitiesList?.reduce(
                                (sum, amenity) =>
                                  sum +
                                  (Number(amenity.quantity) || 0) *
                                    (Number(amenity.maxPrice) || 0),
                                0,
                              );
                            const trainingTotal =
                              formData.participants && formData.trainingType
                                ? formData.participants *
                                  selectedDates.length *
                                  getPrice(formData.trainingType)
                                : 0;

                            return amenitiesTotal + trainingTotal;
                          })()}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("booking.processing")
                  : t("booking.confirmBooking")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CmtcBookingPage;
