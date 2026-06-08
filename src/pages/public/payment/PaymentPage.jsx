import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBookingDetails } from "../../user/userBookingService";
import api from "../../../services/apiService";
import { getCenterDetails } from "../../../services/cmtcCenterService";
import { initiateUniPay } from "../../../services/paymentService";
import RedirectToUniPayForm from "../../payment/RedirectToUniPayForm" ;
import swal from "sweetalert";
import "./paymentStyle.css";

function PaymentPage() {
  const { bookingId } = useParams();
  const [centerDetails, setCenterDetails] = useState(null);
  const [booking, setBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pg, setPg] = useState(null); // {actionUrl, encRequest, serviceKey}
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const bookingData = await getBookingDetails(bookingId);
        const userRes = await api.get("/admin/users/user");

        setBooking(bookingData);
        setUser(userRes.data);

        if (bookingData?.centerId) {
          const centerRes = await getCenterDetails(bookingData.centerId);
          setCenterDetails(centerRes.data);
        }
      } catch (err) {
        console.error(err);
        setBooking(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) loadData();
  }, [bookingId]);

  const payNow = async (stage) => {
    try {
      setPayLoading(true);
      const data = await initiateUniPay({
        bookingId,
        paymentStage: stage, // "ADVANCE" | "REMAINING" | "FULL"
      });
      setPg(data);
    } catch (e) {
      swal({
        title: "Error",
        text: e?.response?.data?.message || e.message || "Payment initiation failed",
        icon: "error",
      });
    } finally {
      setPayLoading(false);
    }
  };

  // ✅ gateway redirect
  if (pg?.actionUrl && pg?.encRequest && pg?.serviceKey) {
    return (
      <div className="container py-5 text-center">
        <h5>Redirecting to payment gateway...</h5>
        <RedirectToUniPayForm
          actionUrl={pg.actionUrl}
          encRequest={pg.encRequest}
          serviceKey={pg.serviceKey}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h5>Loading booking details...</h5>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h5>No booking found</h5>
      </div>
    );
  }

  // ✅ amounts from DB
  const totalAmount = booking?.amount ?? booking?.totalAmount ?? 0;
  const advanceAmount = booking?.advancedAmount ?? 0;
  const remainingAmount = booking?.remainingAmount ?? 0;

  const isInternal = booking?.isInternal === true;

  // Payment status flags (adjust as per your values)
  const paymentStatus = (booking?.paymentStatus || "").toUpperCase();
  const isAdvancePaid = paymentStatus === "ADVANCE_PAID" || paymentStatus === "FULLY_PAID";
  const isFullyPaid = paymentStatus === "FULLY_PAID";

  return (
    <div className="container py-5">
      <h3 className="mb-3 fs-2">CMTC Training Payment</h3>

      {/* Booking Summary */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Booking Summary</div>
        <div className="card-body">
          <div className="row">

            <div className="col-md-4">
              <p><strong>Booking ID:</strong> {booking.bookingRef}</p>
              <p><strong>CMTC Name:</strong> {booking.centerName}</p>
              <p><strong>Organization Name:</strong> {booking.organizationName}</p>
            </div>

            <div className="col-md-4">
              <p><strong>Participants:</strong> {booking.numberOfTrainees}</p>
              <p><strong>Date From :</strong> {booking.fromDate}</p>
              <p><strong>Date To :</strong> {booking.toDate}</p>
              <p><strong>District:</strong> {booking.districtName}</p>
              <p><strong>Block:</strong> {booking.blockName}</p>
            </div>

            <div className="col-md-4">
              <p>
                <strong>Status:</strong>{" "}
                <span className="badge bg-warning status-badge">{booking.status}</span>
              </p>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span className="badge bg-info status-badge">{booking.paymentStatus}</span>
              </p>
              <p><strong>User Type:</strong> {isInternal ? "Internal (100%)" : "External (25% + 75%)"}</p>

              {!isInternal ? (
                <>
                  <p><strong>Advance Payable:</strong> ₹ {advanceAmount}</p>
                  <p><strong>Remaining Payable:</strong> ₹ {remainingAmount}</p>
                </>
              ) : (
                <p><strong>Total Payable:</strong> ₹ {totalAmount}</p>
              )}

              <p><strong>Total Amount:</strong> ₹ {totalAmount}</p>
            </div>

          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">User Details</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex mb-2">
                <span className="fw-semibold me-2">Full Name:</span>
                <span>{user?.fullName || "-"}</span>
              </div>
              <div className="d-flex mb-2">
                <span className="fw-semibold me-2">Email:</span>
                <span>{user?.email || "-"}</span>
              </div>
              <div className="d-flex">
                <span className="fw-semibold me-2">Mobile No:</span>
                <span>{user?.mobileNo || "-"}</span>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex mb-2">
                <span className="fw-semibold me-2">Designation:</span>
                <span>{user?.departmentUser?.designation || "-"}</span>
              </div>
              <div className="d-flex mb-2">
                <span className="fw-semibold me-2">Role:</span>
                <span className="badge bg-primary">{user?.role || "-"}</span>
              </div>
              <div className="d-flex">
                <span className="fw-semibold me-2">Letter:</span>
                {user?.departmentUser?.authorizationLetterPath ? (
                  <a
                    href={user.departmentUser.authorizationLetterPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-primary"
                  >
                    View Document
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Invoice Summary</div>
        <div className="card-body">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>No. of Trainees</td><td>{booking.numberOfTrainees}</td></tr>
              <tr><td>Duration</td><td>{booking.durationDescription}</td></tr>
              <tr><td>Training Type</td><td>{booking.trainingType}</td></tr>
              <tr className="fw-bold"><td>Total Amount</td><td>₹ {totalAmount}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Action */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">Payment Action</div>
        <div className="card-body text-center">

          {/* ✅ INTERNAL USER: FULL PAYMENT */}
          {isInternal ? (
            <>
              <h5>Full Payment (100%)</h5>
              <p className="fs-5">
                Payable Amount: <strong>₹ {totalAmount}</strong>
              </p>

              <button
                className="btn btn-success btn-lg"
                disabled={payLoading || isFullyPaid || totalAmount <= 0}
                onClick={() => payNow("FULL")}
              >
                {isFullyPaid ? "Already Paid" : (payLoading ? "Processing..." : "Pay Full Amount")}
              </button>

              <p className="text-muted mt-2">
                *Internal users pay the complete amount in a single transaction.
              </p>
            </>
          ) : (
            <>
              {/* ✅ EXTERNAL USER: ADVANCE + REMAINING */}
              <h5>Advance Payment (25%)</h5>
              <p className="fs-5">
                Payable Amount: <strong>₹ {advanceAmount}</strong>
              </p>
              <button
                className="btn btn-primary btn-lg"
                disabled={payLoading || isAdvancePaid || advanceAmount <= 0}
                onClick={() => payNow("ADVANCE")}
              >
                {isAdvancePaid ? "Advance Paid" : (payLoading ? "Processing..." : "Pay 25% Advance")}
              </button>

              <hr className="my-4" />

              <h5>Remaining Payment (75%)</h5>
              <p className="fs-5">
                Payable Amount: <strong>₹ {remainingAmount}</strong>
              </p>
              <button
                className="btn btn-success btn-lg"
                disabled={payLoading || !isAdvancePaid || isFullyPaid || remainingAmount <= 0}
                onClick={() => payNow("REMAINING")}
              >
                {isFullyPaid ? "Fully Paid" : (payLoading ? "Processing..." : "Pay Remaining 75%")}
              </button>

              {!isAdvancePaid && (
                <p className="text-muted mt-2">
                  *Remaining payment will be enabled after advance payment success.
                </p>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default PaymentPage;