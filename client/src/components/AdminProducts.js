import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, ButtonGroup, Table, Dropdown, DropdownButton, InputGroup, Alert } from "react-bootstrap";
import { storage } from "../firebase"
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
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

export default function AdminProducts() {
    const [products, setProducts] = useState(null);
    const [count, setCount] = useState(0);

    const [categories, setCategories] = useState([]);

    const [filterString, setFilterString] = useState("");

    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState(1);

    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);

    const nameRef = useRef();
    const nameRefAdd = useRef();
    const descriptionRef = useRef();
    const descriptionRefAdd = useRef();
    const categoryRef = useRef();
    const categoryRefAdd = useRef();
    const stockRef = useRef();
    const stockRefAdd = useRef();
    const priceRef = useRef();
    const priceRefAdd = useRef();
    const [product, setProduct] = useState(null);

    const [showProduct, setShowProduct] = useState(false);
    const [showProductAdd, setShowProductAdd] = useState(false);
    const handleCloseProduct = () => setShowProduct(false);
    const handleShowProduct = () => setShowProduct(true);
    const handleCloseProductAdd = () => setShowProductAdd(false);
    const handleShowProductAdd = () => setShowProductAdd(true);

    const [imageUpload, setImageUpload] = useState(null);
    const [error, setError] = useState("");

    const [orders, setOrders] = useState(null);

    const [filters, setFilters] = useState({
        name: { value: null },
        price: { value: null },
        isAvailable: { value: null },
        categoryId: { value: null }
    });
    const handleFilter = (event) => {
        setFilters({
            name: { value: event.target.value },
            price: { value: null },
            isAvailable: { value: null },
            categoryId: { value: null }
        });
    };

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
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setOrders(data.records);
            });
    };

    const getProducts = (
        filterString,
        sortField,
        sortOrder,
        page
    ) => {
        fetch(
            `${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products?${filterString}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""
            }&page=${page}&pageSize=${11}}`,
            {
                method: "GET",
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setCount(data.count);
                setProducts(data.records);

                data.records.forEach((product) => {
                    // console.log(product.categoryId)
                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categoriesId/${product.categoryId}`, {
                        method: "GET",
                    })
                        .then((res) => res.json())
                        .then((data) => {
                        });
                })
            });
    };

    const getCategory = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categoriesId/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setCategories(prev => [...prev, data[0]]);
            });
    };

    const handleSort = (evt) => {
        console.warn(evt);
        setSortField(evt.sortField);
        setSortOrder(evt.sortOrder);
    };

    const getProduct = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/productsCateg/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
            });

    };

    const putProduct = (id) => {
        setError("");
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categories/${categoryRef.current.value}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                if (
                    isNaN(parseInt(stockRef.current.value))
                ) {
                    setError("Stocul poate fi doar un numar!");
                } else if (
                    isNaN(parseFloat(priceRef.current.value))
                ) {
                    setError("Pretul poate fi doar un numar!");
                } else {
                    setError("");
                    const postData = {
                        name: nameRef.current.value,
                        description: descriptionRef.current.value,
                        stock: parseInt(stockRef.current.value),
                        price: parseFloat(priceRef.current.value),
                        isAvailable: stockRef.current.value > 0 ? true : false,
                        categoryId: data[0].id
                    };

                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products/${id}`, {
                        method: "put",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(postData),
                    }).then((res) => res.json())
                        .then((data) => {
                            setTimeout(() => {
                                setProducts(prevState => {
                                    return prevState.map((item) => {
                                        return item.id === data.data ? {
                                            ...item,
                                            name: postData.name,
                                            description: postData.description,
                                            stock: postData.stock,
                                            price: postData.price,
                                            isAvailable: postData.isAvailable,
                                            categoryId: postData.categoryId
                                        } : item
                                    })
                                })
                            }, "1000");
                        });

                    if (imageUpload !== null) {
                        const imageRef = ref(storage, `${postData.name}`)
                        uploadBytes(imageRef, imageUpload)
                    }

                    setShowProduct(false)
                }
            });
    };

    const postProduct = () => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categories/${categoryRefAdd.current.value}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                if (
                    isNaN(parseInt(stockRefAdd.current.value))
                ) {
                    setError("Stocul poate fi doar un numar!");
                }
                else if (
                    isNaN(parseFloat(priceRefAdd.current.value))
                ) {
                    setError("Pretul poate fi doar un numar!");
                } else {
                    const postData = {
                        name: nameRefAdd.current.value,
                        description: descriptionRefAdd.current.value,
                        stock: parseInt(stockRefAdd.current.value),
                        price: parseFloat(priceRefAdd.current.value),
                        isAvailable: stockRefAdd.current.value > 0 ? true : false,
                        categoryId: data[0].id
                    };

                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products`, {
                        method: "post",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(postData),
                    }).then((res) => res.json())
                        .then((data) => {
                            setTimeout(() => {
                                setProducts(prev => ([...prev, {
                                    id: data.data,
                                    name: postData.name,
                                    description: postData.description,
                                    stock: postData.stock,
                                    price: postData.price,
                                    isAvailable: postData.isAvailable,
                                    categoryId: postData.categoryId
                                }]))
                            }, "1000");
                            if (orders) {
                                //{"2":0,"3":2,"4":0}
                                orders.forEach(order => {
                                    let k = order.products
                                    k[data.data] = 0
                                    let postData = {
                                        products: k,
                                    };
                                    fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/orders/${order.id}`, {
                                        method: "put",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(postData),
                                    }).then((res) => res.json())
                                        .then(data => {
                                            console.log(data)
                                        })
                                })
                            }
                        });

                    if (imageUpload === null) return;
                    const imageRef = ref(storage, `${postData.name}`)
                    uploadBytes(imageRef, imageUpload)

                    setShowProductAdd(false)
                }
            });
    };

    const handleDeleteProducts = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                const imageRef = ref(storage, data.name);
                deleteObject(imageRef)
            });

        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products/${id}`, {
            method: "DELETE",
        }).then((res) => res.json())
            .then((data) => {
                let index = products.findIndex(obj => obj.id == data.data);
                products.splice(index, 1);
                setProducts([...products]);
            });
    };

    const buildTableProducts = () => {
        let result = [];
        if (products && categories.length) {
            for (let i = 0; i < products.length; i++) {
                let category = ""
                for (let j = 0; j < categories.length; j++) {
                    if (categories[j]) {
                        if (products[i].categoryId === categories[j].id) {
                            category = categories[j].name
                        }
                    }
                }
                result.push(
                    <tr>
                        <td>{products[i].id}</td>
                        <td>{products[i].name}</td>
                        <td>{products[i].description}</td>
                        <td>{category}</td>
                        <td>{products[i].stock}</td>
                        <td>{products[i].price}</td>
                        <td>{products[i].isAvailable ? "Da" : "Nu"}</td>
                        <td><img id={`${'img' + products[i].name}`} style={{ width: "200px", height: "100px" }}></img></td>
                        <td >
                            <Button
                                variant="outline-danger"
                                className="m-1 rounded"
                                onClick={() => {
                                    handleDeleteProducts(products[i].id);
                                }}
                            >
                                Șterge produs
                            </Button>
                            <Button
                                variant="outline-success"
                                className="m-1 rounded"
                                onClick={() => {
                                    handleShowProduct();
                                    getProduct(products[i].id);
                                    setProduct(null)
                                    setError("")
                                }}
                            >
                                Editează produs
                            </Button>
                        </td>
                    </tr>
                );
                const imageRef = ref(storage, `${products[i].name}`)
                getDownloadURL(imageRef).then((url) => {
                    const img = document.getElementById(`${'img' + products[i].name}`);
                    if (img) {
                        img.setAttribute('src', url);
                        console.log(url)
                    }
                });
            }
            return result;

        }
    };

    useEffect(() => {
        getProducts(filterString, sortField, sortOrder, page);
    }, [filterString,
        sortField,
        sortOrder,
        page]);

    useEffect(() => {
        if (products) {
            products.forEach(product => {
                getCategory(product.categoryId);
            });
        }
    }, [products]);

    useEffect(() => {
        getOrders();
    }, []);

    const handlePageClick = async (data) => {
        setPage(data.selected);
        setFirst(data.selected * 2);
    };

    return (
        <>
            <Modal show={showProduct} onHide={handleCloseProduct} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Editează produsul </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {product && (
                        <Form>
                            <Form.Group id="name">
                                <Form.Label>Denumire produs</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={nameRef}
                                    required
                                    defaultValue={product[0].name}
                                ></Form.Control>
                                <Form.Label>Descriere</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={descriptionRef}
                                    required
                                    defaultValue={product[0].description}
                                ></Form.Control>
                                <Form.Label>Categorie</Form.Label>
                                <Form.Select className="mb-3" ref={categoryRef} defaultValue={product[0].category}>
                                    <option value="Telefoane">Telefoane</option>
                                    <option value="Laptopuri">Laptopuri</option>
                                    <option value="Tablete">Tablete</option>
                                    <option value="Accesorii">Accesorii</option>
                                    <option value="PC">PC</option>
                                    <option value="Periferice">Periferice</option>
                                </Form.Select>
                                <Form.Label>Stock</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={stockRef}
                                    required
                                    defaultValue={product[0].stock}
                                ></Form.Control>
                                <Form.Label>Pret</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    ref={priceRef}
                                    required
                                    defaultValue={product[0].price}
                                ></Form.Control>
                                <Form.Label>Imagine noua</Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="file"
                                    required
                                    onChange={(event) => { setImageUpload(event.target.files[0]) }}
                                ></Form.Control>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button
                        className="btn btn-warning w-25"
                        onClick={handleCloseProduct}
                    >
                        Anulează
                    </Button>
                    {product && (
                        <Button
                            className="btn btn-success w-25"
                            onClick={() => {
                                putProduct(product[0].id);
                            }}
                        >
                            Salvează
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
            <Modal
                show={showProductAdd}
                onHide={handleCloseProductAdd}
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Adaugă un produs </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form>
                        <Form.Group id="name1">
                            <Form.Label>Denumire produs</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={nameRefAdd}
                            ></Form.Control>
                            <Form.Label>Descriere</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={descriptionRefAdd}
                            ></Form.Control>
                            <Form.Label>Categorie</Form.Label>
                            <Form.Select className="mb-3" ref={categoryRefAdd}>
                                <option value="Telefoane">Telefoane</option>
                                <option value="Laptopuri">Laptopuri</option>
                                <option value="Tablete">Tablete</option>
                                <option value="Accesorii">Accesorii</option>
                                <option value="PC">PC</option>
                                <option value="Periferice">Periferice</option>
                            </Form.Select>
                            <Form.Label>Stock</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={stockRefAdd}
                            ></Form.Control>
                            <Form.Label>Pret</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={priceRefAdd}
                            ></Form.Control>
                            <Form.Label>Imagine</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="file"
                                onChange={(event) => { setImageUpload(event.target.files[0]) }}
                            ></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button
                        className="btn btn-warning w-25"
                        onClick={handleCloseProductAdd}
                    >
                        Anulează
                    </Button>
                    <Button
                        className="btn btn-success w-25"
                        onClick={() => {
                            postProduct();
                        }}
                    >
                        Adaugă
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="d-flex flex-row">
                <Button
                    style={{
                        alignItems: "center",
                        width: "50%",
                        marginBottom: "2rem",
                        marginRight: "1rem"
                    }}
                    variant="outline-primary"
                    className="rounded w-25"
                    onClick={() => {
                        handleShowProductAdd();
                        setError("")
                    }}
                >
                    Adaugă un produs
                </Button>
                <DropdownButton
                    as={ButtonGroup}
                    variant="outline-primary"
                    id="dropdown-item-button"
                    title="Sortează după"
                    style={{ width: "25%", marginBottom: "2rem", marginRight: "1rem" }}
                >
                    <div className="m-1">
                        <DropdownButton
                            as={ButtonGroup}
                            id="dropdown-button-drop-end"
                            variant="outline-primary"
                            drop="end"
                            title="Denumire produs"
                            className="mt-0"
                            style={{ width: "100%" }}
                        >
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setSortOrder(1);
                                    setSortField("name");
                                }}
                            >
                                Ascendent <AiOutlineSortAscending />
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setSortOrder(-1);
                                    setSortField("name");
                                }}
                            >
                                Descendent <AiOutlineSortDescending />
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>

                    <div className="m-1">
                        <DropdownButton
                            as={ButtonGroup}
                            id="dropdown-button-drop-end"
                            variant="outline-primary"
                            drop="end"
                            title="Pret"
                            className="mt-1"
                            style={{ width: "100%" }}
                        >
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setSortOrder(1);
                                    setSortField("price");
                                }}
                            >
                                Ascendent <AiOutlineSortAscending />
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={() => {
                                    setSortOrder(-1);
                                    setSortField("price");
                                }}
                            >
                                Descendent <AiOutlineSortDescending />
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </DropdownButton>
                <InputGroup
                    style={{
                        alignItems: "center",
                        width: "50%",
                        marginBottom: "2rem",
                    }}
                >
                    <Form.Control
                        placeholder="Caută un produs"
                        aria-label="Caută un produs"
                        aria-describedby="basic-addon2"
                        className="rounded"
                        onChange={handleFilter}
                    />
                    <FcSearch
                        style={{
                            width: "30px",
                            height: "30px",
                            marginLeft: "2px",
                        }}
                    />
                </InputGroup>
            </div>
            <div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Denumire</th>
                            <th>Descriere</th>
                            <th>Categorie</th>
                            <th>Stock</th>
                            <th>Pret</th>
                            <th>Este disponibil?</th>
                            <th>Imagine</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>{buildTableProducts()}</tbody>
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
