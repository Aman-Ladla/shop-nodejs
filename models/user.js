const mongodb = require("mongodb");
const { getDb } = require("../util/database");

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection("users").insertOne(this);
    }

    addToCart(product) {
        const db = getDb();

        const cartItemIndex = this.cart.items.findIndex(
            (cartItem) =>
                cartItem.productId.toString() === product._id.toString()
        );

        let updatedQuantity = 1;
        let updatedCartItems = [];
        updatedCartItems = [...this.cart.items];

        if (cartItemIndex > -1) {
            updatedQuantity = updatedCartItems[cartItemIndex].quantity + 1;
            updatedCartItems[cartItemIndex].quantity = updatedQuantity;
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: updatedQuantity,
            });
        }

        const updatedCart = {
            items: updatedCartItems,
        };
        return db
            .collection("users")
            .updateOne(
                { _id: new mongodb.ObjectId(this._id) },
                { $set: { cart: updatedCart } }
            );
    }

    static findById(userId) {
        const db = getDb();
        return db
            .collection("users")
            .findOne({ _id: new mongodb.ObjectId(userId) })
            .then((user) => {
                return user;
            })
            .catch((err) => console.log(err));
    }

    getCart() {
        const db = getDb();
        const prodIds = this.cart.items.map((item) => item.productId);

        return db
            .collection("products")
            .find({ _id: { $in: prodIds } })
            .toArray()
            .then((products) => {
                return products.map((product) => {
                    return {
                        ...product,
                        quantity: this.cart.items.find(
                            (item) =>
                                item.productId.toString() ===
                                product._id.toString()
                        ).quantity,
                    };
                });
            });
    }

    deleteItemFromCart(prodId) {
        const db = getDb();
        const updatedCartItems = this.cart.items.filter(
            (item) => item.productId.toString() !== prodId.toString()
        );
        return db
            .collection("users")
            .updateOne(
                { _id: new mongodb.ObjectId(this._id) },
                { $set: { cart: { items: updatedCartItems } } }
            );
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then((products) => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name,
                    },
                };
                return db.collection("orders").insertOne(order);
            })
            .then((result) => {
                this.cart = { items: [] };
                return db
                    .collection("users")
                    .updateOne(
                        { _id: new mongodb.ObjectId(this._id) },
                        { $set: { cart: { items: [] } } }
                    );
            });
    }

    getOrders() {
        const db = getDb();
        return db.collection("orders").find({ "user._id": this._id }).toArray();
    }
}

module.exports = User;
