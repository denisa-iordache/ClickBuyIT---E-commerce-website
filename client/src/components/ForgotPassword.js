import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuthentication } from "./context/AuthenticationContext";
import { Container } from "react-bootstrap";
import Footer from "./Footer";
import Header from "./Header";

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuthentication();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your email for the reset instructions!");
    } catch (error) {
      setError("Failed to reset password!");
    }
    setLoading(false);
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
                <h2 className="text-center mb-4">Resetează-ți parola</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="email">
                    <Form.Label className="d-flex flex-row">
                      Email{" "}
                      <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      ref={emailRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Button
                    disabled={loading}
                    className="w-100 mt-4"
                    type="submit"
                  >
                    Resează parola
                  </Button>
                </Form>
                <div className="w-100 text-center mt-3">
                  <a href="/#/loginPage">Intră în cont</a>
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
