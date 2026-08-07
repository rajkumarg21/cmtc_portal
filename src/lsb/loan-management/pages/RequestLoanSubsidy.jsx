import { Box, Button } from "@mui/material";
import LoanSubsidyForm from "../components/LoanSubsidyForm";

const RequestLoanSubsidy = () => {
  return (<>
   {/* Download Template */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Button
            variant="contained"
            color="success"
            component="a"
            href={`${import.meta.env.BASE_URL}templates/loan_subsidy_template.xlsx`}
            download
          >
            Download Template
          </Button>
      </Box>
      <LoanSubsidyForm />
  </>)
  // return <LoanSubsidyForm />;
};

export default RequestLoanSubsidy;