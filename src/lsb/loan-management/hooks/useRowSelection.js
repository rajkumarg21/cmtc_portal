import { useState } from "react";

const useRowSelection = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = (rows) => {
    if (selectedRows.length === rows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(rows.map((r) => r.id));
    }
  };

  const clearSelection = () => {
    setSelectedRows([]);
  };

  return {
    selectedRows,
    toggleRow,
    toggleAll,
    clearSelection,
  };
};

export default useRowSelection;