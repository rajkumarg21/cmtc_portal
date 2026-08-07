import React, { useEffect, useState } from "react";
import { getAllInventory, getInventoryByCenter } from "./inventory_service/assetInventoryService";
import { useParams } from "react-router-dom";

const InventoryReport = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { centerId } = useParams();

  useEffect(() => {
    if(centerId){
loadInventory();
    }
    
  }, [centerId]);

  const loadInventory = async () => {
    try {
      setLoading(true);

      // const response = await getAllInventory();
 const response = await getInventoryByCenter(centerId);
      console.log(response.data);

      setInventoryList(response.data);
    } catch (error) {
      console.error("Inventory Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h5>Loading...</h5>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header">
          <h4 className="mb-0">CMTC Asset Inventory Report</h4>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table  table-striped table-hover">
              <thead>
                <tr style={{
      background: "#155a55",
      
     
      }}>
                  <th style={{ background: "#155a55", color: "white" }}>S.No.</th>
                  <th style={{ background: "#155a55", color: "white" }}>District</th>
                  <th style={{ background: "#155a55", color: "white" }}>Block</th>
                  <th style={{ background: "#155a55", color: "white" }}>CMTC Center</th>
                  <th style={{ background: "#155a55", color: "white" }}>Asset Category</th>
                  <th style={{ background: "#155a55", color: "white" }}>Asset Name</th>
                  <th style={{ background: "#155a55", color: "white" }}>Company</th>
                  <th style={{ background: "#155a55", color: "white" }}>Qty</th>
                  <th style={{ background: "#155a55", color: "white" }}>Per Unit Price</th>
                  <th style={{ background: "#155a55", color: "white" }}>Total Price</th>
                  <th style={{ background: "#155a55", color: "white" }}>Purchase Date</th>
                  <th style={{ background: "#155a55", color: "white" }}>Photo</th>
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
                      <td>{row.companyName}</td>
                      <td>{row.assetQuantity}</td>
                      <td>{row.perUnitPrice}</td>
                      <td>{row.totalPrice}</td>
                      <td>{row.purchaseDateAndYear}</td>

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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center">
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
  );
};
export default InventoryReport;

