import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  createCalendarEntry,
  bulkCreateCalendarEntries,} from  "../../services/bookingService.js"
import {
  getMonthlyCalendar,
} from "../../services/cmtcCenterService.js";
import "../../components/sections/cmtcStyle.css";
import {getAllDistricts,
  getBlocksByDistrict,
  getCentersByBlock

} from "../../services/publicService"
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
function CmtcBookingManagmentPage() {
  const [selectedCalendarIds, setSelectedCalendarIds] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]); // Store all selected dates
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [mode, setMode] = useState("SINGLE"); 
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centersByBlock, setCentersByBlock] = useState([]);
  const { t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const calendarRef = useRef(null);
  const dateSourceRef = useRef(null); 

  // -------------------------
  // BOOKING FORM STATE
  // -------------------------
  const [formData, setFormData] = useState({
   districtId: "",
   blockId: "",
   centerId: "",
   date: "",
   fromDate: "",
   toDate: "",
   bookingStatus: "AVAILABLE",
   capacityAvailable: 0,
  });
  const INITIAL_FORM = {
   districtId: "",
   blockId: "",
   centerId: "",
   date: "",
   fromDate: "",
   toDate: "",
   bookingStatus: "AVAILABLE",
   capacityAvailable: 0,
  };
  useEffect(() => {
   if ( dateSourceRef.current === "manual" && formData.fromDate && formData.toDate) 
      {
        validateDateRangeFromInputs( formData.fromDate, formData.toDate );
      }
  }, [formData.fromDate, formData.toDate]);

  useEffect(() => {
   const loadDistricts = async () => {
    const data = await getAllDistricts();
    setDistricts(Array.isArray(data) ? data : []);
   };

   loadDistricts();
  }, []);

  useEffect(() => {
   if (!rangeStart || !rangeEnd) return;

   const dates = getDatesInRange(rangeStart, rangeEnd);

    const available = dates.filter(date => {
     const event = calendarEvents.find(e => e.date === date);
     return event && event.title === "AVAILABLE";
    });

   setSelectedDates(available);

   setSelectedCalendarIds(
      available.map(d => {
       const e = calendarEvents.find(x => x.date === d);
       return e?.calendarId || 0;
      })
    );

  }, [rangeStart, rangeEnd]);

  useEffect(() => {
   if (!formData.centerId || !calendarRef.current) return;

   const api = calendarRef.current.getApi();

    // force FullCalendar to re-run datesSet
    api.today();
  }, [formData.centerId]);

  // -------------------------
  // GET ALL DATES IN RANGE
  // -------------------------
  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // -------------------------
  // VALIDATE DATE RANGE FROM INPUT FIELDS
  // -------------------------
  const validateDateRangeFromInputs = (startDate, endDate) => {
    if (calendarRef.current) {
       calendarRef.current.getApi().unselect();
    }
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if start date is after end date
    if (start > end) {
      taost.error("Start date cannot be after end date");
      setFormData(prev => ({ ...prev, fromDate: "", toDate: "" }));
      setSelectedCalendarIds([]);
      setSelectedDates([]);
      return;
    }
    
    // Get all dates in range
    const datesInRange = getDatesInRange(startDate, endDate);
    
    // Check each date in the range
    const availableDates = [];
    const unavailableDates = [];
    
    datesInRange.forEach(date => {
      const event = calendarEvents.find(e => e.date === date);
      if (event) {
        if (event.title === "AVAILABLE") {
          availableDates.push({
            date: date,
            calendarId: event.calendarId || 0
          });
        } else {
          unavailableDates.push({
            date: date,
            status: event.title
          });
        }
      } else {
        // Date not found in events (might be in different month)
        unavailableDates.push({
          date: date,
          status: "NOT_FOUND"
        });
      }
    });
    
    if (availableDates.length === 0) {
      toast.warning("No available dates in selected range");
      setSelectedCalendarIds([]);
      setSelectedDates([]);
      return;
    }
    
    // Show warning if there are unavailable dates in the range
    if (unavailableDates.length > 0) {
      const unavailableMessage = unavailableDates.map(ud => 
        `${ud.date} (${ud.status === "BOOKED" ? "Already Booked" : 
                    ud.status === "RESERVED" ? "Reserved" : 
                    ud.status === "CLOSED" ? "Closed/Past Date" : "Not Available"})`
      ).join(", ");
      
      toast.warning(`Warning: ${unavailableDates.length} date(s) in your range are not available:\n${unavailableMessage}\n\nOnly ${availableDates.length} available date(s) will be booked.`);
    }
    
    // Set selected dates and calendar IDs
    const ids = availableDates.map(d => d.calendarId);
    const dateStrings = availableDates.map(d => d.date);
    
    setSelectedCalendarIds(ids);
    setSelectedDates(dateStrings);
    
    toast.success(`Selected ${availableDates.length} available date(s) from ${startDate} to ${endDate}`);
  };

  const handleDistrictChange = async (e) => {
   const districtId = e.target.value;

   setFormData((prev) => ({
     ...prev,
     districtId,
     blockId: "",
     centerId: "",
    }));

   setBlocks([]);
   setCentersByBlock([]);

   if (!districtId) return;

   const data = await getBlocksByDistrict(districtId);
   setBlocks(Array.isArray(data) ? data : []);
  };

  const handleBlockChange = async (e) => {
   const blockId = e.target.value;

   setFormData((prev) => ({
     ...prev,
     blockId,
     centerId: "",
    }));

    setCentersByBlock([]);

    if (!blockId) return;

    const data = await getCentersByBlock(Number(blockId));
    setCentersByBlock(Array.isArray(data) ? data : []);
  };

  //  Month change
  const handleMonthChange = async (info) => {
   if (!formData.centerId) return;

   const months = getMonthsBetween(info.start, info.end);
   const allEvents = [];

   for (const month of months) { 
     try {
       const res = await getMonthlyCalendar(Number(formData.centerId), month);
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

    const events = Array.from(uniqueMap.values()).map((item) => {
     const status = item.status || "AVAILABLE";

      return {
       title: status,
       date: item.date,
       backgroundColor:
        status === "AVAILABLE"
          ? "#28a745"
          : status === "BOOKED"
          ? "#dc3545"
          : status === "RESERVED"
          ? "#ffcc00"
          : "#bdbdbd",
       borderColor:
       status === "AVAILABLE"
          ? "#28a745"
          : status === "BOOKED"
          ? "#dc3545"
          : status === "RESERVED"
          ? "#ffcc00"
          : "#bdbdbd",
        extendedProps: {
          calendarId: item.calendarId,
          status,
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

  // -------------------------
  // ON DATE CLICK (single date selection)
  // -------------------------
  const handleDateClick = (info) => {
   const clickedDate = info.dateStr;
   const calendarApi = calendarRef.current.getApi();

   /* =========================
     SINGLE DATE MODE
     ========================= */
   if (mode === "SINGLE") {
      setFormData((prev) => ({
       ...prev,
       date: clickedDate,
       fromDate: "",
       toDate: "",
      }));

     setRangeStart(null);
     setRangeEnd(null);

     calendarApi.unselect();
     return;
    }

   /* =========================
     BULK / RANGE MODE
     ========================= */

   // 1️⃣ No start selected → set FROM
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

    // 2️⃣ Start exists but no end → set TO
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

    // 3️⃣ Both exist → adjust range
    if (rangeStart && rangeEnd) {
     let start = rangeStart;
     let end = rangeEnd;

     if (new Date(clickedDate) > new Date(start)) {
       end = clickedDate;
      } else {
       start = clickedDate;
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
    }
  };

  // -------------------------
  // SUBMIT BOOKING
  // -------------------------
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!formData.centerId) {
      toast.error("Please select a CMTC Center");
      return;
    }

    if (mode === "SINGLE" && !formData.date) {
      toast.error("Please select a date");
      return;
    }

    if (mode === "BULK" && (!formData.fromDate || !formData.toDate)) {
      toast.error("Please select date range");
      return;
    }

    setLoading(true);
    try {
      if (mode === "SINGLE") {
        await createCalendarEntry({
          centerId: Number(formData.centerId),
          date: formData.date,
          bookingStatus: formData.bookingStatus,
        });
      } else {
        await bulkCreateCalendarEntries({
          centerId: Number(formData.centerId),
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          bookingStatus: formData.bookingStatus,
        });
      }

      toast.success("Calendar updated successfully");
      setFormData(INITIAL_FORM);
      calendarRef.current?.getApi().refetchEvents();
    } catch (err) {
      toast.error("Failed to update calendar");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mt-4">
      <h4 className="text-center text-primary fw-bold mb-3">
       {t("admin.cmtcTrainingCalendar")}
      </h4>

      {/* DISTRICT */}
      <div className="row g-2 mb-8">
        {/* DISTRICT */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-bold">{t("admin.district")}</label>
          <select
            className="form-select"
            value={formData.districtId}
            onChange={handleDistrictChange}
          >
            <option value="">-- Select District --</option>
            {districts.map((d) => (
              <option key={d.districtId} value={d.districtId}>
                {d.districtNameEn}
              </option>
            ))}
          </select>
        </div>

        {/* BLOCK */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-bold">{t("admin.block")}</label>
          <select
            className="form-select"
            value={formData.blockId}
            onChange={handleBlockChange}
            disabled={!formData.districtId}
          >
            <option value="">-- Select Block --</option>
            {blocks.map((block) => (
              <option key={block.blockId} value={block.blockId}>
                {block.blockNameEn}
              </option>
            ))}
          </select>
        </div>

        {/* CENTER */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-bold">{t("admin.cmtcCenter")}</label>
          <select
            className="form-select"
            value={formData.centerId}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                centerId: e.target.value,
                date: "",
                fromDate: "",
                toDate: "",
              }))
            }
            disabled={!formData.blockId}
          >
            <option value="">-- Select Center --</option>
            {centersByBlock.map((c) => (
              <option key={c.centerId} value={c.centerId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {/* LEFT FORM */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">{t("admin.addUpdateCalendar")}</h6>

            {/* MODE SWITCH */}
            <div className="btn-group w-100 mb-3">
              <button
                type="button"
                className={`btn ${
                  mode === "SINGLE"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setMode("SINGLE")}
              >
               {t("admin.singleDate")}
              </button>
              <button
                type="button"
                className={`btn ${
                  mode === "BULK" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setMode("BULK")}
              >
               {t("admin.dateRange")}
              </button>
            </div>

            <form onSubmit={handleBookingSubmit}>

              {mode === "SINGLE" && (
               <>
                 <label className="form-label">{t("admin.date")}</label>
                 <input
                    type="date"
                    className="form-control mb-2"
                    value={formData.date || ""}
                    onChange={(e) =>
                     setFormData((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </>
              )}
              {mode === "BULK" && (
                <>
                 <label className="form-label">{t("admin.fromDate")}</label>
                 <input
                   type="date"
                   className="form-control mb-2"
                   value={formData.fromDate}
                   onChange={(e) =>
                     setFormData((p) => ({ ...p, fromDate: e.target.value }))
                    }
                  />

                 <label className="form-label">{t("admin.toDate")}</label>
                 <input
                   type="date"
                   className="form-control mb-2"
                   min={formData.fromDate}
                   value={formData.toDate}
                   onChange={(e) =>
                     setFormData((p) => ({ ...p, toDate: e.target.value }))
                    }
                  />
                </>
              )}

              <label className="form-label">{t("admin.capacity")}</label>
              <input
                type="number"
                min={0}
                className="form-control mb-2"
                value={formData.capacityAvailable}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    capacityAvailable: e.target.value,
                  }))
                }
              />

              <label className="form-label">{t("admin.bookingStatus")}</label>
              <select
                className="form-select mb-3"
                value={formData.bookingStatus}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    bookingStatus: e.target.value,
                  }))
                }
              >
                <option value="RESERVED">RESERVED</option>
                <option value="AVAILABLE">AVAILABLE</option>
              </select>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? t("admin.saving") : t("admin.save")}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT CALENDAR */}
        <div className="col-12 col-md-7 mb-5  mx-auto">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable={false}
            dateClick={handleDateClick}
            events={calendarEvents}
            datesSet={handleMonthChange}
            height="auto"
            eventClick={(info) => {
             if (info.event.extendedProps.status !== "AVAILABLE") {
               toast.warning("This date is not available");
               info.jsEvent.preventDefault();
               return;
             }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CmtcBookingManagmentPage;