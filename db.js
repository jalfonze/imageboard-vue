const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/images-db");

module.exports.getImages = () => {
    return db.query(
        `
        SELECT * FROM images;
        `
    );
};

module.exports.postImage = (url, username, title, description) => {
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        `,
        [url, username, title, description]
    );
};
