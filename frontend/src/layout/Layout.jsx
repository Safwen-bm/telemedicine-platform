import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Renders nested routes */}
      </main>
      <Footer />
    </>
  );
};

export default Layout;