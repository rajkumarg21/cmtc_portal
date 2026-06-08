import React, { useState } from "react";

function BookingTable({ data, onView }) {
  const [filters, setFilters] = useState({
    bookingRef: "",
    organizationName: "",
    status: ""
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredData = data.filter((b) => {
    return (
      (b.bookingRef || "")
        .toLowerCase()
        .includes(filters.bookingRef.toLowerCase()) &&
      (b.organizationName || "")
        .toLowerCase()
        .includes(filters.organizationName.toLowerCase()) &&
      (filters.status === "" || b.status === filters.status)
    );
  });

  return (
    <div className="card shadow-sm">
      <div className="card-body">

        <h5 className="mb-3 fw-bold">Booking Requests</h5>

        {/* 🔍 Filters */}
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Booking Ref"
              name="bookingRef"
              value={filters.bookingRef}
              onChange={handleFilterChange}
            />
          </div>

          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Organization"
              name="organizationName"
              value={filters.organizationName}
              onChange={handleFilterChange}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle border-dark">
            <thead className="table-light text-center">
              <tr>
                <th>Booking Ref</th>
                <th>Organization</th>
                <th>Center</th>
                <th>District</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold">{b.bookingRef}</td>
                    <td>{b.organizationName}</td>
                    <td>{b.centerName}</td>
                    <td>{b.districtName}</td>
                    <td>{b.fromDate}</td>
                    <td>{b.toDate}</td>

                    <td className="text-center">
                      {b.status === "PENDING" && (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                      {b.status === "APPROVED" && (
                        <span className="badge bg-success">Approved</span>
                      )}
                      {b.status === "REJECTED" && (
                        <span className="badge bg-danger">Rejected</span>
                      )}
                    </td>

                    <td className="text-center">
                      {b.status === "PENDING" ? (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => onView(b)}
                          >
                            VIEW
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success me-2"
                            disabled
                          >
                            APPROVE
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled
                          >
                            REJECT
                          </button>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default BookingTable;
