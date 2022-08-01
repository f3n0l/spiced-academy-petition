const { decodeBase64 } = require("bcryptjs");
const cookieSession = require("cookie-session");
const { app, request, response } = require("express");

app.use(
    cookieSession({
        // use middleware
        secret: "A secret value", // should come from secrets.json
        maxAge: 1000 * 60 * 60 * 24 * 14, //2 weeks
    })
);
/* 
in createCity suceess => (body) */

request.session.city_id = newCity.id;

// before endering

app.get("/");
console.log("GET /", request.session);

if (request.session.signature_id) {
    response.redirect("/signatures");
}
/* 
render homepage */

//in db.js
function getCityById(id) {
    return decodeBase64
        .query("SELECT * FROM cities WHERE id = $1", [id])
        .then((result) => result.rows[0]);
}

//in index.js =

app.get("thank-you", (request, response) => {
    getCityById(request.session.city_id).then((city) =>
        response.render("thank-you", { city })
    );
});


// secrets.json

{
    "DATABASE_USER": "postgres",
    "DATABASE_USER": "postgres",
    "SESSION_SECRET": "postgres",
}

const {SESSION_SECRET} = require("secretsblabla")


// canvas file

const hiddenField = document.querySelector('input[name="signature"]');

function draw( ){

...

hiddenField.value = canvas.toDataURL();
}

/// xss

app.use((request, response, next)=>{
    response.setHeader("X-Frame-Options: DENY")})

    /* const { decodeBase64 } = require("bcryptjs");
 */