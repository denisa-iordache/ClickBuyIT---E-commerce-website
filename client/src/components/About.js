import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { Card, Carousel, Button, Image } from "react-bootstrap";

export default function About() {
  const mediaMatch = window.matchMedia("(min-width: 768px)");
  const [matches, setMatches] = useState(mediaMatch.matches);

  useEffect(() => {
    const handler = (e) => setMatches(e.matches);
    mediaMatch.addListener(handler);
    return () => mediaMatch.removeListener(handler);
  });

  const navigate = useNavigate();

  async function handleHome() {
    navigate("/dashboard");
  }

  async function handleCart() {
    navigate("/cart");
  }

  return (
    <>
      <Header />
      <div
        style={{
          position: "relative",
          zIndex: "1",
          marginBottom: "100px",
          backgroundColor: "white",
          textAlign: "center",
          minHeight: "100vh",
        }}
        className="shadow-lg d-flex justify-content-center"
      >
        {matches ? (
          <div className="d-flex justify-content-center">
            <Image
              fluid
              className="d-block w-100"
              src="undraw_Add_to_cart_re_wrdo.png"
              alt="First slide"
            />
            <div style={{ position: "absolute", top: "2%" }}>
              <h5>Bine ai venit! Ai ajuns in locul potrivit.</h5>
              <p>Iti punem la dispozitie o gama larga de produse pentru a putea sa faci alegerea potrivita nevoilor tale.</p>
            </div>
            <div style={{ position: "absolute", top: "60%", left: "55%" }}>
              <p>Ce mai astepti? Incepe cautarea!</p>
              <Button className="p-2" onClick={handleHome} variant="outline-primary" >
                Catre magazin
              </Button>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column">
            <Card
              style={{
                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                marginTop: "2rem",
                marginLeft: "2rem",
                marginRight: "2rem",
                marginBottom: "2rem",
              }}
            >
              <Card.Img variant="top" src="undraw_Add_to_cart_re_wrdo.png" />
              <Card.Body>
                <Card.Title>
                  Bine ai venit! Ai ajuns in locul potrivit.
                </Card.Title>
                <Card.Text>
                  Iti punem la dispozitie o gama larga de produse pentru a putea sa faci alegerea potrivita nevoilor tale. Ce mai astepti? Incepe cautarea!
                </Card.Text>
                <Button onClick={handleHome} variant="outline-primary">
                  Catre magazin
                </Button>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
