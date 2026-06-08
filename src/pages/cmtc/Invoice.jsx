
import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAllInvoicesByBookingId } from "../../services/bookingService";
import Logo from "/images/cmtclogo.png";

export default function Invoice() {
  const printRef = useRef();
  const { bookingId } = useParams();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getAllInvoicesByBookingId(bookingId);
        setInvoices(data);
      } catch (err) {
        console.error("Failed to load invoices", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchInvoices();
  }, [bookingId]);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open();

    win.document.write(`
      <html>
      <head>
      <title>Invoice</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
      <style>
        body{ font-family: Arial; }
        .invoice{ width:800px; margin:auto; page-break-after: always; }
        th,td{ border:1px solid black !important; padding:8px !important; }
      </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!invoices.length)
    return <div className="text-center mt-5">Invoice not found</div>;

  const advanceInvoice = invoices.find(
    (inv) => inv.paymentStage === "ADVANCE"
  );

  const remainingInvoice = invoices.find(
    (inv) => inv.paymentStage === "REMAINING"
  );

  const fullInvoice = invoices.find(
  (inv) => inv.paymentStage?.toUpperCase() === "FULL"
);
  const renderInvoiceSection = (inv, title) => (
    <div className="invoice bg-white border p-5 mb-5">

      {/* HEADER */}
      <div className="row align-items-center">
        <div className="col-6 text-start">
          <img src={Logo} alt="logo" style={{ height: "70px" }} />
        </div>
        <div className="col-6 text-end">
          <h4 className="fw-bold">{title}</h4>
        </div>
      </div>

      <hr className="my-4" />

      {/* Invoice Info */}
      <div className="row">
        <div className="col-6 text-start">
          Invoice No: <b>{inv.invoiceNo}</b>
        </div>
        <div className="col-6 text-end">
          Date:{" "}
          <b>
            {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
          </b>
        </div>
      </div>

      <hr className="my-4" />

      {/* Customer Info */}
      <div className="text-start">
        <h6 className="fw-bold">Bill To:</h6>
        <p>Organization Name: {inv.organizationName}</p>
        <p>Customer: {inv.customerName}</p>
        <p>Email: {inv.email}</p>
        <p>Mobile: {inv.mobile}</p>
      </div>

      <hr className="my-4" />

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Description</th>
              <th>Trainees</th>
              <th>Base Amount</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CMTC Training Charges ({inv.paymentStage})</td>
              <td>{inv.numberOfTrainees}</td>
              <td>₹ {Number(inv.baseAmount).toLocaleString("en-IN")}</td>
              <td>₹ {Number(inv.taxAmount).toLocaleString("en-IN")}</td>
              <td>₹ {Number(inv.totalAmount).toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-1">
         <p className="mb-0 text-muted text-sm">
          This is system generated invoice and it does not require signature.
        </p>
        <h5 className="fw-bold mb-0">
          Total Paid: ₹ {Number(inv.totalAmount).toLocaleString("en-IN")}
        </h5>
      </div>
    </div>
  );

  return (
    <div className="text-center p-3">

      <button className="btn btn-primary mb-4" onClick={handlePrint}>
        Print Invoice
      </button>

      <div ref={printRef}>

        {/* Advance Invoice */}
        {advanceInvoice &&
          renderInvoiceSection(advanceInvoice, "INVOICE")}

        {/* Remaining Invoice */}
        {remainingInvoice &&
          renderInvoiceSection(remainingInvoice, "INVOICE")}

        {/* Full Invoice */}
        {fullInvoice &&
          renderInvoiceSection(fullInvoice, "FULL PAYMENT INVOICE")}
      </div>
    </div>
  );
}