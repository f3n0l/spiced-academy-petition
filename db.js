const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");
const DATABASE_NAME = "petition";
const { DATABASE_USER, DATABASE_PASSWORD } = require("./secrets.json");

const db = spicedPg(
    `postgres:${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`
);
function createSignature({ user_id, signature }) {
    return db
        .query(
            `INSERT INTO signatures 
            (user_id, signature) 
            VALUES ($1, $2) 
            RETURNING *`,
            [user_id, signature]
        )
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db
        .query(
            `
        SELECT * FROM users
        JOIN signatures ON signatures.user_id = users.id
        FULL JOIN user_profiles ON user_profiles.user_id = users.id
        WHERE signatures.signature IS NOT NULL
    `
        )
        .then((result) => result.rows);
}

function getSignaturesByCity(city) {
    return db
        .query(
            `
    SELECT * FROM users
    JOIN signatures ON signatures.user_id = users.id
    FULL JOIN user_profiles ON user_profiles.user_id = users.id
    WHERE signatures.signature IS NOT NULL
    AND user_profiles.city ILIKE $1`,
            [city]
        )
        .then((result) => result.rows);
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

function createProfile({ user_id, age, city, homepage }) {
    return db
        .query(
            `INSERT INTO user_profiles
    (user_id, age, city, homepage)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
            [user_id, age, city, homepage]
        )
        .then((result) => result.rows[0]);
}

//double profile

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
    getSignaturesByCity,
    createProfile,
};
