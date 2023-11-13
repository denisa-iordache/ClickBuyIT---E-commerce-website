import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { useAuthentication } from "./context/AuthenticationContext";
import { Card } from "react-bootstrap";
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "../firebase"


export default function MyOrders() {
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const { currentUser } = useAuthentication();

    const getProduct = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setProducts(prev => [...prev, data]);
            });

    };

    const getOrders = () => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/ordersUser/${currentUser.uid}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                let ord = []
                data.forEach(element => {
                    if (element.type === "order") {
                        ord.push(element)
                    }

                });
                setOrders(ord)
            })
            .catch((err) => {
                console.log(err);
            });
    }


    const cards = () => {
        const cards = [];
        if (orders && products.length) {
            orders.sort((a, b) => {
                if (a.data > b.data) {
                    return -1;
                }
            });
            orders.forEach((order) => {
                let prod = []
                const cardsProds = [];
                products.forEach(product => {
                    if (product) {
                        let result = Object.keys(order.products).filter(e => order.products[e] !== 0).map(i => Number(i));

                        if (result.includes(product.id)) {
                            prod.push(product)

                        }
                    }
                })
                let clean = prod.filter((arr, index, self) =>
                    index === self.findIndex((t) => (t.id === arr.id)))
                let totalAmount = 0;

                for (let i = 0; i < clean.length; i++) {
                    if (order.products[clean[i].id] !== 0) {
                        totalAmount += clean[i].price * order.products[clean[i].id]
                        cardsProds.push(
                            <Card style={{ width: '100%' }} className="m-2">
                                <div className="d-flex flex-row align-items-center">
                                    <Card.Img className={`${'img' + i + clean[i].name}`} variant="top" style={{ width: "50px", height: "50px" }} />
                                    <Card.Body>
                                        <Card.Title>{clean[i].name}</Card.Title>
                                        <Card.Text>
                                            <span>Cantitate: {order.products[clean[i].id]}</span>
                                            <br />
                                            <span>{clean[i].price} lei</span>
                                        </Card.Text>
                                    </Card.Body>
                                </div>
                            </Card>
                        )
                        const imageRef = ref(storage, `${clean[i].name}`)
                        getDownloadURL(imageRef).then((url) => {
                            const img = document.getElementsByClassName(`${'img' + i + clean[i].name}`);
                            if (img) {
                                for (let j = 0; j < img.length; j++) {
                                    img[j].setAttribute('src', url);

                                }
                            }
                        });
                    }
                }
                cards.push(
                    <div className="mb-3 shadow-sm">
                        <Card style={{ width: '100%' }}>
                            <Card.Body>
                                <Card.Title>{new Date(order.data).toLocaleString('en-GB', { timeZone: 'UTC' })}</Card.Title>
                                <Card.Text>
                                    <div className="d-flex flex-column">
                                        <div>{cardsProds}</div>
                                        <span>Status: {order.status}</span>
                                        <span>Plata: {order.payment == "paid" ? "achitata" : "la livrare"}</span>
                                        <span>Total: {totalAmount} lei</span>
                                    </div>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                );

            })
            return cards;
        };
    }


    useEffect(() => {
        getOrders()
    }, []);

    useEffect(() => {
        if (orders) {
            orders.forEach(order => {
                let json = order.products
                let keys = Object.keys(json)
                keys.forEach(key => {
                    if (json[key] !== 0) {
                        getProduct(key)
                    }
                })
            });
        }
    }, [orders]);

    return (
        <>
            <Header />
            <div
                style={{
                    position: "relative",
                    zIndex: "1",
                    marginBottom: "100px",
                    backgroundColor: "white",
                    minHeight: "80vh"
                }}
                className="d-flex justify-content-center shadow-lg"
            >
                <div className="m-2 container">
                    <h2 className="mt-2">Istoric comenzi</h2> <hr></hr>
                    {cards()}</div>
            </div>
            <Footer />
        </>
    );
}