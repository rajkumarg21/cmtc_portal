import { useEffect, useState } from "react";
import api from "../../../services/apiService";

const useBanks = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBank, setSelectedBank] = useState(null);

  const [validating, setValidating] = useState(false);
  const [validationResponse, setValidationResponse] = useState(null);
  const [isValid, setIsValid] = useState(false);

  // ✅ Load banks
  const fetchBanks = async () => {
    try {
      setLoading(true);

      console.log("get banks called");
      const res = await api.get("/public/banks");
      console.log(res);
      // keep only active banks
      // const activeBanks = (res.data || []).filter(
      //   (b) => b.isActive === true
      // );

      console.log("get banks called activeBanks ", res.data);

      setBanks(res.data);
    } catch (err) {
      console.error("Bank fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("📡 fetchBanks useEffect triggered");
    fetchBanks();
    console.log(banks);
  }, []);

  // ✅ Validate bank
  const validateBank = async (bankId, role) => {
    if (!bankId) return;

    try {
      setValidating(true);

      const res = await api.post("/bank-user/public/validate", {
        bankId,
        role
      });
      
      const data = res.data;

      setValidationResponse(data);
      setIsValid(data?.valid === true);

      return data;
    } catch (err) {
      setIsValid(false);
      setValidationResponse(null);
      console.error("Bank validation error:", err);
    } finally {
      setValidating(false);
    }
  };

  // optional helper
  const resetBankState = () => {
    setSelectedBank(null);
    setValidationResponse(null);
    setIsValid(false);
  };

  useEffect(() => {
    console.log("Banks updated:", banks);
  }, [banks]);

  return {
    // data
    banks,
    loading,

    // selection
    selectedBank,
    setSelectedBank,

    // validation
    validateBank,
    validating,
    validationResponse,
    isValid,

    // utils
    resetBankState,
  };
};

export default useBanks;