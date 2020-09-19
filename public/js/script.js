(function () {
    // no es6, no let, no const, no destructuring
    // using promises

    Vue.component("component-two", {
        template: "#component-two",
        props: ["commentId", "comArr"],
        data: function () {
            return {
                commentReplies: [],
                commentInfo: [],
                replies: "",
            };
        },

        mounted: function () {
            console.log("COMPTWO!", this);
            var takeThis = this;
            console.log(this.commentId);
            axios.get("/replies/" + this.commentId).then(function (results) {
                console.log("REPLIES: ", results.data.replies[0]);
                takeThis.commentInfo = results.data.replies[0];
                console.log(takeThis.commentInfo);
            });
            axios
                .get("/getAllReplies/" + this.commentId)
                .then(function (results) {
                    console.log(results.data.allReplies);
                    takeThis.commentReplies = results.data.allReplies;
                })
                .catch(function (err) {
                    console.log("ERROR IN GET ALL REP", err);
                });
        },
        methods: {
            closeComments: function () {
                this.$emit("turn-off");
            },
            replySubmit: function (e) {
                e.preventDefault();
                var takeThis = this;
                console.log(this.replies);
                var reply = {
                    comment: this.replies,
                    id: this.commentId,
                };
                console.log(reply);

                axios
                    .post("/postReply", reply)
                    .then(function (results) {
                        console.log(results.data.replies);
                        takeThis.commentReplies.unshift(
                            results.data.replies[0]
                        );
                        console.log(takeThis.commentReplies);
                    })
                    .catch(function (err) {
                        console.log("ERR IN POST REPLY", err);
                    });
            },
        },
    });

    Vue.component("component-one", {
        template: "#component-one",
        props: ["photoId"], //always array value
        data: function () {
            return {
                modalComments: [],
                buttonInfo: {},
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
            this.shareComs;
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
                    .then(function () {
                        takeThis.clearCommentInput();
                    })
                    .catch((err) => console.log("ERROR IN POST COMMENT", err));
            },

            getModal: function () {
                var takeThis = this;
                var pic = this.photoId;

                axios
                    .get("/info/" + pic)
                    .then(function (response) {
                        console.log("COMPONENT RESPONSE", takeThis, response);
                        takeThis.head = response.data.rows[0].title;
                        takeThis.desc = response.data.rows[0].description;
                        takeThis.user = response.data.rows[0].username;
                        takeThis.url = response.data.rows[0].url;
                        takeThis.id = response.data.rows[0].photoId;
                        takeThis.buttonInfo = response.data.rows[0];
                    })
                    .catch(function (err) {
                        console.log("ERR IN axios get!", err);
                        takeThis.closeModal();
                    });

                axios.get("/getComments/" + pic).then(function (response) {
                    console.log(
                        "COMPONENT RESPONSE TWO",
                        response.data.getCommentInfo
                    );
                    takeThis.modalComments = response.data.getCommentInfo;
                });
            },

            deleteImg: function () {
                var id = {
                    id: this.photoId,
                };
                console.log(this.photoId);
                axios
                    .post("/deleteImg", id)
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (err) {
                        console.log("ERROR IN DELETE IMAGE", err);
                    });
                console.log(this.siteImages);
                this.$emit("delete", this.photoId);
                this.closeModal();
            },
            getComId: function (id) {
                console.log("COMMENTID", id);
                this.$emit("com-id", id);
            },

            clearCommentInput: function () {
                (this.nameOfUser = ""), (this.comments = "");
            },
            closeModal: function () {
                this.$emit("turn-off");
                location.hash = "";
            },
        },
    });

    new Vue({
        el: "main",
        data: {
            //props, pivotal way of working in framework, way to pass data from parent to child
            siteImages: [],
            comArr: [],
            title: "",
            description: "",
            username: "",
            file: null,
            photoId: location.hash.slice(1),
            commentId: null,
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
            this.blink();
        },

        //lifecyycle method // mouted function runs after the HTML has been rendered // render data from database the moment page loads // mounted is the answer // function only runs once! when the page loads, // need to refresh page if you want to run mountd again

        methods: {
            handleClick: function (e) {
                e.preventDefault();
                console.log(this);
                var takeThis = this;
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
                    .then(function () {
                        takeThis.clearInput();
                    })
                    .catch(function (err) {
                        console.log("error POST /uploads: ", err);
                    });
                document
                    .querySelector("#uploadPhotoBtn")
                    .classList.remove("blink");
            },
            handleChange: function (e) {
                console.log("handlechange active");
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
                if (this.file) {
                    this.blink();
                }
            },
            removeImg: function (id) {
                for (var i = 0; i < this.siteImages.length; i++) {
                    if (this.siteImages[i].id == id) {
                        this.siteImages.splice(i, 1);
                    }
                }
            },
            clearInput: function () {
                (document.querySelector(".fileInput").value = ""),
                    (this.title = ""),
                    (this.description = ""),
                    (this.username = ""),
                    (this.file = null);
            },

            getCommentId: function (id) {
                this.commentId = id;
                console.log("COMMENT ID INSTANCE:", this.commentId);
            },

            shareComments: function (arr) {
                console.log(arr);
                this.comArr = arr;
                console.log(this.comArr);
            },

            blink: function () {
                document
                    .querySelector("#uploadPhotoBtn")
                    .classList.add("blink");
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
                setTimeout(function () {
                    if (
                        document.documentElement.scrollTop +
                            window.innerHeight >=
                        document.documentElement.offsetHeight - 100
                    ) {
                        // console.log("ayo");
                        let lastImageId = takeThis.siteImages.slice().pop().id;

                        axios
                            .get("/morePhotos/" + lastImageId)
                            .then(function (imageResults) {
                                // console.log(imageResults.data.result);
                                let newImages = imageResults.data.result;
                                if (newImages === []) {
                                    return;
                                } else {
                                    for (var i = 0; i < newImages.length; i++) {
                                        takeThis.siteImages.push(newImages[i]);
                                    }
                                    takeThis.scroll();
                                }
                            })
                            .catch((err) =>
                                console.log("ERROR IN MORE PHOTOS", err)
                            );
                    } else {
                        takeThis.scroll();
                    }
                }, 1000);
            },
        },
    });
})();
