import { createContext, useEffect, useState } from "react";
import { useAuthentication } from "./context/AuthenticationContext";

export const ShopContext = createContext(null);

export const ShopContextProvider = (props) => {
    const [products, setProducts] = useState(null)
    const [cartItems, setCartItems] = useState({});
    const { currentUser } = useAuthentication();

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

    const getOrders = () => {
        if (currentUser) {
            getProducts()
            fetch(`${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/ordersUser/${currentUser.uid}`, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data[0]) {
                        if (data[0].type = "shoppingCart") {
                            setCartItems(data[0].products)
                        }
                    }
                });
        }
        else {
            fetch(
                `${`${window.location.protocol}//${window.location.hostname}:${window.location.port}`}/products`,
                {
                    method: "GET",
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    data.records.forEach(element => {
                        setCartItems(prev => ({ ...prev, [element.id]: 0 }))
                    });
                });
        }
    }

    const getDefaultCart = () => {
        let cart = {};
        if (products) {
            for (let i = 1; i < products.length + 1; i++) {
                cart[i] = 0;
            }
        }

        return cart;
    };

    useEffect(() => {
        getOrders()
        getProducts()
    }, []);

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        if (products) {
            for (const item in cartItems) {
                if (cartItems[item] > 0) {
                    let itemInfo = products.find((product) => product.id === Number(item));
                    totalAmount += cartItems[item] * itemInfo.price;
                }
            }
        }
        return totalAmount;
    };

    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    };

    const updateCartItemCount = (newAmount, itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: newAmount }));

    };

    const checkout = () => {
        setCartItems(getDefaultCart());
    };

    const contextValue = {
        cartItems,
        addToCart,
        updateCartItemCount,
        removeFromCart,
        getTotalCartAmount,
        checkout,
    };

    console.log(cartItems);

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};