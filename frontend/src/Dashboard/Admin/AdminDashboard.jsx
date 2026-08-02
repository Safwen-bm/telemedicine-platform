const AdminDashboard = () => {
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-indigo-200 pb-3">
        Welcome to Admin Dashboard
      </h2>
      <p className="text-lg text-gray-700">
        Use the sidebar to manage patients, doctors, and bookings.
      </p>
    </div>
  );
};

export default AdminDashboard;