(function () {
    // no es6, no let, no const, no destructuring
    // using promises

    new Vue({
        el: "main",
        data: {
            siteImages: [],
            title: "",
            description: "",
            username: "",
            file: null,
        },
        mounted: function () {
            var takeThis = this;
            axios
                .get("/images")
                .then(function (response) {
                    console.log(takeThis, response);
                    takeThis.siteImages = response.data.image;
                })
                .catch(function (err) {
                    console.log("ERROR IN GET", err);
                });
        }, //lifecyycle method // mouted function runs after the HTML has been rendered // render data from database the moment page loads // mounted is the answer // function only runs once! when the page loads, // need to refresh page if you want to run mountd again

        methods: {
            handleClick: function (e) {
                e.preventDefault();
                console.log(this);
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function (response) {
                        console.log("response", response);
                    })
                    .catch(function (err) {
                        console.log("err POST /uploads: ", err);
                    });
            },
            handleChange: function (e) {
                console.log("handlechange active");
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            },
        },
    });
})();
