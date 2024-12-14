import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-md">
      <nav className="container flex items-center justify-between px-6 py-4 mx-auto">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/" className="transition duration-300 hover:text-blue-700">
            Expense Tracker
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-6">
          {user ? (
            <>
              <li>
                <Link
                  to="/"
                  className="text-blue-600 transition duration-300 hover:text-blue-700"
                  title="View My Expenses"
                >
                  My Expenses
                </Link>
              </li>
              <li>
                <Link
                  to="/add-expense"
                  className="text-blue-600 transition duration-300 hover:text-blue-700"
                  title="Add a New Expense"
                >
                  Add Expense
                </Link>
              </li>
              <li>
                <Link
                  to="/statistics"
                  className="text-blue-600 transition duration-300 hover:text-blue-700"
                  title="View Expense Statistics"
                >
                  Statistics
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-white transition duration-300 bg-blue-500 rounded shadow hover:bg-blue-600"
                  title="Logout"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="text-blue-600 transition duration-300 hover:text-blue-700"
                  title="Login to Your Account"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-blue-600 transition duration-300 hover:text-blue-700"
                  title="Create a New Account"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
