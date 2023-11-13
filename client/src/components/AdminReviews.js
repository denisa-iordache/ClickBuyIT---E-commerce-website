import React, { useState, useEffect } from "react";
import { Form, Button, Table } from "react-bootstrap";

export default function AdminReviews() {
    const [comments, setComments] = useState(null);

    const getComments = () => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/comments`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setComments(data);
            });
    };

    const handleDelete = (id) => {
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/comments/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const handleAprove = (id) => {
        const postData = {
            status: "Aprobat",
        };
        fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/comments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        })
            .then((res) => res.json())
            .then((data) => {
                setComments(prevState => {
                    return prevState.map((item) => {
                        return item.id === data.data ? { ...item, status: postData.status } : item
                    })
                })
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        getComments();
    }, []);

    const buildTableComments = () => {
        let result = [];
        if (comments) {
            for (let i = 0; i < comments.length; i++) {
                result.push(
                    <tr>
                        <td>{comments[i].id}</td>
                        <td>{comments[i].continut}</td>
                        <td>{comments[i].data}</td>
                        <td>{comments[i].autor}</td>
                        <td>{comments[i].product}</td>
                        <td>{comments[i].status}</td>
                        <td>
                            <Button
                                variant="outline-danger"
                                className="mb-5 rounded"
                                onClick={() => {
                                    handleDelete(comments[i].id);
                                    window.location.reload();
                                }}
                            >
                                Șterge comentariu
                            </Button>
                            {comments[i].status === "In asteptare" && (
                                <Button
                                    variant="outline-success"
                                    className="mb-5 rounded"
                                    onClick={() => {
                                        handleAprove(comments[i].id);
                                    }}
                                >
                                    Aprobă comentariu
                                </Button>
                            )}
                        </td>
                    </tr>
                );
            }
            return result;
        }
    };

    return (
        <>
            <div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Id comentariu</th>
                            <th>Conținut</th>
                            <th>Data</th>
                            <th>Autor</th>
                            <th>Produs</th>
                            <th>Status</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>{buildTableComments()}</tbody>
                </Table>
            </div>
        </>
    );
}
