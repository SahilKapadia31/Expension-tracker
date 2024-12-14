import React, { useContext, useEffect, useState } from "react";
import { fetchExpenses, updateExpense, deleteExpenses } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import ReactPaginate from "react-paginate";

const MyExpenses = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({
    category: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const getExpenses = async () => {
      try {
        const response = await fetchExpenses({
          page: page + 1, // Adjust to match backend's 1-based page index
          limit: itemsPerPage,
        });

        if (response.expenses.length === 0 && page > 0) {
          setPage(0);
        } else {
          setExpenses(response.expenses);
          setTotalPages(Math.ceil((response.totalExpenses || 0) / itemsPerPage));
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    getExpenses();
  }, [page]);

  const handlePageChange = ({ selected }) => setPage(selected);

  const handleEditClick = (expense) => {
    setEditExpenseId(expense._id);
    setEditedData({ ...expense });
  };

  const handleSaveClick = async (id) => {
    try {
      await updateExpense(id, editedData);
      setEditExpenseId(null);
      setExpenses((prev) => prev.map((e) => (e._id === id ? editedData : e)));
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (expenseId) => {
    setSelectedExpenses((prev) =>
      prev.includes(expenseId)
        ? prev.filter((id) => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedExpenses.length) {
      alert("Please select at least one expense to delete.");
      return;
    }

    try {
      await deleteExpenses(selectedExpenses);
      setExpenses((prev) =>
        prev.filter((expense) => !selectedExpenses.includes(expense._id))
      );
      setSelectedExpenses([]);
    } catch (error) {
      console.error("Error deleting expenses", error);
    }
  };

  const handleSingleDelete = async (expenseId) => {
    try {
      await deleteExpenses([expenseId]);
      setExpenses((prev) => prev.filter((expense) => expense._id !== expenseId));
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const { category, paymentMethod, startDate, endDate } = filter;
    return (
      (!startDate || new Date(expense.date) >= new Date(startDate)) &&
      (!endDate || new Date(expense.date) <= new Date(endDate)) &&
      (!category || expense.category.toLowerCase().includes(category.toLowerCase())) &&
      (!paymentMethod || expense.paymentMethod.toLowerCase().includes(paymentMethod.toLowerCase())) &&
      (!searchQuery || expense.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container p-6 mx-auto text-blue-900 bg-white">
      <h1 className="mb-6 text-4xl font-bold text-center">My Expenses</h1>

      {/* Search and Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border-2 border-blue-300 rounded-md"
        />

        <input
          type="text"
          name="category"
          placeholder="Filter by Category"
          value={filter.category}
          onChange={handleFilterChange}
          className="w-full p-2 border-2 border-blue-300 rounded-md"
        />

        <input
          type="text"
          name="paymentMethod"
          placeholder="Filter by Payment Method"
          value={filter.paymentMethod}
          onChange={handleFilterChange}
          className="w-full p-2 border-2 border-blue-300 rounded-md"
        />

        <input
          type="date"
          name="startDate"
          value={filter.startDate}
          onChange={handleFilterChange}
          className="w-full p-2 border-2 border-blue-300 rounded-md"
        />

        <input
          type="date"
          name="endDate"
          value={filter.endDate}
          onChange={handleFilterChange}
          className="w-full p-2 border-2 border-blue-300 rounded-md"
        />
      </div>

      {/* Expenses Table */}
      <table className="w-full bg-white rounded-md shadow-md table-auto">
        <thead>
          <tr className="text-white bg-blue-500">
            <th className="px-4 py-2">Select</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Payment Method</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((expense) => (
            <tr
              key={expense._id}
              className="transition duration-300 border-b hover:bg-blue-100"
            >
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedExpenses.includes(expense._id)}
                  onChange={() => handleCheckboxChange(expense._id)}
                />
              </td>
              <td className="px-4 py-2">
                {editExpenseId === expense._id ? (
                  <input
                    type="text"
                    name="description"
                    value={editedData.description}
                    onChange={handleInputChange}
                    className="p-2 border border-blue-300 rounded-md"
                  />
                ) : (
                  expense.description
                )}
              </td>
              <td className="px-4 py-2">
                {editExpenseId === expense._id ? (
                  <input
                    type="number"
                    name="amount"
                    value={editedData.amount}
                    onChange={handleInputChange}
                    className="p-2 border border-blue-300 rounded-md"
                  />
                ) : (
                  `$${expense.amount}`
                )}
              </td>
              <td className="px-4 py-2">
                {editExpenseId === expense._id ? (
                  <input
                    type="text"
                    name="category"
                    value={editedData.category}
                    onChange={handleInputChange}
                    className="p-2 border border-blue-300 rounded-md"
                  />
                ) : (
                  expense.category
                )}
              </td>
              <td className="px-4 py-2">
                {new Date(expense.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{expense.paymentMethod}</td>
              <td className="flex px-4 py-2 space-x-2">
                {editExpenseId === expense._id ? (
                  <>
                    <button
                      className="px-4 py-1 text-white bg-blue-500 rounded-md hover:bg-blue-700"
                      onClick={() => handleSaveClick(expense._id)}
                    >
                      Save
                    </button>
                    <button
                      className="px-4 py-1 text-white bg-gray-400 rounded-md hover:bg-gray-600"
                      onClick={() => setEditExpenseId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-4 py-1 text-white bg-yellow-400 rounded-md hover:bg-yellow-600"
                      onClick={() => handleEditClick(expense)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-1 text-white bg-red-500 rounded-md hover:bg-red-700"
                      onClick={() => handleSingleDelete(expense._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 pagination">
        <button
          className="px-4 py-2 mx-2 text-white bg-blue-300 rounded-md hover:bg-blue-500"
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
        >
          Previous
        </button>

        <ReactPaginate
          previousLabel={null}
          nextLabel={null}
          pageCount={totalPages}
          onPageChange={handlePageChange}
          forcePage={page}
          containerClassName={"pagination flex space-x-2"}
          activeClassName={"bg-blue-500 text-white px-4 py-2 rounded-md"}
        />

        <button
          className="px-4 py-2 mx-2 text-white bg-blue-300 rounded-md hover:bg-blue-500"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={page === totalPages - 1}
        >
          Next
        </button>
      </div>

      {/* Bulk Delete Button */}
      <div className="flex justify-center mt-6">
        <button
          className="px-6 py-3 text-white bg-red-600 rounded-md hover:bg-red-700"
          onClick={handleBulkDelete}
          disabled={!selectedExpenses.length}
        >
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default MyExpenses;