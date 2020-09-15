const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const { s3Url } = require("./config.json");

app.use(express.static("./public"));

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

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("file: ", req.file);
    console.log("SUCESS UPLOAD", req.body);
    let { title, description, username } = req.body;
    let { filename } = req.file;
    let url = `${s3Url}${filename}`;
    if (req.file) {
        //db insert here for the info
        db.postImage(url, username, title, description).then((newImg) => {
            console.log("NEW IMAGE:", newImg.rows[0]);
            let newImage = newImg.rows[0];
            res.json({ newImage });
        });
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => console.log("vue server is listening ..."));
