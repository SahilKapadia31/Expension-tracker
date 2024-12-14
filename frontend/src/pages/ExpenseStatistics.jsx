import React, { useEffect, useState } from "react";
import { fetchExpenses } from "../api/api";
import {
  LineChart,
  PieChart,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";

const ExpenseStatistics = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAllMonths = () => [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const getExpenses = async () => {
      try {
        const data = await fetchExpenses({ page: 1, limit: 10 });
        setExpenses(data.expenses || []);
        setFilteredExpenses(data.expenses || []);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Failed to fetch expenses.");
      } finally {
        setLoading(false);
      }
    };
    getExpenses();
  }, []);

  const filterExpenses = () => {
    let filtered = expenses;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (expense) => expense.category === selectedCategory
      );
    }
    if (selectedMonth !== "all") {
      filtered = filtered.filter((expense) => {
        const month = new Date(expense.date).toLocaleString("default", {
          month: "long",
        });
        return month === selectedMonth;
      });
    }
    setFilteredExpenses(filtered);
  };

  useEffect(() => {
    filterExpenses();
  }, [selectedCategory, selectedMonth, expenses]);

  const expenseByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(expenseByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const monthlyExpenses = filteredExpenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleString("default", {
      month: "long",
    });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {});

  const allMonths = getAllMonths();
  const monthlyData = allMonths.map((month) => ({
    name: month,
    total: monthlyExpenses[month] || 0,
  }));

  const COLORS = [
    "#0066CC",
    "#3385D6",
    "#66A3E0",
    "#99C2EB",
    "#CCE0F5",
    "#E6F3FF",
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto mt-8 text-blue-900 bg-white">
      <h1 className="mb-8 text-3xl font-bold text-center">Expense Statistics</h1>

      <div className="flex justify-center mb-8">
        <div className="mx-2">
          <label className="block mb-2 font-semibold">Filter by Category</label>
          <select
            className="p-2 border border-blue-300 rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {Object.keys(expenseByCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mx-2">
          <label className="block mb-2 font-semibold">Filter by Month</label>
          <select
            className="p-2 border border-blue-300 rounded-md"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {getAllMonths().map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 mb-10 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Expenses by Category
        </h2>
        <div className="w-full h-80">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  label
                  labelLine={false}
                  outerRadius={120}
                  cx="50%"
                  cy="50%"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              No expenses available for the selected category.
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Expenses Over Time (Monthly)
        </h2>
        <div className="w-full h-80">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CCE0F5" />
                <XAxis dataKey="name" stroke="#0066CC">
                  <Label value="Month" offset={-10} position="insideBottom" />
                </XAxis>
                <YAxis stroke="#0066CC">
                  <Label value="Total ($)" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#0066CC"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              No expenses available for the selected month.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseStatistics;