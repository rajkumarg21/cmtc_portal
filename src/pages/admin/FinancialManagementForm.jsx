import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addCmtcDetails } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";
import {
  getCentersByBlock,
  getCentersByDistrict,
} from "../../services/cmtcCenterService";
import { useTranslation } from "react-i18next";

const defaultValues = {
  cmtcCentersId: "",
  paymentAmountForFoodPreparation: "",
  paymentAmountForMaterialPurchase: "",
  paymentAmountForServices: "",
  paymentAmountToCommunityTrainers: "",
  totalNetSavingsAmount: "",
  availableAmountInClfBankAccount: "",
  availableAmountInCmtcSubAccount: "",
  fdAmountAndDate: "",
  totalAmountReceivedForCmtcEstablishment: "",
  totalExpenseAmountTill31March2026: "",
  totalRemainingAmountTill31March2026: "",
  amountGivenToCmtcManager: "",
  amountGivenToCmtcAccountant: "",
  typeOfAccountantPayment: "",
  accountantPaymentAmount: "",
  typeOfManagerPayment: "",
  managerPaymentAmount: "",
  typeOfGuardOrWatchmanPayment: "",
  guardOrWatchmanPaymentAmount: "",
  totalExpenseAmountByCmtc: "",
  totalWorkingDays: "",
  totalNumberOfPrograms: "",
  totalNumberOfBeneficiaries: "",
  totalWorkingDaysIn202526: "",
  totalNumberOfProgramsIn202526: "",
  totalNumberOfBeneficiariesIn202526: "",
};



