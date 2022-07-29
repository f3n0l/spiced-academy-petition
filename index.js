const path = require("path");
const express = require("express");
const app = express();

//handlebars
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

//db functions
const { createSignature, getSignatures } = require("./db");

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.get("/", (request, response) => {
    response.render("homepage");
});

app.post("/", (request, response) => {
    console.log("POST/", request.body);

    if (
        !request.body.first_name || //unknown yet
        !request.body.last_name ||
        !request.body.signature
    ) {
        response.render("homepage", { error: "fill all fields" });
        return;
    }
    createSignature(
        request.body
        /*      {}   ...request.params,
        ...request.query, */
    )
        .then((newSignature) => {
            console.log("POST /", newSignature);
            response.redirect("/thank-you");
        })
        .catch((error) => {
            console.log("POST /", error);
            response.redirect("/");
        });
});

app.get("/signatures", (request, response) => {
    getSignatures().then((signatures) => {
        response.render("signatures", {
            signatures,
        }); // do query
    });
});

app.listen(8080, () => console.log("listening to server"));
