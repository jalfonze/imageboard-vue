(function () {
    // no es6, no let, no const, no destructuring
    // using promises

    var form = document.getElementsByTagName("form");

    Vue.component("component-one", {
        template: "#component-one",
        props: ["photoId"], //always array value
        data: function () {
            return {
                modalComments: [],
                head: "",
                desc: "",
                user: "",
                url: "",
                id: "",
                nameOfUser: "",
                comments: "",
            };
        },
        mounted: function () {
            console.log("this id", this.photoId);
            let takeThis = this;
            var pic = this.photoId;
            axios
                .get("/info/" + pic)
                .then(function (response) {
                    console.log("COMPONENT RESPONSE", response.data.rows);
                    takeThis.head = response.data.rows[0].title;
                    takeThis.desc = response.data.rows[0].description;
                    takeThis.user = response.data.rows[0].username;
                    takeThis.url = response.data.rows[0].url;
                    takeThis.id = response.data.rows[0].photoId;
                })
                .catch((err) => console.log("ERR IN axios get!", err));

            axios.get("/getComments/" + pic).then(function (response) {
                console.log(
                    "COMPONENT RESPONSE TWO",
                    response.data.getCommentInfo
                );
                takeThis.modalComments = response.data.getCommentInfo;
            });
        },
        methods: {
            photoSubmit: function (e) {
                e.preventDefault();
                var takeThis = this;
                var userAndComment = {
                    commentBy: takeThis.nameOfUser,
                    comment: takeThis.comments,
                    imgId: takeThis.photoId,
                };
                console.log(userAndComment);

                axios
                    .post("/postComments", userAndComment)
                    .then((result) => {
                        console.log(result);
                        var comment = result.data.commentInfo;
                        console.log("COMMENT", result.data.commentInfo);
                        console.log(takeThis.modalComments);
                        takeThis.modalComments.unshift(comment);
                    })
                    .catch((err) => console.log("ERROR IN POST COMMENT", err));
            },
            closeModal: function () {
                this.$emit("turn-off");
            },
        },
    });

    new Vue({
        el: "main",
        data: {
            //props, pivotal way of working in framework, way to pass data from parent to child
            siteImages: [],
            title: "",
            description: "",
            username: "",
            file: null,
            showModal: false,
            photoId: null,
        },
        mounted: function () {
            var takeThis = this;
            axios
                .get("/images")
                .then(function (response) {
                    // console.log(takeThis, response);
                    takeThis.siteImages = response.data.image;
                })
                .catch(function (err) {
                    console.log("ERROR IN GET", err);
                });
        },

        //lifecyycle method // mouted function runs after the HTML has been rendered // render data from database the moment page loads // mounted is the answer // function only runs once! when the page loads, // need to refresh page if you want to run mountd again

        methods: {
            handleClick: function (e) {
                e.preventDefault();
                console.log(this);
                let takeThis = this;
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function (response) {
                        console.log("SCRIPT RESPONSE", response);
                        takeThis.siteImages.unshift(response.data.newImage);
                    })
                    .catch(function (err) {
                        console.log("error POST /uploads: ", err);
                    });

                form.reset();
            },
            handleChange: function (e) {
                console.log("handlechange active");
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            },

            photoClick: function (id) {
                console.log("photocloiiick");
                this.showModal = true;
                console.log("PHOTO ID: ", id);
                this.photoId = id;
            },
            // closeModal: function () {
            //     this.showModal = false;
            // },
        },
    });
})();
