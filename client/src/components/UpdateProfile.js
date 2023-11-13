import React, { useRef, useState, useEffect } from "react";
import { Form, Button, Modal, ListGroup, ButtonGroup, Alert } from "react-bootstrap";
import { useAuthentication } from "./context/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Footer from "./Footer";
import Header from "./Header";

export default function UpdatePofile() {
    const nameRef = useRef();
    const surnameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const phoneRef = useRef();
    const streetRef = useRef();
    const nbRef = useRef();
    const blocRef = useRef();
    const scaraRef = useRef();
    const apartmentRef = useRef();
    const cityRef = useRef();
    const { currentUser, updateEmailfc, updatePasswordfc, deleteUserFirebase } =
        useAuthentication();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [user, setUser] = useState("");

    const [show, setShow] = useState(false);

    const mediaMatch = window.matchMedia("(min-width: 768px)");
    const [matches, setMatches] = useState(mediaMatch.matches);

    useEffect(() => {
        const handler = (e) => setMatches(e.matches);
        mediaMatch.addListener(handler);
        return () => mediaMatch.removeListener(handler);
    });

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function handleDelete() {
        deleteUserFirebase(currentUser)
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/users/${currentUser.uid}`, {
            method: "DELETE",
        }).then((res) => res.json());
        navigate("/")
    }

    const getUserDetails = async () => {
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
    };

    useEffect(() => {
        getUserDetails();
    }, [currentUser]);

    function handleSubmit(event) {
        event.preventDefault();
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Passwords do not match");
        }
        if (nameRef.current.value.length < 3) {
            return setError("Numele trebuie sa aiba cel putin 3 caractere!");
        }
        if (surnameRef.current.value.length < 3) {
            return setError("Prenumele trebuie sa aiba cel putin 3 caractere!");
        }
        if (!emailRef.current.value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
            return setError("Emailul trebuie sa fie de forma test@test.com!");
        }
        if (!phoneRef.current.value.match(/^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/igm)) {
            return setError("Formatul numarului de telefon nu este corect!");
        }
        if (isNaN(nbRef.current.value)) {
            return setError("Introduceti un numar!");
        }
        const promises = [];
        setLoading(true);
        setError("");
        setMessage("");
        if (emailRef.current.value !== currentUser.email) {
            promises.push(updateEmailfc(emailRef.current.value));
        }
        if (passwordRef.current.value !== currentUser.password) {
            promises.push(updatePasswordfc(passwordRef.current.value));
        }
        let adress = streetRef.current.value + ", " + nbRef.current.value + ", " + blocRef.current.value + ", " + scaraRef.current.value + ", " + apartmentRef.current.value + ", " + cityRef.current.value;
        if (
            nameRef.current.value !== user.lastName ||
            surnameRef.current.value !== user.firstName ||
            phoneRef.current.value !== user.phone ||
            adress !== user.adress
        ) {
            const postData = {
                id: currentUser.uid,
                firstName: surnameRef.current.value,
                lastName: nameRef.current.value,
                emailRef: emailRef.current.value,
                phone: phoneRef.current.value,
                adress: adress,
            };
            fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/users/${currentUser.uid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            })
                .then((res) => res.json())
                .catch((err) => {
                    console.log(err);
                });
        }

        Promise.all(promises)
            .then(() => {
                navigate("/");
            })
            .catch(() => {
                setError("Failed to update profile!");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
            <Header />
            <div className="d-flex justify-content-center shadow-lg"
                style={{
                    position: "relative",
                    zIndex: "1",
                    marginBottom: "100px",
                    backgroundColor: "white",
                }}>

                <Modal show={show} onHide={handleClose} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ștergere cont</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Ești sigur că dorești să-ți ștergi contul?</Modal.Body>
                    <Modal.Footer className="d-flex justify-content-between">
                        <Button className="btn btn-warning w-25" onClick={handleClose}>
                            Anulează
                        </Button>
                        <Button className="btn btn-danger w-25" onClick={handleDelete}>
                            Șterge
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className="container" style={{ paddingInline: "15vw" }}>
                    <h2 className="mt-2">Administrare cont</h2> <hr></hr>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit} className="mt-2 ">
                        <Form.Group id="name">
                            <Form.Label>Nume</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={nameRef}
                                required
                                defaultValue={user.lastName}
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="surname">
                            <Form.Label>Prenume</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={surnameRef}
                                required
                                defaultValue={user.firstName}
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="email">
                            <Form.Label>Adresa de email</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="email"
                                ref={emailRef}
                                required
                                defaultValue={currentUser.email}
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="phone">
                            <Form.Label>Telefon</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={phoneRef}
                                required
                                defaultValue={user.phone}
                            ></Form.Control>
                        </Form.Group>
                        {user.adress &&
                            <Form.Group id="adress">
                                <Form.Label>Strada</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={streetRef}
                                    required
                                    defaultValue={user.adress.split(", ")[0]}
                                ></Form.Control>
                                <Form.Label>Numar</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={nbRef}
                                    required
                                    defaultValue={user.adress.split(", ")[1]}
                                ></Form.Control>
                                <Form.Label>Bloc</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={blocRef}
                                    defaultValue={user.adress.split(", ")[2]}
                                ></Form.Control>
                                <Form.Label>Scara</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={scaraRef}
                                    defaultValue={user.adress.split(", ")[3]}
                                ></Form.Control>
                                <Form.Label>Apartament</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={apartmentRef}
                                    defaultValue={user.adress.split(", ")[4]}
                                ></Form.Control>
                                <Form.Label>Oras</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={cityRef}
                                    required
                                    defaultValue={user.adress.split(", ")[5]}
                                ></Form.Control>
                            </Form.Group>}
                        <Form.Group id="password">
                            <Form.Label>Parolă</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="password"
                                ref={passwordRef}
                                placeholder="Leave blank to keep the same password"
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="password-confirm">
                            <Form.Label>Confirmare parolă</Form.Label>
                            <Form.Control
                                type="password"
                                ref={passwordConfirmRef}
                                placeholder="Leave blank to keep the same password"
                            ></Form.Control>
                        </Form.Group>

                        <div className="d-flex justify-content-between my-4 gap-3">
                            <Button
                                variant="outline-danger"
                                onClick={handleShow}
                            >
                                Ștergere cont
                            </Button>

                            <Button
                                disabled={loading}
                                variant="outline-primary"
                                type="submit"
                            >
                                Actualizează-ți profilul
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
            <Footer />
        </>
    );
}
