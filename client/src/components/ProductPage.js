import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { storage } from "../firebase"
import { getDownloadURL, ref } from "firebase/storage"
import { ShopContext } from "./ShopContext";
import { Button, Card, Form, Accordion } from "react-bootstrap";
import { useAuthentication } from "./context/AuthenticationContext";
import { ToastContainer, toast } from "react-toastify";

export default function ProductPage() {
    const { currentUser } = useAuthentication();
    const { productId } = useParams();
    const [product, setProduct] = useState(null)
    const { cartItems, addToCart, removeFromCart, updateCartItemCount } = useContext(ShopContext)
    const [comment, setComment] = useState(null);
    const [comments, setComments] = useState(null);

    const getProduct = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/productsCateg/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
            });

    };

    const getCommentsFilteredByProduct = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/product/${id}/comments`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setComments(data);
                } else {
                    setComments("")
                }

            });
    };

    useEffect(() => {
        getProduct(productId)
    }, [productId]);

    const prod = () => {
        const result = [];
        if (product) {
            result.push(
                <img id={`${'img' + product[0].name}`} style={{ maxHeight: "380px" }}></img>
            )

            const imageRef = ref(storage, `${product[0].name}`)
            getDownloadURL(imageRef).then((url) => {
                const img = document.getElementById(`${'img' + product[0].name}`);
                if (img) {
                    img.setAttribute('src', url);
                    console.log(url)
                }
            });

            return result;
        }
    }

    const getComments = (id) => {
        const result = [];
        if (comments) {
            comments.forEach((comment) => {
                if (comment.productId === id) {
                    result.push(
                        <div className="mb-3 shadow-sm mt-3">
                            <Card
                                border="light"
                                bg="light"
                                style={{ boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}
                            >
                                <Card.Body>
                                    <Card.Text className="p-2 d-flex gap-3 text-muted ">
                                        <small>{comment.autor}</small>
                                        <small> - </small>
                                        <small>{comment.data}</small>
                                    </Card.Text>
                                    <Card.Text style={{ paddingLeft: "20px" }}>
                                        <div>
                                            <div>{comment.continut}</div>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                }
            });
        }
        return result;
    };

    const adaugaComentariu = (id, user_email, comment) => {
        const postData = {
            continut: comment,
            data: new Date().toLocaleString().replace(",", ""),
            status: "In asteptare",
            autor: user_email,
        };
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/product/${id}/comments`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        }).then((res) => res.json());
    };

    return (
        <>
            <Header />
            <div
                className="d-flex flex-column shadow-lg"
                style={{
                    position: "relative",
                    zIndex: "1",
                    marginBottom: "100px",
                    backgroundColor: "white",
                    minHeight: "100vh",
                }}
            >
                <div className="container">
                    <div className="d-md-grid"
                        style={{
                            gridTemplateColumns: "3fr 3fr"
                        }}
                    >
                        <div
                            className="d-flex align-items-center justify-content-center mt-2"
                            style={{
                                background: "white",
                            }}
                        >
                            {prod()}
                        </div>
                        <div className="d-flex flex-column m-3 p-4 shadow rounded">
                            {product &&
                                <div className="d-flex flex-column">
                                    <h2>{product[0].name}</h2>
                                    <h3>{product[0].price} lei</h3>
                                    {product[0].isAvailable ? <h3 className="text-success">In stoc</h3> : <h3 className="text-danger">Indisponibil</h3>}
                                    <div className="d-flex flex-column w-50">
                                        <div className="d-flex flex-row mb-2">
                                            <Button className="mx-1" variant="outline-dark" onClick={() => removeFromCart(product[0].id)}>-</Button>
                                            <Form.Control type="number" value={cartItems[product[0].id]} onChange={(e) => updateCartItemCount(Number(e.target.value), product[0].id)} />
                                            <Button className="mx-1" variant="outline-dark" onClick={() => addToCart(product[0].id)}>+</Button>
                                        </div>
                                        {product[0].isAvailable ? <Button variant="outline-dark" onClick={() => addToCart(product[0].id)}>Adauga in cos {cartItems[product[0].id] > 0 && <>({cartItems[product[0].id]})</>}
                                        </Button> :
                                            <Button variant="outline-dark" onClick={() => addToCart(product[0].id)} disabled>Adauga in cos {cartItems[product[0].id] > 0 && <>({cartItems[product[0].id]})</>}
                                            </Button>}
                                    </div>
                                    <span className="mt-2">Categorie: {product[0].category}</span>
                                </div>
                            }

                        </div>
                    </div>
                    <div className="d-flex flex-column">
                        <ToastContainer />
                        <hr></hr>
                        <h2>Descriere</h2>
                        {product && <h5>{product[0].description}</h5>}
                        {product &&
                            <Accordion className="mb-3" >
                                <Accordion.Item
                                    eventKey={`${product[0].id}`}
                                >
                                    <Accordion.Header

                                        onClick={() => {
                                            getCommentsFilteredByProduct(product[0].id);
                                        }}
                                    >
                                        Recenzii
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {currentUser ? (
                                            <Form id={`form${product[0].id}`}>
                                                <Form.Group
                                                    controlId={`id${product[0].id}`}
                                                    style={{ marginBottom: "2rem" }}
                                                >
                                                    <Form.Control
                                                        as="textarea"
                                                        rows="3"
                                                        name="comment"
                                                        placeholder="Scrie comentariul tău aici..."
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                    />
                                                </Form.Group>

                                                <Button
                                                    variant="primary"
                                                    className="btn btn-primary btn-sm"
                                                    style={{ width: "auto" }}
                                                    onClick={() => {
                                                        adaugaComentariu(
                                                            product[0].id,
                                                            currentUser.email,
                                                            comment
                                                        );
                                                        toast.success(
                                                            "Comentariul tău urmează să fie validat de către un administrator. Vei fi notificat când acesta va fi vizibil pe site!",
                                                            {
                                                                position: "bottom-right",
                                                                autoClose: 3000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                            }
                                                        );
                                                        document.getElementById(
                                                            `id${product[0].id}`
                                                        ).value = "";
                                                        setComment("");
                                                    }}
                                                >
                                                    Adaugă comentariul
                                                </Button>
                                            </Form>
                                        ) : (
                                            <Form id={`form${product[0].id}`}>
                                                <Form.Group
                                                    controlId={`id${product[0].id}`}
                                                    style={{ marginBottom: "2rem" }}
                                                >
                                                    <Form.Control
                                                        as="textarea"
                                                        rows="3"
                                                        name="comment"
                                                        placeholder="Scrie comentariul tau aici..."
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        disabled
                                                    />
                                                </Form.Group>
                                                <Button
                                                    variant="primary"
                                                    className="btn btn-primary btn-sm"
                                                    style={{ width: "auto" }}
                                                    disabled
                                                    onClick={() => {
                                                        adaugaComentariu(
                                                            product[0].id,
                                                            currentUser.email,
                                                            comment
                                                        );
                                                        toast.success(
                                                            "Comentariul tău urmează să fie validat de către un administrator. Vei fi notificat când acesta va fi vizibil pe site!",
                                                            {
                                                                position: "bottom-right",
                                                                autoClose: 3000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                            }
                                                        );
                                                        document.getElementById(
                                                            `id${product[0].id}`
                                                        ).value = "";
                                                        setComment("");
                                                    }}
                                                >
                                                    Adaugă comentariul
                                                </Button>
                                            </Form>
                                        )}
                                        {getComments(product[0].id)}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}