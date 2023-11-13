import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "./context/AuthenticationContext";
import { Navbar, Nav } from "react-bootstrap";

export default function HeaderAdmin() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuthentication();
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch {
      setError("Failed to logout!");
    }
  }

  async function handleAbout() {
    navigate("/");
  }

  async function updateProfile() {
    navigate("/update-profile");
  }

  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        bg="dark"
        variant="dark"
        width="100%"
        sticky="top"
        style={{
          paddingLeft: "1rem",
          boxShadow: "0px 0px 10px rgb(0,0,0, 0.5)",
        }}
      >
        <Navbar.Brand className="d-flex" onClick={handleAbout}>
          <span>ClickBuyIT</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link className="link-light" onClick={handleAbout}>
              Vezi ca și utilizator
            </Nav.Link>
            <Nav.Link className="link-light" onClick={updateProfile}>
              {currentUser.email}
            </Nav.Link>
            <Nav.Link className="link-light" onClick={handleLogout}>
              Ieși din cont
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
}
