import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function paymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const status = params.get("status");
    const txnId = params.get("txnId");
    const bookingRef = params.get("bookingRef");
    const amount = params.get("amount");
    const paymentMode = params.get("mode");

    setPaymentData({
      status,
      txnId,
      bookingRef,
      amount,
      paymentMode,
      date: new Date().toLocaleString("en-IN"),
    });
  }, [location.search]);

  if (!paymentData) return null;

  const isSuccess = paymentData.status === "success";

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">

          <div className={`card shadow-lg border-0 ${isSuccess ? "border-success" : "border-danger"}`}>
            
            {/* Header */}
            <div className={`card-header text-center text-white fw-bold ${
              isSuccess ? "bg-success" : "bg-danger"
            }`}>
              {isSuccess ? "Payment Successful" : "Payment Failed"}
            </div>

            {/* Body */}
            <div className="card-body text-center">

              {/* Icon */}
              <div className="mb-4">
                {isSuccess ? (
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                ) : (
                  <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "4rem" }}></i>
                )}
              </div>

              <h5 className="mb-3">
                {isSuccess
                  ? "Your payment has been processed successfully."
                  : "Unfortunately, your payment could not be completed."}
              </h5>

              <hr />

              {/* Details Table */}
              <div className="text-start">
                <p><strong>Booking Reference:</strong> {paymentData.bookingRef}</p>
                <p><strong>Transaction ID:</strong> {paymentData.txnId || "N/A"}</p>
                <p><strong>Amount Paid:</strong> ₹ {paymentData.amount}</p>
                <p><strong>Payment Mode:</strong> {paymentData.paymentMode || "Online"}</p>
                <p><strong>Date & Time:</strong> {paymentData.date}</p>
              </div>

              <hr />

              {/* Buttons */}
              {isSuccess ? (
                <button
                  className="btn btn-success w-100"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </button>
              ) : (
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(-1)}
                  >
                    Try Again
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default paymentStatus;