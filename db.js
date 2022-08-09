const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");
const DATABASE_NAME = "petition";
const { DATABASE_USER, DATABASE_PASSWORD } = require("./secrets.json");
/* const db =
    process.env.DATABASE_URL ||
    "postgres://spicedling:password@localhost:5432/petition"; */

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

function getSignatureByUserId(user_id) {
    return db
        .query("SELECT * FROM signatures WHERE user_id = $1", [user_id])
        .then((result) => result.rows[0]);
}

function login({ email, password }) {
    console.log(email, password);
    return getUserByEmail(email).then((foundUser) => {
        if (!foundUser) {
            console.log("Email not found");
            return null;
        }
        return bcrypt
            .compare(password, foundUser.password_hash)
            .then((match) => {
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

function getUserInfo(user_id) {
    return db
        .query(
            `
        SELECT users.first_name, users.last_name, users.email, user_profiles.*
        FROM users
        FULL JOIN user_profiles
        ON user_profiles.user_id = users.id
        WHERE users.id = $1
        `,
            [user_id]
        )
        .then((result) => result.rows[0]);
}

function updateUser({ user_id, first_name, last_name, email }) {
    return db
        .query(
            "UPDATE users SET first_name= $1, last_name = $2, email = $3 WHERE id = $4 RETURNING *",
            [first_name, last_name, email, user_id]
        )
        .then((result) => result.rows[0]);
}
function upsertUserProfile({ user_id, age, city, homepage }) {
    return db
        .query(
            `
        INSERT INTO user_profiles (user_id, age, city, homepage)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $2, city = $3, homepage = $4`,
            [user_id, age ? age : null, city, homepage]
        )
        .then((result) => result.rows[0]);
}

function deleteSignature(user_id) {
    return db
        .query(
            `
    DELETE FROM signatures WHERE user_id = $1`,
            [user_id]
        )
        .then((result) => result.rows[0]);
}

module.exports = {
    createSignature,
    getSignatures,
    getSignatureById,
    login,
    createUser,
    getSignaturesByCity,
    createProfile,
    getUserInfo,
    updateUser,
    upsertUserProfile,
    deleteSignature,
    getSignatureByUserId,
};
