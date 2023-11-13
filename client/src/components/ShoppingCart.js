import { useContext, useEffect, useState, useRef } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { ShopContext } from "./ShopContext";
import { Button, Card, Container, Form, Image } from "react-bootstrap";
import app, { storage } from "../firebase"
import { getDownloadURL, ref } from "firebase/storage"
import { useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuthentication } from "./context/AuthenticationContext";

export default function ShoppingCart() {
    const { currentUser } = useAuthentication();
    const { cartItems, addToCart, removeFromCart, updateCartItemCount, getTotalCartAmount } = useContext(ShopContext)
    const [products, setProducts] = useState(null)
    const navigate = useNavigate();
    const [checkout, setCheckout] = useState(false)
    const [approved, setApproved] = useState(false)
    const [user, setUser] = useState("");
    const streetRef = useRef();
    const nbRef = useRef();
    const blocRef = useRef();
    const scaraRef = useRef();
    const apartmentRef = useRef();
    const phoneRef = useRef();
    const cityRef = useRef();

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

    useEffect(() => {
        getProducts()
    }, []);

    const putOrder = (id) => {
        const postData = {
            products: cartItems,
            status: "none",
            type: "shoppingCart",
            payment: "none",
            data: new Date(),
        };
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders/${id}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        }).then((res) => res.json())
    };

    console.log(cartItems)

    const databaseOrders = () => {
        if (currentUser) {
            if (Object.keys(cartItems).length > 0) {
                fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/ordersUser/${currentUser.uid}`, {
                    method: "GET",
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data)
                        if (data[0]) {
                            putOrder(data[0].id)
                        }

                    });
            }

        }
    }

    function handleSubmit() {
        let adress = streetRef.current.value + ", " + nbRef.current.value + ", " + blocRef.current.value + ", " + scaraRef.current.value + ", " + apartmentRef.current.value + ", " + cityRef.current.value;
        if (
            phoneRef.current.value !== user.phone ||
            adress !== user.adress
        ) {
            const postData = {
                id: currentUser.uid,
                adress: adress,
                phone: phoneRef.current.value,
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
    }

    useEffect(() => {
        databaseOrders()
    }, [cartItems]);

    const getCartProducts = () => {
        let result = []
        if (products) {
            products.forEach(product => {
                if (cartItems[product.id] !== 0) {
                    result.push(
                        <Card className="shadow p-2" style={{ maxWidth: "50%", minWidth: "350px" }}>
                            <div className="d-flex flex-row align-items-center">
                                <Card.Img id={`${'img' + product.name}`} variant="top" style={{ minWidth: "80px" }} className="w-25" />
                                <Card.Body>
                                    <Card.Title className="fw-normal">{product.name}</Card.Title>
                                    <Card.Text>
                                        <div className="d-flex flex-column">{product.price} lei
                                        </div>
                                    </Card.Text>
                                    <div className="d-flex flex-row">
                                        <Button className="mx-1" variant="outline-dark" onClick={() => {
                                            removeFromCart(product.id)
                                        }}>-</Button>
                                        <Form.Control type="number" className="w-25" value={approved ? 0 : cartItems[product.id]} onChange={(e) => {
                                            updateCartItemCount(Number(e.target.value), product.id)
                                        }} />
                                        <Button className="mx-1" variant="outline-dark" onClick={() => {
                                            addToCart(product.id)
                                        }}>+</Button>
                                    </div>
                                </Card.Body>
                            </div>
                        </Card>)
                    const imageRef = ref(storage, `${product.name}`)
                    getDownloadURL(imageRef).then((url) => {
                        const img = document.getElementById(`${'img' + product.name}`);
                        if (img) {
                            img.setAttribute('src', url);
                            console.log(url)
                        }
                    });
                }
            })
        }
        return result
    }

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

    console.log(cartItems)

    return (
        <>
            <Header />
            <div className="shadow-lg pb-1"
                style={{
                    position: "relative",
                    zIndex: "1",
                    marginBottom: "100px",
                    backgroundColor: "white",
                    minHeight: "100vh",
                }}
            >

                <div className="container d-flex flex-column align-items-center">
                    <div className="w-50"><h2 className="mt-2">Coș de cumpărături</h2> <hr></hr></div>
                </div>
                <div className="container d-flex flex-column align-items-center gap-3 pt-3">
                    {getCartProducts()}
                </div>

                {getTotalCartAmount() > 0 ?
                    <div className="d-flex flex-column align-items-center m-5">
                        <p>Subtotal: {getTotalCartAmount()} lei</p>
                        <Button variant="outline-info" style={{ maxWidth: "300px" }} className="w-50 m-1" onClick={() => { navigate("/dashboard"); }}>Continua cumparaturile</Button>
                        {checkout && user ?
                            (
                                <Container className="d-flex flex-column align-items-center">
                                    <Form onSubmit={handleSubmit} className="mt-3 w-75 pt-3" style={{ maxWidth: "750px", borderTop: "1px solid grey" }}>
                                        <Form.Label>Telefon</Form.Label>
                                        <Form.Control
                                            className="mb-3"
                                            type="text"
                                            ref={phoneRef}
                                            required
                                            defaultValue={user.phone}
                                        ></Form.Control>
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
                                                defaultValue={user.adress.split(", ")[5]}
                                            ></Form.Control>
                                        </Form.Group>
                                        <div className="d-flex flex-row justify-content-around m-2 flex-wrap gap-3">
                                            <Button variant="outline-warning" size="sm" onClick={() => {
                                                handleSubmit()
                                                const postDataCart = {
                                                    products: cartItems,
                                                    status: "in procesare",
                                                    type: "order",
                                                    payment: "at delivery",
                                                    data: new Date(),
                                                    userId: user.id
                                                };
                                                fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders`, {
                                                    method: "post",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify(postDataCart),
                                                }).then((res) => res.json())

                                                const postData = {
                                                    products: getArrayOfProducts(),
                                                    status: "none",
                                                    type: "shoppingCart",
                                                    payment: "none",
                                                    data: new Date(),
                                                };
                                                fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/ordersUser/${user.id}`, {
                                                    method: "GET",
                                                })
                                                    .then((res) => res.json())
                                                    .then((data) => {
                                                        data.forEach(element => {
                                                            if (element.type == "shoppingCart") {
                                                                fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders/${element.id}`, {
                                                                    method: "put",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                    },
                                                                    body: JSON.stringify(postData),
                                                                }).then((res) => res.json())
                                                            }

                                                        });
                                                    })
                                                    .catch((err) => {
                                                        console.log(err);
                                                    });

                                                setTimeout(() => {
                                                    window.location.reload()
                                                }, "1000");

                                            }}>Plata la livrare</Button>

                                            <PayPalButtons
                                                style={{ layout: "horizontal", label: "pay" }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [
                                                            {
                                                                amount: {
                                                                    value: (getTotalCartAmount() / 4.97).toFixed(2),
                                                                },
                                                            },
                                                        ],
                                                    });
                                                }}
                                                onApprove={(data, actions) => {
                                                    const order = actions.order.capture();
                                                    console.log(order)
                                                    setApproved(true)
                                                    handleSubmit()

                                                    const postDataCart = {
                                                        products: cartItems,
                                                        status: "in procesare",
                                                        type: "order",
                                                        payment: "paid",
                                                        data: new Date(),
                                                        userId: user.id
                                                    };
                                                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders`, {
                                                        method: "post",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify(postDataCart),
                                                    }).then((res) => res.json())

                                                    const postData = {
                                                        products: getArrayOfProducts(),
                                                        status: "none",
                                                        type: "shoppingCart",
                                                        payment: "none",
                                                        data: new Date(),
                                                    };
                                                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/ordersUser/${user.id}`, {
                                                        method: "GET",
                                                    })
                                                        .then((res) => res.json())
                                                        .then((data) => {
                                                            data.forEach(element => {
                                                                if (element.type == "shoppingCart") {
                                                                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders/${element.id}`, {
                                                                        method: "put",
                                                                        headers: {
                                                                            "Content-Type": "application/json",
                                                                        },
                                                                        body: JSON.stringify(postData),
                                                                    }).then((res) => res.json())
                                                                }

                                                            });
                                                        })
                                                        .catch((err) => {
                                                            console.log(err);
                                                        });

                                                    setTimeout(() => {
                                                        window.location.reload()
                                                    }, "1000");
                                                }}
                                                onError={(e) => console.log(e)}
                                            />
                                        </div>
                                    </Form>
                                </Container>
                            )
                            : (<Button variant="success" style={{ maxWidth: "300px" }} className="w-50 m-1" onClick={() => {
                                setCheckout(true);
                                if (!user) {
                                    navigate("/signin")
                                }
                            }}>Checkout</Button>)}
                    </div> :
                    <div className="d-flex flex-column align-items-center">
                        <h1>Coșul tau de cumpărături este gol!</h1>
                        <Button variant="outline-primary" onClick={() => { navigate("/dashboard") }}>Caută produse!</Button>
                        <Image src="undraw_empty_cart_co35.png" style={{ maxWidth: "40%" }}></Image>
                    </div>

                }

            </div>
            <Footer />
        </>
    )
}
