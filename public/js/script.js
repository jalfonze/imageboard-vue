(function () {
    // no es6, no let, no const, no destructuring
    // using promises

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
            console.log("this id", this);
            this.getModal();
        },

        watch: {
            photoId: function () {
                //do mounted function does
                //when url is changed the image and info inside updates
                console.log(location.hash.slice(1));
                this.getModal();
            },
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

            getModal: function () {
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
            photoId: location.hash.slice(1),
        },
        mounted: function () {
            var takeThis = this;
            axios
                .get("/images")
                .then(function (response) {
                    console.log("MODALSHOWRESPONSE", takeThis, response);
                    takeThis.siteImages = response.data.image;
                    takeThis.scroll();
                })
                .catch(function (err) {
                    console.log("ERROR IN GET", err);
                });

            window.addEventListener("hashchange", function () {
                console.log("HASHWORKS", location.hash);
                takeThis.photoId = location.hash.slice(1);
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
            },
            handleChange: function (e) {
                console.log("handlechange active");
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            },

            // clickMore: function () {
            //     console.log("MORE MROE MORE ");
            //     console.log(this.siteImages.slice().pop());
            //     let lastImageId = this.siteImages.slice().pop().id;
            //     console.log(lastImageId);
            //     let takeThis = this;

            //     axios
            //         .get("/morePhotos/" + lastImageId)
            //         .then(function (imageResults) {
            //             console.log(imageResults.data.result);
            //             let newImages = imageResults.data.result;
            //             takeThis.siteImages.push(...newImages);
            //         })
            //         .catch((err) => console.log("ERROR IN MORE PHOTOS", err));
            // },
            scroll: function () {
                let takeThis = this;

                console.log("scrolling");
                if (
                    document.documentElement.scrollTop + window.innerHeight >=
                    document.documentElement.offsetHeight - 100
                ) {
                    console.log("ayo");
                    let lastImageId = takeThis.siteImages.slice().pop().id;

                    setTimeout(function () {
                        axios
                            .get("/morePhotos/" + lastImageId)
                            .then(function (imageResults) {
                                console.log(imageResults.data.result);
                                let newImages = imageResults.data.result;
                                for (var i = 0; i < newImages.length; i++) {
                                    takeThis.siteImages.push(newImages[i]);
                                }
                                takeThis.scroll();
                            })
                            .catch((err) =>
                                console.log("ERROR IN MORE PHOTOS", err)
                            );
                    }, 2000);
                } else {
                    takeThis.scroll();
                }
            },
        },
    });
})();