export default function FinancialManagementForm() {
  //  const { user, userRole } = useAuth();
  //  console.log("user:",user," role :",userRole);
  const { t } = useTranslation();
  const { user } = useAuth();
  console.log("user:", user);

  const [centers, setCenters] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const numberValidation = {
    required: "This field is required",
    valueAsNumber: true,
    min: { value: 0, message: "Value cannot be negative" },
  };

  const onSubmit = async (data) => {
    try {
      const res = await addCmtcDetails(data);

      alert(res.message);
      reset();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong.");
    }
  };

  useEffect(() => {
    if (user) {
      loadCenters();
    }
  }, [user]);

  const loadCenters = async () => {
    try {
      let response;

      if (user.role === "DISTRICT_OFFICER") {
        response = await getCentersByDistrict(user.districtId);
        //  console.log(response)
        // console.log(response.data);
      } else if (user.role === "BLOCK_OFFICER") {
        response = await getCentersByBlock(user.blockId);
        // console.log(response);
      } else {
        return;
      }

      setCenters(response.data || []);
    } catch (error) {
      console.error("Failed to load centers", error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">
            {/* Financial Information */}
             {t("financial.title")}
          </h4>
        </div>
        <div className="card-body">
          {/* <form onSubmit={handleSubmit(onSubmit || console.log)}> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">
                {/* CMTC Center */}
                {t("financial.cmtcCenter")}
                <span className="text-danger">*</span>
              </label>
              {console.log("Centers:", centers)}
              <select
                className={`form-select ${errors.cmtcCentersId ? "is-invalid" : ""}`}
                {...register("cmtcCentersId", {
                  required: "Please select CMTC Center",
                })}
              >
                <option value="">Select CMTC Center</option>
                {centers.map((center) => (
                  <option key={center.centerId} value={center.centerId}>
                    {center.name}
                  </option>
                ))}
              </select>

              <div className="invalid-feedback">
                {errors.cmtcCentersId?.message}
              </div>
            </div>
            <div className="row">
              {/* {fields.map(([name, label, type]) => (
                <div className="col-md-6 mb-3" key={name}>
                  <label className="form-label fw-bold">{label}</label>
                  <input
                    type={type}
                    className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                    {...register(
                      name,
                      type === "number" ? numberValidation : {},
                    )}
                  />
                  <div className="invalid-feedback">
                    {errors[name]?.message}
                  </div>
                </div>
              ))} */}

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* भोजन तैयारी हेतु भुगतान राशि */}
                  {t("financial.foodPreparationAmount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.paymentAmountForFoodPreparation ? "is-invalid" : ""}`}
                  {...register(
                    "paymentAmountForFoodPreparation",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.paymentAmountForFoodPreparation?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सामग्री क्रय हेतु भुगतान राशि */}
                  {t("financial.materialPurchaseAmount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.paymentAmountForMaterialPurchase ? "is-invalid" : ""}`}
                  {...register(
                    "paymentAmountForMaterialPurchase",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.paymentAmountForMaterialPurchase?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सेवाओं हेतु भुगतान राशि */}
                   {t("financial.servicesAmount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.paymentAmountForServices ? "is-invalid" : ""}`}
                  {...register(
                    "paymentAmountForServices",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.paymentAmountForServices?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सामुदायिक प्रशिक्षकों को भुगतान राशि */}
                   {t("financial.communityTrainerPayment")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.paymentAmountToCommunityTrainers ? "is-invalid" : ""}`}
                  {...register(
                    "paymentAmountToCommunityTrainers",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.paymentAmountToCommunityTrainers?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                    {/* कुल शुद्ध बचत राशि */}
                     {t("financial.totalNetSavingsAmount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalNetSavingsAmount ? "is-invalid" : ""}`}
                  {...register(
                    "totalNetSavingsAmount",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalNetSavingsAmount?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सीएलएफ बैंक खाते में उपलब्ध राशि */}
                  {t("financial.availableAmountInClfBankAccount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.availableAmountInClfBankAccount ? "is-invalid" : ""}`}
                  {...register(
                    "availableAmountInClfBankAccount",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.availableAmountInClfBankAccount?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सीएमटीसी उप खाते में उपलब्ध राशि */}
                   {t("financial.availableAmountInCmtcSubAccount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.availableAmountInCmtcSubAccount ? "is-invalid" : ""}`}
                  {...register(
                    "availableAmountInCmtcSubAccount",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.availableAmountInCmtcSubAccount?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* एफडी राशि एवं दिनांक */}
                   {t("financial.fdAmountAndDate")}
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.fdAmountAndDate ? "is-invalid" : ""}`}
                  {...register("fdAmountAndDate")}
                />
                <div className="invalid-feedback">
                  {errors.fdAmountAndDate?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सीएमटीसी स्थापना हेतु प्राप्त कुल राशि */}
                   {t("financial.totalAmountReceivedForCmtcEstablishment")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalAmountReceivedForCmtcEstablishment ? "is-invalid" : ""}`}
                  {...register(
                    "totalAmountReceivedForCmtcEstablishment",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalAmountReceivedForCmtcEstablishment?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* 31 मार्च 2026 तक कुल व्यय */}
                  {t("financial.totalExpenseAmountTill31March2026")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalExpenseAmountTill31March2026 ? "is-invalid" : ""}`}
                  {...register(
                    "totalExpenseAmountTill31March2026",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalExpenseAmountTill31March2026?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* 31 मार्च 2026 तक शेष राशि */}
                {t("financial.totalRemainingAmountTill31March2026")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalRemainingAmountTill31March2026 ? "is-invalid" : ""}`}
                  {...register(
                    "totalRemainingAmountTill31March2026",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalRemainingAmountTill31March2026?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सीएमटीसी प्रबंधक को दी गई राशि */}
                    {t("financial.amountGivenToCmtcManager")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.amountGivenToCmtcManager ? "is-invalid" : ""}`}
                  {...register(
                    "amountGivenToCmtcManager",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.amountGivenToCmtcManager?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सीएमटीसी लेखाकार को दी गई राशि */}
                   {t("financial.amountGivenToCmtcAccountant")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.amountGivenToCmtcAccountant ? "is-invalid" : ""}`}
                  {...register(
                    "amountGivenToCmtcAccountant",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.amountGivenToCmtcAccountant?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* लेखाकार भुगतान राशि */}
                   {t("financial.accountantPaymentAmount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.accountantPaymentAmount ? "is-invalid" : ""}`}
                  {...register(
                    "accountantPaymentAmount",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.accountantPaymentAmount?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* प्रबंधक भुगतान राशि */}
                   {t("financial.managerPaymentAmount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.managerPaymentAmount ? "is-invalid" : ""}`}
                  {...register(
                    "managerPaymentAmount",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.managerPaymentAmount?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* गार्ड/चौकीदार भुगतान राशि */}
                  {t("financial.guardPaymentAmount")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.guardOrWatchmanPaymentAmount ? "is-invalid" : ""}`}
                  {...register(
                    "guardOrWatchmanPaymentAmount",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.guardOrWatchmanPaymentAmount?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* सीएमटीसी द्वारा कुल व्यय */}
                  {t("financial.totalExpenseAmountByCmtc")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalExpenseAmountByCmtc ? "is-invalid" : ""}`}
                  {...register(
                    "totalExpenseAmountByCmtc",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalExpenseAmountByCmtc?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                    {/* कुल कार्य दिवस */}
                    {t("financial.totalWorkingDays")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalWorkingDays ? "is-invalid" : ""}`}
                  {...register(
                    "totalWorkingDays",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalWorkingDays?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                    {/* कुल कार्यक्रम */}
                    {t("financial.totalNumberOfPrograms")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalNumberOfPrograms ? "is-invalid" : ""}`}
                  {...register(
                    "totalNumberOfPrograms",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalNumberOfPrograms?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                    {/* कुल लाभार्थी */}
                    {t("financial.totalNumberOfBeneficiaries")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalNumberOfBeneficiaries ? "is-invalid" : ""}`}
                  {...register(
                    "totalNumberOfBeneficiaries",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalNumberOfBeneficiaries?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* 2025-26 कुल कार्य दिवस */}
                   {t("financial.totalWorkingDaysIn202526")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalWorkingDaysIn202526 ? "is-invalid" : ""}`}
                  {...register(
                    "totalWorkingDaysIn202526",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalWorkingDaysIn202526?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* 2025-26 कुल कार्यक्रम */}
                   {t("financial.totalNumberOfProgramsIn202526")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalNumberOfProgramsIn202526 ? "is-invalid" : ""}`}
                  {...register(
                    "totalNumberOfProgramsIn202526",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalNumberOfProgramsIn202526?.message}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  {/* 2025-26 कुल लाभार्थी */}
                   {t("financial.totalNumberOfBeneficiariesIn202526")}
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.totalNumberOfBeneficiariesIn202526 ? "is-invalid" : ""}`}
                  {...register(
                    "totalNumberOfBeneficiariesIn202526",
                    { number: numberValidation }.number && numberValidation,
                  )}
                />
                <div className="invalid-feedback">
                  {errors.totalNumberOfBeneficiariesIn202526?.message}
                </div>
              </div>

              {[
                // ["typeOfAccountantPayment", "Accountant Payment Type"],
                // ["typeOfManagerPayment", "Manager Payment Type"],
                // ["typeOfGuardOrWatchmanPayment", "Guard/Watchman Payment Type"],
                ["typeOfAccountantPayment", "financial.accountantPaymentType"],
                ["typeOfManagerPayment", "financial.managerPaymentType"],
                ["typeOfGuardOrWatchmanPayment", "financial.guardPaymentType"],
              ].map(([name, label]) => (
                <div className="col-md-6 mb-3" key={name}>
                  <label className="form-label fw-bold">{t(label)}</label>
                  <select
                    className={`form-select ${errors[name] ? "is-invalid" : ""}`}
                    {...register(name, {
                      required: "Please select payment type",
                    })}
                  >
                    <option value="">Select</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div className="invalid-feedback">
                    {errors[name]?.message}
                  </div>
                </div>
              ))}

              <div className="col-12 text-end">
                <button type="submit" className="btn btn-success px-4">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
