const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");
const DATABASE_NAME = "petition";
const { DATABASE_USER, DATABASE_PASSWORD } = require("./secrets.json");

const db = spicedPg(
    `postgres:${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`
);
function createSignature({ first_name, last_name, signature }) {
    return db
        .query(
            `INSERT INTO signatures 
            (first_name, last_name, signature) 
            VALUES ($1, $2, $3) 
            RETURNING *`,
            [first_name, last_name, signature]
        )
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db.query("SELECT * FROM signatures").then((result) => result.rows);
}

function getSignatureById(id) {
    return db
        .query("SELECT * FROM signatures WHERE id = $1", [id])
        .then((result) => result.rows[0]);
}

function login({ email, password }) {
    return getUserByEmail(email).then((foundUser) => {
        if (!foundUser) {
            console.log("Email not found");
            return null;
        }
        bcrypt.compare(password, foundUser.password_hash).then((match) => {
            if (match) {
                return foundUser;
            }
            return null;
        });
    });
}

function getUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email = $1", [email])
        .then((result) => result.rows[0]);
}

const hash = (password) =>
    bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt));

function createUser({ first_name, last_name, email, password }) {
    return hash(password).then((password_hash) => {
        return db
            .query(
                `INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`,
                [first_name, last_name, email, password_hash]
            )
            .then((result) => result.rows[0]);
    });
}

module.exports = {
    createSignature,
    getSignatures,
    getSignatureById,
    login,
    createUser,
};
