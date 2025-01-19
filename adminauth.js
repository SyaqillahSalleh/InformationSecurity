const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const config = require('./config.json');
const bcrypt = require('bcrypt');

const {verifyhash} = require('./auth.js');
const jwt = require('jsonwebtoken');

const app = express();
const uri = config.db
const secret = config.secret
const saltrounds = config.saltrounds

const master = config.masterpass //Please pretend this is encrypted, might forget if it is really encrypted.

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json())

app.get("/", async(req, res) => {
    res.send("Admin Interface root thing.");
})

app.post("/register", async (req, res) => {
    if(!(req.body.password && req.body.name && req.body.masterpassword)) {
        res.send("Name and password required for registering a admin, and Master Password.");
        return;
    }

    if(req.body.masterpassword != master) {
        res.send("Invalid Authorization.")
        return
    }

   let namecheck = await client.db("general").collection("Admins").findOne({
        name: req.body.name
    })

    if(namecheck) {
        res.send("Admin username already taken.");
        return;
    }

    const hash = bcrypt.hashSync(req.body.password, saltrounds);
    let regresult = await client.db("general").collection("Admins").insertOne({
        name: req.body.name,
        password: hash
    });

    if(regresult) {
        console.log(regresult)
        res.send(regresult)
    }
    else {
        console.log ("[ERR] Registeration failed unexpectedly")
        res.send("Something failed...?")
    }
})

app.post("/login", async(req, res) => {
     if(!(req.body.password && req.body.name)) {
        res.send("Please login with password (pass) and admin name (name)");
        return;
    }
    const token = await authencheck(req.body.name, req.body.password)
    if(!token) {
        res.send("Authentication failure, check your info.");
        return;
    }
    nonsense = "Welcome admin.";
    res.send({"Token":token, "Auth":"Success", "motd": nonsense});
})



app.delete('/eraseuser/:id', adminhash, async (req, res) => {
    if(!res.locals.success) {
        if(typeof res.locals.output !== 'undefined') {
            res.send(res.locals.output);
            return
        }
        else {
            res.send("Unknown error occured.");
            return
        }
    }

    _id = new ObjectId(req.params.id);

    let result = await client.db("general").collection("Users").findOne({
        _id: _id
    })

    if(!result) {
        res.send("ID does not match any user.")
        return
    }

    let delresult = await client.db("general").collection("Users").deleteOne({
        _id: _id
    })
    res.send({"Status": delresult, "Message": "User has been deleted."})
    console.log(delresult)
})


app.delete('/eraseself/:id', verifyhash, async (req, res) => {
    if(!res.locals.success) {
        if(typeof res.locals.output !== 'undefined') {
            res.send(res.locals.output);
            return
        }
        else {
            res.send("Unknown error occured.");
            return
        }
    }
    if(req.params.id != res.locals.output.id) {
        res.send("Token user and user mismatch.")
        return
    }

    _id = new ObjectId(req.params.id);

    let result = await client.db("general").collection("Admins").findOne({
        _id: _id
    })

    if(!result) {
        res.send("ID does not match any user.")
        return
    }

    let delresult = await client.db("general").collection("Admins").deleteOne({
        _id: _id
    })
    res.send({"Status": delresult, "Message": "Self Destructed."})
    console.log(delresult)
})

async function authencheck(username, password) {
    token = false;
    let namecheck = await client.db("general").collection("Admins").findOne({
        name: username
    })

    if(!namecheck) {
        console.log(namecheck)
        return token;
    }

    const hashpass = await bcrypt.compare(password, namecheck.password);

    if(hashpass) {
        /*
        jwt.sign({"id": namecheck._id}, secret, {expiresIn:"30m"}, (err, asyncToken) => {
            if (err) throw err;
            token = asyncToken
        });
        */
        token = jwt.sign({"id": namecheck._id}, secret, {expiresIn:"10m"});
    }
    return token;
}

function adminhash(req, res, next) {
    if(!req.headers.authorization) {
        res.locals.success = false;
        res.locals.output + "Authorization token missing."
        return;
    }

    TokenArray =req.headers.authorization.split(" ");
    try {
        const output = jwt.verify(TokenArray[1], secret);
        res.locals.output = output
        res.locals.success = true
        next();
    }
    catch(err) {
        res.locals.success = false;
        if(err.name == "TokenExpiredError") {
            res.locals.success = false;
            res.locals.output = "Token is Expired.";
            next();
            }
        else if(err.name == "JsonWebTokenError") {
            res.locals.output = err.message;
            next();
            }
        else {
            res.locals.output = "Generic Unknown Error";
            next();
        }
    }
}


module.exports = app
