import { Link } from "react-router-dom";

const AdminHeader = () => {
  return (
    <header className="bg-white shadow-md p-1 flex items-center">
      <div className="container mx-auto flex justify-center">
        <Link to="http://localhost:5173/">
          <img
            src="/logo.png"
            alt="logo"
            className="object-contain hover:opacity-90 transition duration-200"
          />
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;