import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addExpense, bulkAddExpenses } from "../api/api";

const AddExpense = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    paymentMethod: "cash", // Default payment method
    date: "",
  });
  const [csvFile, setCsvFile] = useState(null); // State to store CSV file
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle individual input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]); // Store the uploaded CSV file
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset errors on submit

    if (csvFile) {
      // Handle bulk CSV upload
      const bulkFormData = new FormData();
      bulkFormData.append("file", csvFile);

      try {
        await bulkAddExpenses(bulkFormData);
        navigate("/"); // Redirect to the MyExpenses page
      } catch (error) {
        console.error("Error uploading CSV file:", error);
        setError("Failed to upload CSV. Please try again.");
      }
    } else {
      // Handle single expense entry
      if (!formData.amount || !formData.description || !formData.date) {
        setError("Please fill in all required fields.");
        return;
      }

      try {
        await addExpense(formData);
        navigate("/"); // Redirect to the MyExpenses page
      } catch (error) {
        console.error("Error adding expense:", error);
        setError("Failed to add expense. Please try again.");
      }
    }
  };

  return (
    <div className="container max-w-lg p-6 mx-auto mt-8 bg-white rounded-lg shadow-lg">
      <h1 className="mb-6 text-3xl font-bold text-center text-blue-700">
        Add Expense
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display error messages */}
        {error && (
          <p className="p-3 text-red-600 bg-red-100 border border-red-300 rounded-md">
            {error}
          </p>
        )}

        {/* Amount Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full p-3 text-blue-900 border border-blue-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter amount"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-3 text-blue-900 border border-blue-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter description"
          />
        </div>

        {/* Category Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-3 text-blue-900 border border-blue-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter category"
          />
        </div>

        {/* Payment Method Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="w-full p-3 text-blue-900 border border-blue-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        {/* Date Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-3 text-blue-900 border border-blue-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* CSV Upload Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Upload CSV for Bulk Expenses
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full p-3 text-blue-900 border border-blue-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
        >
          {csvFile ? "Upload CSV" : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
