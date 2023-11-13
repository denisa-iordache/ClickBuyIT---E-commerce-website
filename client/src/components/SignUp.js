import React, { useRef, useState, useEffect } from "react";
import { Form, Button, Card, Alert, Container } from "react-bootstrap";
import { useAuthentication } from "./context/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

export default function SignUp() {
  const nameRef = useRef();
  const surnameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuthentication();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);

  const getProducts = () => {
    fetch(
      `${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products`,
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.records)
      });
  }

  useEffect(() => {
    getProducts()
  }, []);

  const getArrayOfProducts = () => {
    let arr = []
    products.forEach(product => {
      arr.push(product.id)
    });

    let cart = {};
    for (let i = 0; i < arr.length; i++) {
      cart = { ...cart, [arr[i]]: 0 };
    }
    return cart
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }
    if (
      passwordRef.current.value.length < 6 ||
      passwordConfirmRef.current.value.length < 6
    ) {
      return setError("The password length must be at least 6 characters");
    }

    try {
      setError("");
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value).then(
        (data) => {
          const postData = {
            id: data.user.uid,
            lastName: nameRef.current.value,
            firstName: surnameRef.current.value,
            email: emailRef.current.value,
            phone: "",
            adress: ", , , , , ",
            role: "default"
          };
          console.log(postData);

          fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/users`, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          }).then((res) => res.json());

          const postDataCart = {
            products: getArrayOfProducts(),
            status: "none",
            type: "shoppingCart",
            payment: "none",
            data: new Date(),
            userId: data.user.uid
          };
          fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders`, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postDataCart),
          }).then((res) => res.json())
        }
      );
      navigate("/");
    } catch (error) {
      if (
        passwordRef.current.value.length < 6 ||
        passwordConfirmRef.current.value.length < 6
      ) {
        setError("The password length must be at least 6 characters");
      } else {
        setError("Failed to create an account!");
      }
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
                <h2 className="text-center">Creează un cont</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="name">
                    <Form.Label>Nume</Form.Label>
                    <Form.Control type="text" ref={nameRef}></Form.Control>
                  </Form.Group>
                  <Form.Group id="surname">
                    <Form.Label>Prenume</Form.Label>
                    <Form.Control type="text" ref={surnameRef}></Form.Control>
                  </Form.Group>
                  <Form.Group id="email">
                    <Form.Label className="d-flex flex-row">
                      Adresă de email
                      <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      ref={emailRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Form.Group id="password">
                    <Form.Label className="d-flex">
                      Parolă
                      <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      ref={passwordRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Form.Group id="password-confirm">
                    <Form.Label className="d-flex">
                      Confirmare parolă
                      <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="password"
                      ref={passwordConfirmRef}
                      required
                    ></Form.Control>
                  </Form.Group>
                  <Button
                    disabled={loading}
                    className="w-100 mt-2"
                    type="submit"
                  >
                    Înregistrează-te
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            <div className="w-100 text-center mt-1">
              Ai deja un cont? <a href="/#/loginPage">Autentifică-te în cont</a>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}
