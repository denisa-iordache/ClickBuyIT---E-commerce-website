import React from "react";
import { AuthenticationProvider } from "./components/context/AuthenticationContext";
import SignUp from "./components/SignUp";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./components/ForgotPassword";
import "react-toastify/dist/ReactToastify.css";
import SignIn from "./components/SignIn";
import AdminPage from "./components/AdminPage";
import { ShopContextProvider } from "./components/ShopContext";
import ShoppingCart from "./components/ShoppingCart";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import UpdatePofile from "./components/UpdateProfile";
import ProductPage from "./components/ProductPage";
import MyOrders from "./components/MyOrders";

function App() {
  return (
    <div className="App">
      <AuthenticationProvider>
        <ShopContextProvider>
          <PayPalScriptProvider options={{ "client-id": "AdjoEZwPXrWPeKuIWbdS65y1nS_ZNpzKPToDlsxerf6mfVGjYxgotsIjulLYcz3C2pZR7Rdpe5cg0mX7" }}>
            <Router>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <About />
                    </PrivateRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/adminPage" element={<AdminPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/cart" element={<ShoppingCart />} />
                <Route path="/update-profile" element={<UpdatePofile />} />
                <Route path="/dashboard/:productId/product" element={<ProductPage />} />
                <Route path="/orders-history" element={<MyOrders />} />
              </Routes>
            </Router>
          </PayPalScriptProvider>
        </ShopContextProvider>
      </AuthenticationProvider>
    </div>
  );
}

export default App;
