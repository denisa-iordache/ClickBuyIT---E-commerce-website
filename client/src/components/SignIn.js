import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuthentication } from "./context/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Footer from "./Footer";
import Header from "./Header";

export default function LoginPage() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuthentication();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate("/");
    } catch (error) {
      setError("Failed to sign in!");
    }
    setLoading(false);
    setTimeout(() => {
      window.location.reload()
    }, "1000");
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
        }}
        className="shadow-lg"
      >
        <Container
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <Card
              style={{ boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}
            >
              <Card.Body>
                <h2 className="text-center mb-4">Intră în cont</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="email">
                    <Form.Label className="d-flex flex-row">
                      Adresa de email{" "}
                      <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      ref={emailRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Form.Group id="password">
                    <Form.Label className="d-flex flex-row">
                      Parola{" "}
                      <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      ref={passwordRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Button
                    disabled={loading}
                    className="w-100 mt-3"
                    type="submit"
                  >
                    Intră în cont
                  </Button>
                </Form>
                <div className="w-100 text-center mt-3">
                  <a href="/#/forgot-password">Ai uitat parola?</a>
                </div>
              </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
              Ai nevoie de un cont? <a href="/#/signup">Înregistrează-te</a>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}
