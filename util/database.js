const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async (cb) => {
    const client = await MongoClient.connect(
        "mongodb+srv://Aman:jO0soXDe9RJHKhYP@cluster0.m999jqp.mongodb.net/shop?retryWrites=true&w=majority"
    );
    _db = client.db();
    cb();
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No Database Found!";
};

exports.mongoConnect = mongoConnect;

exports.getDb = getDb;
