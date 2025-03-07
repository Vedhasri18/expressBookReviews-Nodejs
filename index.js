const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// ✅ Fix: Apply session middleware BEFORE defining routes
app.use(session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// ✅ Fix: Ensure session token is properly validated
app.use("/customer/auth/*", function auth(req, res, next) {
    if (!req.session || !req.session.accessToken) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = req.session.accessToken;

    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
        req.user = decoded;
        next();
    });
});

const PORT = 6000;
app.listen(PORT, () => console.log("Server is running on port " + PORT));
