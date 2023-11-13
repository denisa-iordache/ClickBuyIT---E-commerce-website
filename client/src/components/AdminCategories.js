import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal, ButtonGroup, Table, Dropdown, DropdownButton, InputGroup } from "react-bootstrap";
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

export default function AdminCategories() {
    const [categories, setCategories] = useState(null);
    const [count, setCount] = useState(0);

    const [category, setCategory] = useState(null);

    const [filterString, setFilterString] = useState("");

    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState(1);

    const [page, setPage] = useState(0);
    const [first, setFirst] = useState(0);

    const nameRef = useRef();
    const nameRefAdd = useRef();

    const [showCategory, setShowCategory] = useState(false);
    const [showCategoryAdd, setShowCategoryAdd] = useState(false);
    const handleCloseCategory = () => setShowCategory(false);
    const handleShowCategory = () => setShowCategory(true);
    const handleCloseCategoryAdd = () => setShowCategoryAdd(false);
    const handleShowCategoryAdd = () => setShowCategoryAdd(true);

    const [filters, setFilters] = useState({
        name: { value: null },
    });

    const handleFilter = (event) => {
        setFilters({
            name: { value: event.target.value },
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
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categories?${filterString}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""
            }&page=${page}&pageSize=${11}}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.records);
                setCount(data.count)
            });
    };

    const getCategory = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categoriesId/${id}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setCategory(data);
            });
    };

    const handleSort = (evt) => {
        console.warn(evt);
        setSortField(evt.sortField);
        setSortOrder(evt.sortOrder);
    };

    const putCategory = (id) => {
        let postData = {
            name: nameRef.current.value
        };
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categories/${id}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        }).then((res) => res.json())
            .then((data) => {
                setCategories(prevState => {
                    return prevState.map((item) => {
                        return item.id === data.data ? { ...item, name: postData.name } : item
                    })
                })
            });
        setShowCategory(false)
    };

    const postCategory = () => {
        const postData = {
            name: nameRefAdd.current.value,
        };

        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categories`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        }).then((res) => res.json())
            .then((data) => {
                setCategories(prev => ([...prev, { id: data.data, name: postData.name }]))
            });

        setShowCategoryAdd(false)
    };

    const handleDeleteCategory = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/categories/${id}`, {
            method: "DELETE",
        }).then((res) => res.json())
            .then((data) => {
                let index = categories.findIndex(obj => obj.id == data.data);
                categories.splice(index, 1);
                setCategories([...categories]);
            });
    };

    const buildTableCategories = () => {
        let result = [];
        if (categories) {
            categories.forEach((category) => {
                result.push(
                    <tr>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td className="d-flex">
                            <Button
                                variant="outline-danger"
                                className="m-1 rounded"
                                onClick={() => {
                                    handleDeleteCategory(category.id);
                                }}
                            >
                                Șterge categorie
                            </Button>
                            <Button
                                variant="outline-success"
                                className="m-1 rounded"
                                onClick={() => {
                                    handleShowCategory();
                                    getCategory(category.id);
                                    setCategory(null)
                                }}
                            >
                                Editează categorie
                            </Button>
                        </td>
                    </tr>
                );
            })
            return result;
        }
    };

    useEffect(() => {
        getCategories(filterString, sortField, sortOrder, page);
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
            <Modal show={showCategory} onHide={handleCloseCategory} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Editează categoria </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {category && (
                        <Form.Group id="name">
                            <Form.Label>Denumire categorie</Form.Label>
                            <Form.Control
                                className="mb-3"
                                type="text"
                                ref={nameRef}
                                required
                                defaultValue={category[0].name}
                            ></Form.Control>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button
                        className="btn btn-warning w-25"
                        onClick={handleCloseCategory}
                    >
                        Anulează
                    </Button>
                    {category && (
                        <Button
                            className="btn btn-success w-25"
                            onClick={() => {
                                putCategory(category[0].id);
                            }}
                        >
                            Salvează
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
            <Modal
                show={showCategoryAdd}
                onHide={handleCloseCategoryAdd}
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Adaugă o categorie </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group id="name1">
                        <Form.Label>Denumire categorie</Form.Label>
                        <Form.Control
                            className="mb-3"
                            type="text"
                            ref={nameRefAdd}
                        ></Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button
                        className="btn btn-warning w-25"
                        onClick={handleCloseCategoryAdd}
                    >
                        Anulează
                    </Button>
                    <Button
                        className="btn btn-success w-25"
                        onClick={() => {
                            postCategory();
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
                        handleShowCategoryAdd();
                    }}
                >
                    Adaugă o categorie
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
                            title="Denumire categorie"
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
                </DropdownButton>
                <InputGroup
                    style={{
                        alignItems: "center",
                        width: "50%",
                        marginBottom: "2rem",
                    }}
                >
                    <Form.Control
                        placeholder="Caută o categorie"
                        aria-label="Caută o categorie"
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
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>{buildTableCategories()}</tbody>
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
