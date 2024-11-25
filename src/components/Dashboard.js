import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import '../styles/Dashboard.css';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Sample data structure
const generateSampleData = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    company: `Company ${i + 1}`,
    revenue: Math.floor(Math.random() * 900000) + 100000,
    employees: Math.floor(Math.random() * 950) + 50,
    profit: Math.floor(Math.random() * 90000) + 10000,
    x: Math.floor(Math.random() * 950) + 50,
    y: Math.floor(Math.random() * 900000) + 100000,
  }));
};

const Dashboard = () => {
  const [data, setData] = useState(() => generateSampleData(50));
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    revenueRange: [100000, 1000000],
    searchTerm: '',
    selectedBubble: null
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const debouncedSearchTerm = useDebounce(searchInput, 300);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      searchTerm: debouncedSearchTerm
    }));
  }, [debouncedSearchTerm]);

  const handleRegenerateData = useCallback(() => {
    setData(generateSampleData(50));
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.company.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesRevenue = item.revenue >= filters.revenueRange[0] && 
                            item.revenue <= filters.revenueRange[1];
      const matchesBubble = filters.selectedBubble ? 
                           item.id === filters.selectedBubble : true;
      
      return matchesSearch && matchesRevenue && matchesBubble;
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p className="tooltip-title">{data.company}</p>
          <p>Employees: {data.x.toLocaleString()}</p>
          <p>Revenue: ${data.y.toLocaleString()}</p>
          <p>Profit: ${data.profit.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Filters</h2>
          <button
            onClick={handleRegenerateData}
            className="button primary"
          >
            Regenerate Data
          </button>
        </div>
        <div className="card-content">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <p className="range-label">
              Revenue Range: ${filters.revenueRange[0].toLocaleString()} - ${filters.revenueRange[1].toLocaleString()}
            </p>
            <input
              type="range"
              min="100000"
              max="1000000"
              step="10000"
              value={filters.revenueRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                revenueRange: [prev.revenueRange[0], parseInt(e.target.value)]
              }))}
              className="range-input"
            />
          </div>
        </div>
      </div>

      {/* Bubble Chart */}
      <div className="dashboard-card">
        <h2>Revenue vs Employees Bubble Chart</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis
                dataKey="x"
                name="Employees"
                unit=" emp"
                type="number"
                domain={[0, 1000]}
              />
              <YAxis
                dataKey="y"
                name="Revenue"
                unit="K"
                type="number"
                domain={[0, 1000000]}
              />
              <ZAxis
                dataKey="profit"
                range={[400, 1000]}
                name="Profit"
                unit="K"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={sortedData}
                fill="#8884d8"
                cursor="pointer"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Grid */}
      <div className="dashboard-card">
        <h2>Company Data ({sortedData.length} results)</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {['company', 'revenue', 'employees', 'profit'].map(key => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`sortable-header ${sortConfig.key === key ? 'sorted' : ''}`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map(item => (
                <tr
                  key={item.id}
                  className={filters.selectedBubble === item.id ? 'selected' : ''}
                >
                  <td>{item.company}</td>
                  <td>${item.revenue.toLocaleString()}</td>
                  <td>{item.employees.toLocaleString()}</td>
                  <td>${item.profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;