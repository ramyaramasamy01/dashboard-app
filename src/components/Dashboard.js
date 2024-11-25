import React, { useState, useMemo, useCallback } from "react";
import { BubbleChart, Bubble, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import { FixedSizeList as List } from "react-window";
import "./Dashboard.css"; // For responsive styling
 
const Dashboard = () => {
  // Sample Data
  const rawData = [
    { id: 1, category: "A", x: 10, y: 20, size: 100 },
    { id: 2, category: "B", x: 30, y: 40, size: 300 },
    { id: 3, category: "C", x: 50, y: 60, size: 500 },
    
  ];
 
  // State
  const [filteredData, setFilteredData] = useState(rawData);
  const [selectedBubble, setSelectedBubble] = useState(null);
 
  // Handlers
  const handleBubbleClick = (data) => {
    setSelectedBubble(data.category);
    setFilteredData(rawData.filter((item) => item.category === data.category));
  };
 
  const handleResetFilter = () => {
    setSelectedBubble(null);
    setFilteredData(rawData);
  };
 
  // Grid Columns
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "x", headerName: "X Value", type: "number", width: 110, sortable: true },
    { field: "y", headerName: "Y Value", type: "number", width: 110, sortable: true },
    { field: "size", headerName: "Size", type: "number", width: 150, sortable: true },
  ];
 
  return (
    <div className="dashboard">
      {/* Responsive Bubble Chart */}
      <div className="chart-container">
        <h2>Bubble Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BubbleChart
            data={filteredData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <XAxis dataKey="x" name="X Axis" />
            <YAxis dataKey="y" name="Y Axis" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Bubble
              dataKey="size"
              name="Size Metric"
              fill="#8884d8"
              onClick={handleBubbleClick}
            />
          </BubbleChart>
        </ResponsiveContainer>
        {selectedBubble && (
          <button onClick={handleResetFilter} className="reset-button">
            Reset Filter
          </button>
        )}
      </div>
 
      {/* Data Grid */}
      <div className="grid-container">
        <h2>Data Grid</h2>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection
          autoHeight
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};
 
export default Dashboard;