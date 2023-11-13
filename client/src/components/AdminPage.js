import React, { useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import HeaderAdmin from "./HeaderAdmin";
import Footer from "./Footer";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminCart from "./AdminCart";
import AdminReviews from "./AdminReviews";

export default function AdminPage() {
    const [content, setContent] = useState(
        <div>
            <img
                className="d-block w-100"
                src="undraw_software_engineer_re_tnjc.svg"
                alt="Forth slide"
            />
        </div>
    );

    return (
        <>
            <HeaderAdmin />
            <div
                className="d-md-grid shadow-lg"
                style={{
                    gridTemplateColumns: "1fr 5fr",
                    position: "relative",
                    zIndex: "1",
                    marginBottom: "100px",
                    backgroundColor: "white",
                    minHeight: "100vh",
                }}
            >
                <div
                    className="d-flex flex-column align-items-center border border-2"
                    style={{
                        background: "white",
                    }}
                >
                    <ButtonGroup vertical style={{ width: "90%" }}>
                        <Button
                            variant="outline-primary"
                            className="mt-3 mb-5 rounded"
                            onClick={() => {
                                setContent(
                                    <AdminProducts />
                                );
                            }}
                        >
                            Produse
                        </Button>
                        <Button
                            variant="outline-primary"
                            className="mb-5 rounded"
                            onClick={() => {
                                setContent(
                                    <AdminReviews />
                                );
                            }}
                        >
                            Reviews
                        </Button>
                        <Button
                            variant="outline-primary"
                            className="mb-5 rounded"
                            onClick={() => {
                                setContent(
                                    <AdminCategories />
                                );
                            }}
                        >
                            Categorii
                        </Button>
                        <Button
                            variant="outline-primary"
                            className="mb-5 rounded"
                            onClick={() => {
                                setContent(
                                    <AdminCart />
                                );
                            }}
                        >
                            Comenzi
                        </Button>
                    </ButtonGroup>
                </div>
                <div className="d-flex flex-column m-3">{content}</div>
            </div>
            <Footer />
        </>
    );
}
