let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', function(req, res) {
    var img = fs.readFileSync('images/profile-1.jpg');
    res.writeHead(200, {'Content-Type': 'image/jpg'});
    res.end(img, 'binary');
});

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "user-account";

app.get('/get-profile', function(req, res) {
    let response = {};

    // Connect to the db
    MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
        if (err) throw err;

        let db = client.db(databaseName);
        let query = { userid: 1 };

        db.collection('users').findOne(query, function (err, result) {
            if (err) throw err;
            response = result;
            client.close();

            // Send response
            res.send(response ? response : {});
        });
    });
});

app.post('/update-profile', function(req, res) {
    let userObj = req.body;

    console.log('connecting to the db...');
    MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
        if (err) throw err;

        let db = client.db(databaseName);
        userObj['userid'] = 1;

        let query = { userid: 1 };
        var newValues = { $set: userObj };

        console.log('successfully connected to the user-account db');
        db.collection('users').updateOne(query, newValues, {upsert: true}, function (err, result) {
            if (err) throw err;
            console.log('successfully updated or inserted');
            client.close();
        });
    });

    // Send response
    res.send(userObj);
});

app.listen(3000, function() {
    console.log("app listening on port 3000!");
});