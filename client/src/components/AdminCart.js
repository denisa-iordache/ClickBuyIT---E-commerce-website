import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, ButtonGroup, Table, Dropdown, DropdownButton, Card } from "react-bootstrap";
import {
    AiOutlineSortAscending,
    AiOutlineSortDescending,
} from "react-icons/ai";
import {
    FcSearch,
    FcLeft,
    FcRight,
} from "react-icons/fc";
import ReactPaginate from "react-paginate";
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "../firebase"

export default function AdminCart() {
    const [orders, setOrders] = useState(null);
    const [count, setCount] = useState(0);

    const [users, setUsers] = useState([]);

    const [products, setProducts] = useState([])

    const [order, setOrder] = useState(null);

    const [filterString, setFilterString] = useState("");

    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState(1);

    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);

    const nameRef = useRef();

    const [showOrder, setShowOrder] = useState(false);
    const handleCloseOrder = () => setShowOrder(false);
    const handleShowOrder = () => setShowOrder(true);

    const [filters, setFilters] = useState({
        status: { value: null },
        type: { value: null },
        payment: { value: null },
        data: { value: null },
    });

    const [usersTable, setUsersTable] = useState([]);

    useEffect(() => {
        const keys = Object.keys(filters);
        const computedFilterString = keys
            .map((e) => {
                return {
                    key: e,
                    value: filters[e].value,
                };
            })
            .filter((e) => e.value)
            .map((e) => `${e.key}=${e.value}`)
            .join("&");
        setFilterString(computedFilterString);
    }, [filters]);

    const getOrders = () => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders?${filterString}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""
            }&page=${page}&pageSize=${11}}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setOrders(data.records);
                setCount(data.count)

                data.records.forEach((product) => {
                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/users/${product.userId}`, {
                        method: "GET",
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            setUsersTable(prev => ([...prev, {
                                name: data.firstName + " " + data.lastName
                            }]));
                        });
                })
            });
    };

    const getProduct = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setProducts(prev => [...prev, data]);
            });

    };

    const getUser = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/users/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setUsers(prev => [...prev, data]);
            });

    };

    const getOrder = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setOrder(data);
            });
    };

    const handleSort = (evt) => {
        console.warn(evt);
        setSortField(evt.sortField);
        setSortOrder(evt.sortOrder);
    };

    const putOrder = (id) => {
        let postData = {
            status: nameRef.current.value,
            type: nameRef.current.value === "none" ? "shoppingCart" : "order",
        };
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders/${id}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        }).then((res) => res.json())
            .then((data) => {
                setOrders(prevState => {
                    return prevState.map((item) => {
                        return item.id === data.data ? { ...item, status: postData.status, type: postData.type } : item
                    })
                })
            });
        setShowOrder(false)
    };

    const buildTableOrders = () => {
        let result = [];
        if (orders && users.length && products.length) {
            for (let i = 0; i < orders.length; i++) {
                let user = ""
                for (let j = 0; j < users.length; j++) {
                    if (users[j]) {
                        if (orders[i].userId === users[j].id) {
                            user = "Nume: " + users[j].lastName + " " + users[j].firstName + ", Telefon: " + users[j].phone + ", Adresa: " + users[j].adress
                        }
                    }
                }
                let prod = []
                const cardsProds = [];
                products.forEach(product => {
                    if (product) {
                        let result = Object.keys(orders[i].products).filter(e => orders[i].products[e] !== 0).map(i => Number(i));
                        if (result.includes(product.id)) {
                            prod.push(product)

                        }
                    }
                })
                let clean = prod.filter((arr, index, self) =>
                    index === self.findIndex((t) => (t.id === arr.id)))
                let totalAmount = 0;
                for (let j = 0; j < clean.length; j++) {
                    console.log(clean[j])
                    if (orders[i].products[clean[j].id] !== 0) {
                        totalAmount += clean[j].price * orders[i].products[clean[j].id]
                        cardsProds.push(
                            <Card style={{ width: '100%' }} className="mb-2">
                                <div className="d-flex flex-row align-items-center">
                                    <Card.Img className={`${'img' + i + clean[j].name}`} variant="top" style={{ width: "50px", height: "50px" }} />
                                    <Card.Body>
                                        <Card.Title>{clean[j].name}</Card.Title>
                                        <Card.Text>
                                            <span>Cantitate: {orders[i].products[clean[j].id]}</span>
                                            <br />
                                            <span>{clean[j].price} lei</span>
                                        </Card.Text>
                                    </Card.Body>
                                </div>
                            </Card>
                        )
                        const imageRef = ref(storage, `${clean[j].name}`)
                        getDownloadURL(imageRef).then((url) => {
                            const img = document.getElementsByClassName(`${'img' + i + clean[j].name}`);
                            if (img) {
                                for (let k = 0; k < img.length; k++) {
                                    img[k].setAttribute('src', url);

                                }
                            }
                        });
                    }
                }

                result.push(
                    <tr>
                        <td>{orders[i].id}</td>
                        <td><div >{cardsProds}</div><div>Total:{totalAmount}</div></td>
                        <td>{orders[i].status}</td>
                        <td>{orders[i].type}</td>
                        <td>{orders[i].payment}</td>
                        <td>{new Date(orders[i].data).toLocaleString('en-GB', { timeZone: 'UTC' })}</td>
                        <td>{user}</td>
                        <td >
                            {orders[i].type == "order" ? <Button
                                variant="outline-success"
                                className="m-1 rounded"
                                onClick={() => {
                                    handleShowOrder();
                                    getOrder(orders[i].id);
                                    setOrder(null)
                                }}
                            >
                                Editează comanda
                            </Button> : ""}
                        </td>
                    </tr>
                );
                // }
            }
            return result;
        }
    };

    useEffect(() => {
        getOrders(filterString, sortField, sortOrder, page);
    }, [filterString,
        sortField,
        sortOrder,
        page]);

    useEffect(() => {
        if (orders) {
            orders.forEach(order => {
                getUser(order.userId);
            });
        }
    }, [orders]);

    useEffect(() => {
        if (orders) {
            orders.forEach(order => {
                let keys = Object.keys(order.products)
                keys.forEach(key => {
                    if (order.products[key] !== 0) {
                        getProduct(key)
                    }
                })
            });
        }
    }, [orders]);

    const handlePageClick = async (data) => {
        setPage(data.selected);
        setFirst(data.selected * 2);
    };

    return (
        <>
            <Modal show={showOrder} onHide={handleCloseOrder} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Schimba status comanda </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {order && (
                        <Form.Group id="name">
                            {/* <Form.Label>Products</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                disabled
                                defaultValue={JSON.stringify(order.products)}
                            ></Form.Control> */}
                            <Form.Label>Tip</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                disabled
                                defaultValue={order.type}
                            ></Form.Control>
                            <Form.Label>Plata</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                disabled
                                defaultValue={order.payment}
                            ></Form.Control>
                            <Form.Label>Data</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                disabled
                                defaultValue={new Date(order.data).toLocaleString('en-GB', { timeZone: 'UTC' })}
                            ></Form.Control>
                            <Form.Label>Status</Form.Label>
                            <Form.Select className="mb-3" ref={nameRef} defaultValue={order.status}>
                                <option value="none">none</option>
                                <option value="in procesare">in procesare</option>
                                <option value="expediata">expediata</option>
                            </Form.Select>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button
                        className="btn btn-warning w-25"
                        onClick={handleCloseOrder}
                    >
                        Anulează
                    </Button>
                    {order && (
                        <Button
                            className="btn btn-success w-25"
                            onClick={() => {
                                putOrder(order.id);
                            }}
                        >
                            Salvează
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
            <div className="d-flex flex-row">
                <DropdownButton
                    as={ButtonGroup}
                    variant="outline-primary"
                    id="dropdown-item-button"
                    title="Filtreaza dupa"
                    style={{ width: "25%", marginBottom: "2rem", marginRight: "1rem" }}
                >
                    <div className="m-1">
                        <DropdownButton
                            as={ButtonGroup}
                            id="dropdown-button1"
                            variant="outline-primary"
                            drop="end"
                            title="Status"
                            className="mt-0"
                            style={{ width: "100%" }}
                        >
                            <Dropdown.Item
                                as="button"
                                onClick={(e) => {
                                    setFilters({
                                        status: { value: e.target.textContent.toLowerCase() },
                                        type: { value: null },
                                        payment: { value: null },
                                        data: { value: null },
                                    });
                                }}
                            >
                                None
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={(e) => {
                                    setFilters({
                                        status: { value: e.target.innerText.toLowerCase() },
                                        type: { value: null },
                                        payment: { value: null },
                                        data: { value: null },
                                    });
                                }}
                            >
                                In procesare
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={(e) => {
                                    setFilters({
                                        status: { value: e.target.textContent.toLowerCase() },
                                        type: { value: null },
                                        payment: { value: null },
                                        data: { value: null },
                                    });
                                }}
                            >
                                Expediata
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                    <div className="m-1">
                        <DropdownButton
                            as={ButtonGroup}
                            id="dropdown-button-drop-end"
                            variant="outline-primary"
                            drop="end"
                            title="Tip"
                            className="mt-0"
                            style={{ width: "100%" }}
                        >
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setFilters({
                                        status: { value: null },
                                        type: { value: "shoppingCart" },
                                        payment: { value: null },
                                        data: { value: null },
                                    });
                                }}
                            >
                                Cos de cumparaturi
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setFilters({
                                        status: { value: null },
                                        type: { value: "order" },
                                        payment: { value: null },
                                        data: { value: null },
                                    });
                                }}
                            >
                                Comanda
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                    <div className="m-1">
                        <DropdownButton
                            as={ButtonGroup}
                            id="dropdown-button-drop-end"
                            variant="outline-primary"
                            drop="end"
                            title="Plata"
                            className="mt-0"
                            style={{ width: "100%" }}
                        >
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setFilters({
                                        status: { value: null },
                                        type: { value: null },
                                        payment: { value: "none" },
                                        data: { value: null },
                                    });
                                }}
                            >
                                None
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setFilters({
                                        status: { value: null },
                                        type: { value: null },
                                        payment: { value: "at delivery" },
                                        data: { value: null },
                                    });
                                }}
                            >
                                La livrare
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setFilters({
                                        status: { value: null },
                                        type: { value: null },
                                        payment: { value: "paid" },
                                        data: { value: null },
                                    });
                                }}
                            >
                                Platita
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </DropdownButton>
                <DropdownButton
                    as={ButtonGroup}
                    variant="outline-primary"
                    id="dropdown-item-button"
                    title="Sorteaza dupa"
                    style={{ width: "25%", marginBottom: "2rem", marginRight: "1rem" }}
                >
                    <div className="m-1">
                        <DropdownButton
                            as={ButtonGroup}
                            id="dropdown-button-drop-end"
                            variant="outline-primary"
                            drop="end"
                            title="Data comenzii"
                            className="mt-0"
                            style={{ width: "100%" }}
                        >
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setSortOrder(1);
                                    setSortField("data");
                                }}
                            >
                                Ascendent <AiOutlineSortAscending />
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setSortOrder(-1);
                                    setSortField("data");
                                }}
                            >
                                Descendent <AiOutlineSortDescending />
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </DropdownButton>
            </div>
            <div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Products</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Payment</th>
                            <th>Data</th>
                            <th>User</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>{buildTableOrders()}</tbody>
                </Table>
                <ReactPaginate
                    previousLabel={<FcLeft />}
                    nextLabel={<FcRight />}
                    breakLabel={"..."}
                    pageCount={count / 11}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    initialPage={first}
                    containerClassName={"pagination justify-content-center"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    breakClassName={"page-item"}
                    breakLinkClassName={"page-link"}
                    activeClassName={"active"}
                />
            </div>
        </>
    );
}
