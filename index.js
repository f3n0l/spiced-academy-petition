const path = require("path");
const express = require("express");
const app = express();

//handlebars
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

//db functions
const { createSignature, getSignatures, getSignatureById } = require("./db");
const { SESSION_SECRET } = require("./secrets.json");
const cookieSession = require("cookie-session");

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/", (request, response) => {
    if (request.session.signature_id) {
        response.redirect("/signatures");
    }
    response.render("homepage");
});

app.post("/", (request, response) => {
    console.log("POST/", request.body);

    if (
        !request.body.first_name ||
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
            request.session.signature_id = newSignature.id;
            response.redirect("/thank-you");
        })
        .catch((error) => {
            console.log("POST /", error);
            response.redirect("/");
        });
});
app.get("/thank-you", (request, response) => {
    getSignatureById(request.session.signature_id).then((signature) =>
        response.render("thank-you", { signature })
    );
});

app.get("/signatures", (request, response) => {
    getSignatures().then((signatures) => {
        response.render("signatures", {
            signatures,
        }); // do query
    });
});

/* app.use((request, response, next) => {
    response.setHeader("X-Frame-Options: DENY");
    next;
}); */

app.listen(8080, () => console.log("listening to server"));
