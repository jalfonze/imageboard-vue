const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

app.use(express.static("./public"));
app.use(express.static("./sql"));
app.use(express.static("./uploads"));

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.get("/images", (req, res) => {
    db.getImages()
        .then((images) => {
            console.log(images.rows);
            let image = images.rows;
            res.json({
                image,
            });
        })
        .catch((err) => console.log("ERROR IN get images", err));
});

app.post("/upload", uploader.single("file"), (req, res) => {
    console.log("file: ", req.file);
    console.log("SUCESS UPLOAD", req.body);
    let { title, description, username } = req.body;
    let { path } = req.file;
    if (req.file) {
        //db insert here for the info
        console.log("FORTYNINE: ", path, username, title, description);
        db.postImage(path, username, title, description);
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => console.log("vue server is listening ..."));
