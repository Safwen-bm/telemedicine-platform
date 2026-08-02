import { Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout"; // Main app layout with 
import AdminLayout from "../layout/AdminLayout"; // Admin layout without 
import Home from "../pages/Home";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Doctors from "../pages/Doctors/Doctors";
import DoctorDetails from "../pages/Doctors/DoctorDetails";
import MyAccount from "../Dashboard/user-account/MyAccount";
import Dashboard from "../Dashboard/doctor-account/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import CheckoutSuccessPage from "../pages/CheckoutSuccessPage";
import AdminDashboard from "../Dashboard/Admin/AdminDashboard";
import Patients from "../Dashboard/Admin/Patients";
import Bookings from "../Dashboard/Admin/Bookings";
import AdminLogin from "../Dashboard/Admin/AdminLogin";
import AdminDoctors from "../Dashboard/Admin/AdminDoctors";
import ConsultationRoom from "../pages/Consultation/ConsultationRoom";
import MedicalFolder from "../Dashboard/user-account/MedicalFolder";
import PatientMedicalFolder from "../Dashboard/doctor-account/PatientMedicalFolder";
import AdminAnalytics from "../Dashboard/Admin/AdminAnalytics";

const Routers = () => {
  return (
    <Routes>
      {/* Public Routes with Header/Footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/checkout-session" element={<CheckoutSuccessPage />} />
        <Route path="/consultation/:bookingId" element={<ConsultationRoom />} />
        <Route
          path="/users/profile/me"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <MyAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors/profile/me"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors/medical-folder/:patientId"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <PatientMedicalFolder />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Login Route (No Layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Routes without Header/Footer */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
};

export default Routers;