import { useContext, useEffect, useState } from "react";
import {
    ListGroup,
    Form,
    Dropdown,
    DropdownButton,
    ButtonGroup,
    InputGroup,
    Row,
    Container,
    Col
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Accordion, Button } from "react-bootstrap";
import { useAuthentication } from "./context/AuthenticationContext";
import { storage } from "../firebase"
import { getDownloadURL, ref } from "firebase/storage"
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
import { ShopContext } from "./ShopContext";
import { useNavigate } from "react-router-dom";

export default function Products() {
    const navigate = useNavigate();
    const { addToCart, cartItems } = useContext(ShopContext)
    const { currentUser } = useAuthentication();

    const mediaMatch = window.matchMedia("(min-width: 768px)");
    const [matches, setMatches] = useState(mediaMatch.matches);

    const [products, setProducts] = useState(null);
    const [count, setCount] = useState(0);

    const [categories, setCategories] = useState(null);
    const [category, setCategory] = useState(null);

    const [filterString, setFilterString] = useState("");
    const [filter, setFilter] = useState("");

    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState(1);

    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);

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

    const getCategories = () => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categories`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.records);
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
            });
    };

    useEffect(() => {
        const handler = (e) => setMatches(e.matches);
        mediaMatch.addListener(handler);
        return () => mediaMatch.removeListener(handler);
    });

    const handleSort = (evt) => {
        console.warn(evt);
        setSortField(evt.sortField);
        setSortOrder(evt.sortOrder);
    };

    const getProductsFiltered = () => {
        let range = document.getElementById("rangePrice");
        let checkbox1 = document.getElementById("inline-checkbox-1");

        if (category) {
            let checkbox = document.getElementById(category);
            if (checkbox.checked && range.value && checkbox1.checked == true) {
                setFilters({
                    name: { value: null },
                    price: { value: range.value },
                    isAvailable: { value: 1 },
                    categoryId: { value: category }
                });
            } else if (checkbox.checked == true && range.value) {
                setFilters({
                    name: { value: null },
                    price: { value: range.value },
                    isAvailable: { value: null },
                    categoryId: { value: category }
                });
            } else if (checkbox.checked == true && checkbox1.checked == true) {
                setFilters({
                    name: { value: null },
                    price: { value: null },
                    isAvailable: { value: 1 },
                    categoryId: { value: category }
                });
            } else if (checkbox.checked == true) {
                setFilters({
                    name: { value: null },
                    price: { value: null },
                    isAvailable: { value: null },
                    categoryId: { value: category }
                });
            } else {
                setFilters({
                    name: { value: null },
                    price: { value: null },
                    isAvailable: { value: null },
                    categoryId: { value: null }
                });
            }
        }
        else {
            if (range.value && checkbox1.checked) {
                setFilters({
                    name: { value: null },
                    price: { value: range.value },
                    isAvailable: { value: 1 },
                    categoryId: { value: null }
                });
                console.log(filterString)
            } else if (range.value) {
                setFilters({
                    name: { value: null },
                    price: { value: range.value },
                    isAvailable: { value: null },
                    categoryId: { value: null }
                });
            } else if (checkbox1.checked) {
                setFilters({
                    name: { value: null },
                    price: { value: null },
                    isAvailable: { value: 1 },
                    categoryId: { value: null }
                });
            }
            else {
                setFilters({
                    name: { value: null },
                    price: { value: null },
                    isAvailable: { value: null },
                    categoryId: { value: null }
                });
            }
        }

    }

    useEffect(() => {
        console.log(category);
        getProductsFiltered()
    }, [category]);

    const buildCategoriesChecks = () => {
        const categoriesChecks = [];
        if (categories) {
            categories.forEach((category) => {
                categoriesChecks.push(
                    <ListGroup.Item className="d-flex align-items-baseline">
                        <input
                            type="checkbox"
                            style={{ marginRight: "1rem" }}
                            id={`${category.id}`}
                            onChange={() => {
                                setCategory(category.id);
                                getProductsFiltered()
                            }
                            }
                        />
                        <p>{category.name}</p>
                    </ListGroup.Item>
                );
            });
        }
        return categoriesChecks;
    };

    const cards = () => {
        const cards = [];
        if (products) {
            products.forEach((product) => {
                {
                    matches ? (
                        cards.push(
                            <Col xs="3">
                                <Card style={{ minHeight: "440px", margin: "1rem" }} className="shadow">
                                    <Card.Img className="p-2" id={`${'img' + product.name}`} variant="top" onClick={() => { navigate(`/dashboard/${product.id}/product`) }} />
                                    <Card.Body className="d-flex flex-column">

                                        <Card.Title className="mb-auto">
                                            {product.name.length > 40 ? product.name.substring(0, 40) + "..." : product.name}
                                        </Card.Title>

                                        <Card.Text>
                                            <div className="d-flex flex-column">
                                                {product.isAvailable ? <span className="text-success">In stoc</span> : <span className="text-danger">Indisponibil</span>}
                                                <span>{product.price} lei</span>
                                            </div>
                                        </Card.Text>

                                        {product.isAvailable ? <Button variant="primary" onClick={() => addToCart(product.id)}>Adauga in cos {cartItems[product.id] > 0 && <>({cartItems[product.id]})</>}
                                        </Button> :
                                            <Button variant="primary" onClick={() => addToCart(product.id)} disabled>Adauga in cos {cartItems[product.id] > 0 && <>({cartItems[product.id]})</>}
                                            </Button>}
                                    </Card.Body>
                                </Card>
                            </Col>
                        )
                    ) : (
                        cards.push(
                            <Col xs="12">
                                <Card style={{ minHeight: "440px", margin: "1rem" }} className="shadow">
                                    <Card.Img className="p-2" id={`${'img' + product.name}`} variant="top" onClick={() => { navigate(`/dashboard/${product.id}/product`) }} />
                                    <Card.Body className="d-flex flex-column">

                                        <Card.Title className="mb-auto">
                                            {product.name.length > 40 ? product.name.substring(0, 40) + "..." : product.name}
                                        </Card.Title>

                                        <Card.Text>
                                            <div className="d-flex flex-column">
                                                {product.isAvailable ? <span className="text-success">In stoc</span> : <span className="text-danger">Indisponibil</span>}
                                                <span>{product.price} lei</span>
                                            </div>
                                        </Card.Text>

                                        {product.isAvailable ? <Button variant="primary" onClick={() => addToCart(product.id)}>Adauga in cos {cartItems[product.id] > 0 && <>({cartItems[product.id]})</>}
                                        </Button> :
                                            <Button variant="primary" onClick={() => addToCart(product.id)} disabled>Adauga in cos {cartItems[product.id] > 0 && <>({cartItems[product.id]})</>}
                                            </Button>}
                                    </Card.Body>
                                </Card>
                            </Col>
                        )
                    )
                }
                const imageRef = ref(storage, `${product.name}`)
                getDownloadURL(imageRef).then((url) => {
                    const img = document.getElementById(`${'img' + product.name}`);
                    if (img) {
                        img.setAttribute('src', url);
                        console.log(url)
                    }
                });
            })
            return cards;
        };
    }

    useEffect(() => {
        getCategories();
        getProducts(filterString, sortField, sortOrder, page);
    }, [filterString,
        sortField,
        sortOrder,
        page]);


    const handlePageClick = async (data) => {
        setPage(data.selected);
        setFirst(data.selected * 2);
    };

    return (
        <>
            <div
                style={{
                    gridTemplateColumns: "1fr 5fr",
                    position: "relative",
                    zIndex: "1",
                    marginBottom: "100px",
                    backgroundColor: "white",
                }}
                className="d-md-grid shadow-lg"
            >
                <div className="p-3" style={{ flexShrink: "2" }}>
                    <Button
                        variant="outline-dark"
                        className="mb-2 w-100"
                        onClick={() => {
                            document
                                .querySelectorAll("input[type=checkbox]")
                                .forEach((el) => (el.checked = false));
                            setFilters({
                                name: { value: null },
                                price: { value: 10000 },
                                isAvailable: { value: null },
                                categoryId: { value: null }
                            });
                            document.getElementById("rangePrice").value = 10000
                            document.getElementById("output1").innerHTML = 10000
                        }}
                    >
                        Curăță toate filtrele
                    </Button>
                    {matches ? (
                        <ListGroup>
                            <ListGroup.Item>
                                <h4>Categorie</h4>
                                <ListGroup
                                    style={{
                                        maxHeight: "500px",
                                        marginBottom: "10px",
                                        overflow: "auto",
                                    }}
                                >
                                    {buildCategoriesChecks()}
                                </ListGroup>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <h4>Pret</h4>
                                <div className="d-flex mt-3">
                                    <p className="mr-1">0</p>
                                    <div className="slider">
                                        <Form.Range
                                            min="0"
                                            max="10000"
                                            defaultValue="10000"
                                            id="rangePrice"
                                            onChange={() => {
                                                getProductsFiltered();
                                                document.getElementById("output1").innerHTML =
                                                    document.getElementById("rangePrice").value;
                                            }}
                                        />
                                    </div>
                                    <p className="ml-1">10.000</p>
                                    <p
                                        style={{
                                            marginLeft: "50px",
                                        }}
                                        id="output1"
                                    ></p>
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <h4>Disponibilitate</h4>
                                <Form>
                                    <div key="inline-checkbox" className="mb-3 mt-3">
                                        <Form.Check
                                            inline
                                            label="In stoc"
                                            name="group1"
                                            type="checkbox"
                                            id="inline-checkbox-1"
                                            onChange={getProductsFiltered}
                                        />
                                    </div>
                                </Form>
                            </ListGroup.Item>
                        </ListGroup>
                    ) : (
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Categorie</Accordion.Header>
                                <Accordion.Body>
                                    <ListGroup
                                        style={{
                                            maxHeight: "300px",
                                            marginBottom: "10px",
                                            overflow: "auto",
                                        }}
                                    >
                                        {buildCategoriesChecks()}
                                    </ListGroup>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Pret</Accordion.Header>
                                <Accordion.Body>
                                    <div className="d-flex mt-3">
                                        <p className="mr-1">0</p>
                                        <Form.Range
                                            min="0"
                                            max="10000"
                                            defaultValue="10000"
                                            id="rangePrice"
                                            onChange={() => {
                                                getProductsFiltered();
                                                document.getElementById("output1").innerHTML =
                                                    document.getElementById("rangePrice").value;
                                            }}
                                        />
                                        <p className="ml-1">10.000</p>
                                        <p
                                            style={{
                                                marginLeft: "50px",
                                            }}
                                            id="output1"
                                        ></p>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>Disponibilitate</Accordion.Header>
                                <Accordion.Body>
                                    <Form>
                                        <div key="inline-checkbox" className="mb-3 mt-3">
                                            <Form.Check
                                                inline
                                                label="In stoc"
                                                name="group1"
                                                type="checkbox"
                                                id="inline-checkbox-1"
                                                onChange={getProductsFiltered}
                                            />
                                        </div>
                                    </Form>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )}
                </div>
                <div style={{ padding: "1rem" }}>
                    <ToastContainer />
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-6">
                                <DropdownButton
                                    as={ButtonGroup}
                                    variant="outline-primary"
                                    id="dropdown-item-button"
                                    title="Sortează după"
                                    style={{ width: "86%", marginBottom: "2rem" }}
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
                            </div>
                            <div className="col-sm-6">
                                <InputGroup
                                    style={{
                                        alignItems: "center",
                                        width: "100%",
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
                                            marginLeft: "1rem",
                                        }}
                                    />
                                </InputGroup>
                            </div>
                        </div>
                    </div>
                    <Container><Row>{cards()}</Row></Container>
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
            </div>
        </>
    )

}


