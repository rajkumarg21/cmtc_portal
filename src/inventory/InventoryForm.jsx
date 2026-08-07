import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {
  getAllDistricts,
  getBlocksByDistrict,
  getCentersByBlock,
} from "../services/cmtcCenterService";
import {
  getAllAssetCategories,
  getAllInventory,
  getAssetsByCategoryId,
  getInventoryByBlock,
  getInventoryByDistrict,
  saveInventory,
  updateInventory,
} from "./inventory_service/assetInventoryService";

const InventoryForm = () => {
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centers, setCenters] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const formRef = useRef(null);

  const { user, userRole } = useAuth();
  console.log("userole", userRole);

  const isDistrictLocked = !!user?.districtId;
  const isBlockLocked = !!user?.blockId;

  useEffect(() => {
    loadInitialData();
    loadAssetCategories();
    loadInventory();
  }, []);

  const loadInitialData = async () => {
    try {
      const districtRes = await getAllDistricts();

      setDistricts(districtRes.data);

      // Auto District
      if (user?.districtId) {
        setValue("districtId", String(user.districtId));

        const blockRes = await getBlocksByDistrict(user.districtId);

        setBlocks(blockRes.data);

        // Auto Block
        if (user?.blockId) {
          setValue("blockId", String(user.blockId));

          const centerRes = await getCentersByBlock(user.blockId);

          setCenters(centerRes.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadInventory = async () => {
    try {
      let response;

      if (user?.blockId) {
        response = await getInventoryByBlock(user.blockId);
      } else if (user?.districtId) {
        response = await getInventoryByDistrict(user.districtId);
      } else {
        // response = await getAllInventory();
      }

      setInventoryList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAssetCategories = async () => {
    try {
      const response = await getAllAssetCategories();
      setAssetCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssetCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setValue("assetCategoryId", categoryId);

    try {
      const response = await getAssetsByCategoryId(categoryId);
      setAssets(response.data);
      setValue("assetMasterId", "");
    } catch (error) {
      console.error(error);
    }
  };

  const loadDistricts = async () => {
    try {
      const response = await getAllDistricts();
      setDistricts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;

    setValue("districtId", districtId);

    try {
      const response = await getBlocksByDistrict(districtId);
      setBlocks(response.data);
      setCenters([]);
      setValue("blockId", "");
      setValue("cmtcCenterId", "");
    } catch (error) {
      console.error(error);
    }
  };

  const handleBlockChange = async (e) => {
    const blockId = e.target.value;

    setValue("blockId", blockId);

    try {
      const response = await getCentersByBlock(blockId);
      setCenters(response.data);
      setValue("cmtcCenterId", "");
    } catch (error) {
      console.error(error);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const handleEdit = async (row) => {
    const response = await getAssetsByCategoryId(row.assetCategoryId);

    setAssets(response.data);

    setValue("assetCategoryId", String(row.assetCategoryId));
    setValue("assetMasterId", String(row.assetMasterId));

    const centerRes = await getCentersByBlock(row.blockId);
    setCenters(centerRes.data);
    setValue("cmtcCenterId", String(row.cmtcCenterId));

    setValue("id", row.id);
    setValue("districtId", row.districtId);
    setValue("blockId", row.blockId);

    setValue("modelNumber", row.modelNumber);
    setValue("assetQuantity", row.assetQuantity);
    setValue("companyName", row.companyName);
    setValue("purchaseDateAndYear", row.purchaseDateAndYear);
    setValue("billNumber", row.billNumber);
    setValue("registerAssetSerialNumber", row.registerAssetSerialNumber);
    setValue("assetCodeNumber", row.assetCodeNumber);
    setValue("perUnitPrice", row.perUnitPrice);
    setValue("totalPrice", row.totalPrice);

    setIsEditMode(true);
    setShowForm(true);
    setActiveTab(0);

    // scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAddNew = () => {
    reset();
    loadInitialData();
    setIsEditMode(false);
    setShowForm(true);
    setActiveTab(0);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancel = () => {
    setShowForm(false);
    setActiveTab(0);
    setIsEditMode(false);
    reset();
    loadInitialData();
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      const payload = {
        districtId: data.districtId,
        blockId: data.blockId,
        clfId: data.clfId,
        cmtcCenterId: data.cmtcCenterId,
        assetCategoryId: data.assetCategoryId,
        assetMasterId: data.assetMasterId,
        modelNumber: data.modelNumber,
        assetQuantity: data.assetQuantity,
        companyName: data.companyName,
        purchaseDateAndYear: data.purchaseDateAndYear,
        billNumber: data.billNumber,
        registerAssetSerialNumber: data.registerAssetSerialNumber,
        assetCodeNumber: data.assetCodeNumber,
        perUnitPrice: data.perUnitPrice,
        totalPrice: data.totalPrice,
      };

      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );

      if (data.purchasePhoto?.[0]) {
        formData.append("purchasePhoto", data.purchasePhoto[0]);
      }

      if (data.id) {
        await updateInventory(data.id, formData);
        alert("Updated Successfully");
      } else {
        await saveInventory(formData);
        alert("Saved Successfully");
      }

      reset();
      await loadInitialData();
      setIsEditMode(false);
      setShowForm(false);

      // Refresh table
      loadInventory();
    } catch (error) {
      console.error(error);
      alert("Failed to save inventory");
    }
  };

  const tabHeaders = ["Location Details", "Asset Details", "Asset Information"];

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">CMTC Asset Inventory</h4>
        </div>

        <div className="card-body">
          {/* Add New Button - visible when form is hidden */}
          {!showForm && (
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleAddNew}
              >
                <i className="bi bi-plus-circle me-1"></i> Add New
              </button>
            </div>
          )}

          {/* Form Section with smooth transition */}
          <div
            ref={formRef}
            style={{
              maxHeight: showForm ? "2000px" : "0",
              overflow: "hidden",
              transition: "max-height 0.4s ease-in-out, opacity 0.3s ease-in-out",
              opacity: showForm ? 1 : 0,
            }}
          >
            {showForm && (
              <div className="card mb-4" style={{ borderColor: '#1F3C88' }}>
                <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1F3C88' }}>
                  <h5 className="mb-0">
                    {isEditMode ? "Update Asset" : "Add New Asset"}
                  </h5>
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={handleCancel}
                  >
                    <i className="bi bi-x-lg me-1"></i> Close
                  </button>
                </div>

                <div className="card-body">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Hidden id for update */}
                    <input type="hidden" {...register("id")} />

                    {/* Enhanced Step Tabs */}
                    <div className="d-flex align-items-center justify-content-center mb-4" style={{ gap: '0' }}>
                      {tabHeaders.map((tab, index) => {
                        const isActive = activeTab === index;
                        const isCompleted = activeTab > index;
                        return (
                          <React.Fragment key={index}>
                            <div
                              onClick={() => setActiveTab(index)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                backgroundColor: isActive ? '#1F3C88' : isCompleted ? '#e8f5e9' : '#f1f5f9',
                                color: isActive ? '#fff' : isCompleted ? '#2e7d32' : '#64748b',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.85rem',
                                transition: 'all 0.25s ease',
                                border: isActive ? '1px solid #1F3C88' : '1px solid #e2e8f0',
                                boxShadow: isActive ? '0 4px 12px rgba(31,60,136,0.2)' : 'none',
                              }}
                            >
                              <span
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: isActive ? '#fff' : isCompleted ? '#2e7d32' : '#cbd5e1',
                                  color: isActive ? '#1F3C88' : isCompleted ? '#fff' : '#64748b',
                                }}
                              >
                                {isCompleted ? '✓' : index + 1}
                              </span>
                              <span style={{ whiteSpace: 'nowrap' }}>{tab}</span>
                            </div>
                            {index < tabHeaders.length - 1 && (
                              <div
                                style={{
                                  width: '40px',
                                  height: '2px',
                                  backgroundColor: isCompleted ? '#2e7d32' : '#e2e8f0',
                                  transition: 'background-color 0.3s ease',
                                }}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                      {/* Tab 1: Location Details */}
                      <div
                        className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`}
                      >
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label>District</label>
                            <select
                              className="form-select"
                              {...register("districtId", { required: true })}
                              value={watch("districtId") || ""}
                              disabled={isDistrictLocked}
                            >
                              <option value="">Select District</option>
                              {districts?.map((district) => (
                                <option
                                  key={district.districtId}
                                  value={district.districtId}
                                >
                                  {district.districtNameHi}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Block</label>
                            <select
                              className="form-select"
                              {...register("blockId", { required: true })}
                              value={watch("blockId") || ""}
                              onChange={handleBlockChange}
                              disabled={isBlockLocked}
                            >
                              <option value="">Select Block</option>
                              {blocks?.map((block) => (
                                <option key={block.blockId} value={block.blockId}>
                                  {block.blockNameHi}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>CMTC Center</label>
                            <select
                              className="form-select"
                              value={watch("cmtcCenterId") || ""}
                              {...register("cmtcCenterId", { required: true })}
                            >
                              <option value="">Select Center</option>
                              {centers?.map((center) => (
                                <option key={center.centerId} value={center.centerId}>
                                  {center.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Tab 1 Navigation */}
                        <div className="d-flex justify-content-between mt-3">
                          <div></div>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setActiveTab(1)}
                          >
                            Next →
                          </button>
                        </div>
                      </div>

                      {/* Tab 2: Asset Details */}
                      <div
                        className={`tab-pane fade ${activeTab === 1 ? "show active" : ""}`}
                      >
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label>Asset Category</label>
                            <select
                              className="form-select"
                              {...register("assetCategoryId", { required: true })}
                              onChange={handleAssetCategoryChange}
                            >
                              <option value="">Select Category</option>
                              {assetCategories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.categoryName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Asset Name</label>
                            <select
                              className="form-select"
                              value={watch("assetMasterId") || ""}
                              {...register("assetMasterId", { required: true })}
                            >
                              <option value="">Select Asset</option>
                              {assets?.map((asset) => (
                                <option key={asset.id} value={asset.id}>
                                  {asset.assetName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Tab 2 Navigation */}
                        <div className="d-flex justify-content-between mt-3">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setActiveTab(0)}
                          >
                            ← Previous
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setActiveTab(2)}
                          >
                            Next →
                          </button>
                        </div>
                      </div>

                      {/* Tab 3: Asset Information */}
                      <div
                        className={`tab-pane fade ${activeTab === 2 ? "show active" : ""}`}
                      >
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label>Model Number</label>
                            <input
                              type="text"
                              className="form-control"
                              {...register("modelNumber")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Asset Quantity</label>
                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              {...register("assetQuantity")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Company Name</label>
                            <input
                              type="text"
                              className="form-control"
                              {...register("companyName")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Purchase Date & Year</label>
                            <input
                              type="text"
                              className="form-control"
                              {...register("purchaseDateAndYear")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Bill Number</label>
                            <input
                              type="text"
                              className="form-control"
                              {...register("billNumber")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Register Asset Serial Number</label>
                            <input
                              type="text"
                              className="form-control"
                              {...register("registerAssetSerialNumber")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Asset Code Number</label>
                            <input
                              type="text"
                              className="form-control"
                              {...register("assetCodeNumber")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Per Unit Price</label>
                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              {...register("perUnitPrice")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Total Price</label>
                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              {...register("totalPrice")}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Purchase Photo</label>
                            <input
                              type="file"
                              className="form-control"
                              {...register("purchasePhoto")}
                            />
                          </div>
                        </div>

                        {/* Tab 3 Navigation + Form Action Buttons */}
                        <div className="d-flex justify-content-between mt-3">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setActiveTab(1)}
                          >
                            ← Previous
                          </button>
                          <div>
                            <button type="submit" className="btn btn-primary btn-sm me-2">
                              {isEditMode ? "Update" : "Save"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm me-2"
                              onClick={() => {
                                reset();
                                loadInitialData();
                              }}
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Inventory Table - Always Visible */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>Asset Inventory Details</h5>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>District</th>
                      <th>Block</th>
                      <th>CMTC Center</th>
                      <th>Asset Category</th>
                      <th>Asset Name</th>
                      <th>Quantity</th>
                      <th>Company</th>
                      <th>Total Price</th>
                      <th>Photo</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {inventoryList?.length > 0 ? (
                      inventoryList.map((row, index) => (
                        <tr key={row.id}>
                          <td>{index + 1}</td>
                          <td>{row.districtName}</td>
                          <td>{row.blockName}</td>
                          <td>{row.cmtcCenterName}</td>
                          <td>{row.assetCategoryName}</td>
                          <td>{row.assetName}</td>
                          <td>{row.assetQuantity}</td>
                          <td>{row.companyName}</td>
                          <td>{row.totalPrice}</td>
                          <td>
                            {row.purchasePhoto ? (
                              <img
                                src={`${import.meta.env.VITE_BASE_URL}${row.purchasePhoto}`}
                                alt="Asset"
                                width="60"
                                height="60"
                                style={{
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEdit(row)}
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center">
                          No Records Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;
