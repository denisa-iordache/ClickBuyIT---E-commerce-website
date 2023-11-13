import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "./context/AuthenticationContext";
import { Navbar, Nav } from "react-bootstrap";
import { AiOutlineShoppingCart } from "react-icons/ai"
import { ImExit } from "react-icons/im"
import { LiaSuitcaseSolid } from "react-icons/lia"
import { ShopContext } from "./ShopContext";

export default function Header() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuthentication();
  const navigate = useNavigate();
  const { cartItems } = useContext(ShopContext)
  const [user, setUser] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch {
      setError("Failed to logout!");
    }
  }

  const getUserDetails = async () => {
    if (currentUser) {
      fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/users/${currentUser.uid}`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    getUserDetails();
  }, [currentUser]);



  async function handleAbout() {
    navigate("/");
  }

  async function handleProduse() {
    navigate("/dashboard");
  }

  async function handleFavourites() {
    navigate("/orders-history");
  }

  async function handleCart() {
    navigate("/cart");
  }

  async function updateProfile() {
    navigate("/update-profile");
  }

  async function handleLogin() {
    navigate("/signin");
  }

  async function handleSignup() {
    navigate("/signup");
  }

  async function handleAdmin() {
    navigate("/adminPage");
  }

  const getNumberOfProducts = () => {
    let count = 0
    if (Object.keys(cartItems).length > 0) {
      for (let i = 1; i < Object.keys(cartItems).length + 1; i++) {
        if (cartItems[i] !== 0) {
          if (Number(cartItems[i])) {
            count += cartItems[i];
            console.log(count)
          }

        }
      }
    }
    return count

  }

  return (
    <>
      {currentUser ? (
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
          className="d-flex"
        >
          <Navbar.Brand onClick={handleAbout}>
            <span>ClickBuyIT</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">

            {user.role === "admin" && (
              <Nav.Link className="link-light mx-2" onClick={handleAdmin}>
                Vezi ca și administrator
              </Nav.Link>
            )}
            <Nav.Link className="link-light mx-2" onClick={handleProduse}>
              Produse
            </Nav.Link>
            <Nav className="me-auto"></Nav>
            <Nav.Link className="link-light mx-2" onClick={updateProfile}>
              {currentUser.email}
            </Nav.Link>
            <Nav.Link className="link-light mx-2 d-flex align-items-center gap-1" onClick={handleFavourites}>
              <LiaSuitcaseSolid />
              Comenzile mele
            </Nav.Link>
            <Nav.Link className="link-light mx-2 d-flex align-items-center gap-1" onClick={handleCart}>
              <AiOutlineShoppingCart />
              Cos de cumparaturi <>({getNumberOfProducts()})</>
            </Nav.Link>
            <Nav.Link className="link-light mx-2 d-flex align-items-center gap-1" onClick={() => {
              handleLogout()
              setTimeout(() => {
                window.location.reload()
              }, "1000");
            }}>
              <ImExit />
              Ieși din cont
            </Nav.Link>

          </Navbar.Collapse>
        </Navbar>
      ) : (
        <Navbar
          collapseOnSelect
          expand="lg"
          bg="dark"
          variant="dark"
          width="100%"
          sticky="top"
          style={{
            paddingLeft: "4rem",
            boxShadow: "0px 0px 10px rgb(0,0,0, 0.5)",
          }}
        >
          <Navbar.Brand className="d-flex" onClick={handleAbout}>
            <span>ClickBuyIT</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav.Link className="link-light mx-2" onClick={handleProduse}>
              Produse
            </Nav.Link>
            <Nav className="me-auto"></Nav>
            <Nav.Link className="link-light mx-2" onClick={handleLogin}>
              Intră în cont
            </Nav.Link>
            <Nav.Link className="link-light d-flex align-items-center gap-1 mx-2" onClick={handleCart}>
              <AiOutlineShoppingCart />
              Cos de cumparaturi <>({getNumberOfProducts()})</>
            </Nav.Link>
          </Navbar.Collapse>
        </Navbar>
      )}
    </>
  );
}
