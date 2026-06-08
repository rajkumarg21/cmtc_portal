import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../services/apiService";
import { getUserById } from "../../services/userService";
import commonService from "../../services/commanService"

const ProfilePage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    role: "",
    email: "",
    fullName: "",
    mobileNo: "",

    // NEW FIELDS (Signup fields)
    mainDepartmentId: "",
    subDepartmentId: "",
    officerName: "",
    designation: "",
    authorizationLetter: null,
    authorizationLetterUrl: "",
  });

  // Dropdown data
  const [mainDepartments, setMainDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);

  // Address section (unchanged)
  const [addresses, setAddresses] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState({});
  const [districts, setDistricts] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    loadUserProfile();
    loadMainDepartments();
    fetchUserAddresses(user.id);
    fetchCountries();
  }, [user]);

  // Load User Profile + Department Mapping Data
  const loadUserProfile = async () => {
    try {
      const res = await getUserById(user.id);

      setFormData({
        username: res.username || "",
        role: res.role || "",
        email: res.email || "",
        fullName: res.fullName || "",
        mobileNo: res.mobileNo || "",

        // NEW FIELDS
       mainDepartmentId: res.departmentUser?.mainDepartmentId || "",
       subDepartmentId: res.departmentUser?.subDepartmentId || "",
       officerName: res.departmentUser?.officerName || "",
       designation: res.departmentUser?.designation || "",
       authorizationLetterUrl: res.departmentUser?.authorizationLetterPath || "",
        authorizationLetter: null,

      });

      if (res.departmentUser?.mainDepartmentId) loadSubDepartments(res.departmentUser?.mainDepartmentId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  // Load main departments
  const loadMainDepartments = async () => {
    try {
      const res = await api.get("/admin/departments/main");
      setMainDepartments(res.data || []);
    } catch {
      toast.error("Failed to load main departments");
    }
  };

  // Load sub departments
  const loadSubDepartments = async (mainId) => {
    if (!mainId) {
      setSubDepartments([]);
      return;
    }
    try {
      const res = await api.get(`/admin/departments/${mainId}/sub`);
      setSubDepartments(res.data || []);
    } catch {
      toast.error("Failed to load sub departments");
    }
  };

  // Handle profile input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "authorizationLetter") {
      setFormData((prev) => ({ ...prev, authorizationLetter: files[0] }));
      return;
    }

    if (name === "mainDepartmentId") {
      loadSubDepartments(value);
      setFormData((prev) => ({ ...prev, mainDepartmentId: value, subDepartmentId: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Profile
  const handleProfileSave = async () => {
    try {
      const multipart = new FormData();

      const { authorizationLetter, authorizationLetterUrl, ...data } = formData;
      multipart.append("data", JSON.stringify(data));

      if (authorizationLetter) {
        multipart.append("file", authorizationLetter);
      }

      await api.put(`/admin/users/profile/${user.id}`, multipart, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully!");
      loadUserProfile();
    } catch (err) {
      console.error(err);
      toast.error("Profile update failed");
    }
  };

  /* ---------------- ADDRESS SECTION (UNCHANGED) ---------------- */
  const fetchUserAddresses = async (id) => {
    try {
      const res = await api.get(`/admin/users/address/${id}`);
      const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      setAddresses(data);

      for (let addr of data) {
        if (addr.countryId) await fetchStates(addr.countryId);
        if (addr.stateId) await fetchDistricts(addr.stateId);
      }
    } catch (err) {
      console.error("Error fetching address data", err);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await api.get("/admin/users/countries");
      setCountries(res.data || []);
    } catch {}
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await api.get(`/admin/users/states/${countryId}`);
      setStates((prev) => ({ ...prev, [countryId]: res.data }));
    } catch {}
  };

  const fetchDistricts = async (stateId) => {
    try {
      const res = await  commonService.getDistrictsByState(stateId);
      setDistricts((prev) => ({ ...prev, [stateId]: res.data }));
    } catch {}
  };

  const handleAddressChange = (idx, field, value) => {
    const updated = [...addresses];
    updated[idx][field] = value;
    setAddresses(updated);

    if (field === "countryId") {
      updated[idx]["stateId"] = "";
      updated[idx]["districtId"] = "";
      fetchStates(value);
    } else if (field === "stateId") {
      updated[idx]["districtId"] = "";
      fetchDistricts(value);
    }
  };

  const handleAddAddress = () => {
    setAddresses((prev) => [
      ...prev,
      { addressLine1: "", addressLine2: "", city: "", pincode: "", countryId: "", stateId: "", districtId: "" },
    ]);
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      if (addressId) {
        await api.put(`/admin/users/address/remove/${addressId}`);
        toast.success("Address removed");
      }
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch {
      toast.error("Failed to remove address");
    }
  };

  const handleSaveAll = async () => {
    await handleProfileSave();

    try {
      await api.put(`/admin/users/address/${user.id}`, addresses);
      toast.success("Addresses updated successfully!");
      fetchUserAddresses(user.id);
    } catch {
      toast.error("Failed to update addresses");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg mt-4 mb-4">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-dark">Edit Profile</h2>

      {/* BASIC INFO */}
      <div className="row g-3">
        <div className="col-md-6">
          <InputField label="Username" name="username" value={formData.username} readOnly />
        </div>
        <div className="col-md-6">
          <InputField label="Role" name="role" value={formData.role} readOnly />
        </div>
        <div className="col-md-6">
          <InputField label="Email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className="col-md-12">
          <InputField label="Mobile No" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required />
        </div>
    </div>

      {/* DEPARTMENT INFO */}
      <h3 className="font-semibold text-lg mt-2 mb-2">Department Information</h3>
      <div className="row g-3">
        {/* Main Department */}
        <div className="col-md-6">
          <label className="block font-medium mb-1">Main Department</label>
          <select
            name="mainDepartmentId"
            value={formData.mainDepartmentId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Main Department</option>
            {mainDepartments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Department */}
         <div className="col-md-6">
          <label className="block font-medium mb-1">Sub Department</label>
          <select
            name="subDepartmentId"
            value={formData.subDepartment}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={!formData.mainDepartmentId}
          >
            <option value="">Select Sub Department</option>
            {subDepartments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* OFFICER INFO */}
      <h3 className="font-semibold text-lg mb-2 mt-2">Officer Details</h3>
      <div className="row g-3">
        <div className="col-md-6">
           <InputField label="Officer Name" name="officerName" value={formData.officerName} onChange={handleChange} />
        </div>
        <div className="col-md-6">
            <InputField label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
        </div>
      </div>

      {/* AUTHORIZATION LETTER */}
      <h3 className="font-semibold text-lg mb-2 mt-2">Authorization Letter</h3>
      <div className="row g-3">
        <div className="col-md-6">
        {formData.authorizationLetterUrl && (
          <a href={`${import.meta.env.VITE_BASE_URL}${formData.authorizationLetterUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            📄 View Uploaded Letter
          </a>
        )}
        </div>
        <div className="col-md-6">
        <input type="file" accept="application/pdf" name="authorizationLetter" onChange={handleChange} />
      </div>
      </div>
      
      {/* ADDRESS SECTION (Unchanged) */}
      <h3 className="font-semibold text-lg mb-2 mt-2">Addresses</h3>
      <button onClick={handleAddAddress} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-100 mb-2">
          + Add Address
        </button>
      {addresses.map((addr, idx) => (
        <AddressBlock
          key={idx}
          idx={idx}
          addr={addr}
          countries={countries}
          states={states}
          districts={districts}
          handleAddressChange={handleAddressChange}
          handleRemoveAddress={handleRemoveAddress}
        />
      ))}

      {/* Buttons */}
      <div className="flex gap-4 mt-6 justify-content-end">
        <button onClick={handleSaveAll} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
          💾 Save All
        </button>
      </div>
    </div>
  );
};

/* Small reusable components */
const InputField = ({ label, name, value, onChange, readOnly = false }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const AddressBlock = ({
  idx,
  addr,
  countries,
  states,
  districts,
  handleAddressChange,
  handleRemoveAddress,
}) => (
  <div className="border p-4 mb-6 rounded-lg bg-gray-50 shadow-sm">
    <div className="flex justify-between mb-4">
      <span className="font-medium">🏠 Address {idx + 1}</span>
      <button className="text-red-500" onClick={() => handleRemoveAddress(addr.id)}>
        Remove
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input address label="Address Line 1" value={addr.addressLine1} onChange={(v) => handleAddressChange(idx, "addressLine1", v)} />
      <Input address label="Address Line 2" value={addr.addressLine2} onChange={(v) => handleAddressChange(idx, "addressLine2", v)} />
      <Input address label="City" value={addr.city} onChange={(v) => handleAddressChange(idx, "city", v)} />
      <Input address label="Pincode" value={addr.pincode} onChange={(v) => handleAddressChange(idx, "pincode", v)} />

      {/* Country */}
      <select
        className="border p-2 rounded"
        value={addr.countryId}
        onChange={(e) => handleAddressChange(idx, "countryId", Number(e.target.value))}
      >
        <option value="">Select Country</option>
        {countries.map((c) => (
          <option key={c.id} value={c.id}>
            {c.countryName}
          </option>
        ))}
      </select>

      {/* State */}
      <select
        className="border p-2 rounded"
        value={addr.stateId}
        onChange={(e) => handleAddressChange(idx, "stateId", Number(e.target.value))}
      >
        <option value="">Select State</option>
        {(states[addr.countryId] || []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.stateName}
          </option>
        ))}
      </select>

      {/* District */}
      <select
        className="border p-2 rounded"
        value={addr.districtId}
        onChange={(e) => handleAddressChange(idx, "districtId", Number(e.target.value))}
      >
        <option value="">Select District</option>
        {(districts[addr.stateId] || []).map((d) => (
          <option key={d.districtId} value={d.districtId}>
            {d.districtName}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const Input = ({ label, value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input
      className="border p-2 rounded w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default ProfilePage;
