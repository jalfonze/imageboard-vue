const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/images-db");

module.exports.getImages = () => {
    return db.query(
        `
        SELECT * FROM images ORDER BY id DESC;
        `
    );
};

module.exports.postImage = (url, username, title, description) => {
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING url, username,title, description`,
        [url, username, title, description]
    );
};

module.exports.getInfo = (id) => {
    return db.query(
        `
        SELECT * FROM images
        WHERE id = ($1)
        `,
        [id]
    );
};

module.exports.postComment = (usercom, comment, id) => {
    return db.query(
        `
        INSERT INTO comments (usercom, comment, image_id)
        VALUES ($1, $2, $3)
        RETURNING usercom, comment, created_at
        `,
        [usercom, comment, id]
    );
};

module.exports.getComment = (id) => {
    return db.query(
        `
        SELECT * FROM comments
        WHERE image_id = ($1)
        ORDER BY created_at DESC
        `,
        [id]
    );
};
