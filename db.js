const spicedPg = require("spiced-pg");

const DATABASE_NAME = "petition";
const { DATABASE_USER, DATABASE_PASSWORD } = require("./secrets.json");
/* const { decodeBase64 } = require("bcryptjs");
 */
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

module.exports = { createSignature, getSignatures, getSignatureById };
