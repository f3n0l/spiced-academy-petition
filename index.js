const path = require("path");
const express = require("express");
const app = express();

//handlebars
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

//db functions
const {
    createSignature,
    getSignatures,
    getSignatureById,
    createUser,
    login,
    getSignaturesByCity,
    updateUser,
    upsertUserProfile,
    getUserInfo,
    createProfile,
    deleteSignature,
    getSignatureByUserId,
} = require("./db");

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

app.use((request, response, next) => {
    response.setHeader("X-Frame-Options", "DENY");
    next();
});

// HOMEPAGE

app.get("/", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/register");
        return;
    }

    if (request.session.signature_id) {
        response.redirect("/thank-you");
        return;
    }
    response.render("homepage");
});

app.post("/", (request, response) => {
    console.log("POST/", request.body, request.session);
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }

    if (!request.body.signature) {
        response.render("homepage", { error: "fill all fields" });

        return;
    }
    createSignature({ ...request.body, user_id: request.session.user_id })
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

//REGISTER

app.get("/register", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/");
        return;
    }
    response.render("register");
});

app.post("/register", (request, response) => {
    console.log("POST /register", request.body);
    createUser(request.body)
        .then((newUser) => {
            console.log("user", newUser);
            request.session.user_id = newUser.id;
            response.redirect("/");
        })
        .catch((error) => {
            console.log("error", error);
            if (error.constraint === "users_email_key") {
                response.status(400).render("register", {
                    error: "Email already existing",
                });
                return;
            }
            response.status(500).render("register", {
                error: "Registration unsuccessful",
            });
        });
});

//THANK YOU

app.get("/thank-you", (request, response) => {
    getSignatureById(request.session.signature_id).then((signature) => {
        if (!request.session.user_id) {
            response.redirect("/login");
            return;
        }

        if (!signature) {
            response.redirect("/");
            return;
        }
        response.render("thank-you", { signature });
    });
});

app.get("/signatures", (request, response) => {
    getSignatures().then((signatures) => {
        response.render("signatures", {
            signatures,
        });
    });
});

app.get("/signatures/:city", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    if (!request.session.signature_id) {
        response.redirect("/");
        return;
    }
    getSignaturesByCity(request.params.city).then((signatures) => {
        response.render("signaturesByCity", {
            title: "Signatures in this City",
            city: request.params.city,
            signatures,
        });
    });
});

//LOGIN

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/login", (request, response) => {
    console.log("login", request.body);
    login(request.body)
        .then((foundUser) => {
            if (!foundUser) {
                response.render("login", {
                    error: "Login not successfull",
                });
                return;
            }
            request.session.user_id = foundUser.id;
            getSignatureByUserId(foundUser.id).then((signature) => {
                if (signature) {
                    request.session.signature_id = signature.id;
                }
                response.redirect("/");
            });
        })
        .catch((error) => {
            console.log("register error", error);
            response
                .status(500)
                .render("register", { error: "registry error" });
        });
});

//PROFILE

app.post("/profile", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    createProfile({
        user_id: request.session.user_id,
        ...request.body,
    })
        .then(response.redirect("/"))
        .catch((error) => {
            console.log("profile", error);
            response.render("profile", {
                error: `Please enter all values`,
            });
        });
});

app.get("/profile", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }

    response.render("profile");
});

// EDIT PROFILE

app.get("/profile/edit", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }
    const user_id = request.session.user_id;
    getUserInfo(user_id).then((info) => {
        console.log(info);
        response.render("editProfile", {
            ...info,
        });
    });
});

app.post("/profile/edit", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/login");
        return;
    }

    Promise.all([
        updateUser({ user_id: request.session.user_id, ...request.body }),
        upsertUserProfile({
            user_id: request.session.user_id,
            ...request.body,
        }),
    ])
        .then(() => {
            response.redirect("/");
        })
        .catch((error) => {
            console.log("error", error);
            response
                .status(500)
                .render("editProfile", { error: "couldn't edit profile" });
        });
});

// delete signature

app.post("/deletesignature", (request, response) => {
    deleteSignature(request.session.user_id)
        .then(() => {
            request.session.signature_id = null;
            response.redirect("/");
        })

        .catch((error) => {
            console.log("couldn't delete signature", error);
        });
});

// delete profile?

//logout

app.post("/logout", (request, response) => {
    request.session = null;
    response.redirect("/login");
});

app.listen(8080, () => console.log("listening to server"));
