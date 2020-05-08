async function addDataToDB(path, object) {
    return axios.post(path, object, {
        headers: {
            'Content-Type': 'application/problem+json',
            'Accept': 'application/json'
        }
    })
        .then((response) => {
            let data = response.data;
            return data;
        })
        .catch(error => {
            var postButton = document.getElementById("post-button");
            var messageOutput = document.getElementById("message");
            var response = error.response;
            if (typeof response != "undefined") {
                messageOutput.innerText = response.data;
                postButton.style.pointerEvents = "auto";
            }
        });
}

var call;
async function getDataParsed(path) {
    if (call) {
        call.cancel();
    }
    call = axios.CancelToken.source();
    return axios.get(path, { cancelToken: call.token }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then((response) => {
            let data = response.data;
            return data;
        })
        .catch(error => {
            var messageOutput = document.getElementById("message");
            var response = error.response;
            if (typeof response != "undefined") {
                messageOutput.innerText = response.data;
            }
        });
}

function addDataToDBWithoutReturn(path, object) {
    axios.post(path, object, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then((response) => {
            let data = response.data;
        })
        .catch(error => {
            console.log(error);
        });
}

function deleteData(path) {
    axios.delete(path)
        .then(response => {
            let data = response.data;
        })
        .catch(error => {
            console.log(error);
        });
}

class Post {
    constructor(photoUploaded, description, userId) {
        this.photoUploaded = photoUploaded;
        this.description = description;
        this.userId = userId;
    }
}

function homeButton() {
    var homeButtons = document.getElementsByClassName("home-buttons");
    for (var i = 0; i < homeButtons.length; i++) {
        homeButtons[i].onclick = function () {
            window.location.href = "./home.html";
        }
    }
}

function toggleUploadSection() {
    var messageOutput = document.getElementById("message");
    var showButton = document.getElementById("show-form-button");
    var postForm = document.getElementById("post-photo");
    showButton.onclick = function () {
        messageOutput.innerText = "";
        if (postForm.style.maxHeight) {
            postForm.style.maxHeight = null;
            setTimeout(function () {
                postForm.style.display = "none";
            }, 110);
        } else {
            postForm.style.display = "block";
            postForm.style.maxHeight = postForm.scrollHeight + "px";
        }
    }
}

function addPost(id, usersId) {
    var postButton = document.getElementById("post-button");
    var imageFile = document.getElementById("image-file");
    var description = document.getElementById("description");
    var loadingIcon = document.getElementById("loading-icon");
    var messageOutput = document.getElementById("message");
    postButton.onclick = async function () {
        var validation = true;
        validation = photoValidation(imageFile, validation, messageOutput);
        if (validation == true) {
            messageOutput.innerText = "";
            postButton.style.pointerEvents = "none";
            messageOutput.style.display = "none";
            loadingIcon.style.display = "block";
            var post = new Post();
            post.description = description.value;
            post.userId = id;
            processImgAndPost(imageFile, post, postButton, messageOutput, loadingIcon, description, id, usersId);
        }
    }
}

function processImgAndPost(imageFile, post, postButton, messageOutput, loadingIcon, description, id, usersId) {
    var selectedFile = imageFile.files[0];
    selectedFile.convertToBase64(async function (base64) {
        var strImage = base64.replace(/^data:image\/[a-z]+;base64,/, "");
        post.photoUploaded = strImage;
        var getPost = await addDataToDB("https://localhost:44373/api/posts", post);
        postButton.style.pointerEvents = "auto";
        toggleLoaderIcon(messageOutput, loadingIcon);
        if (typeof getPost === "undefined" && messageOutput.innerText == "") {
            messageOutput.innerText = "An error has occured!Try again!";
            toggleLoaderIcon(messageOutput, loadingIcon);
        } else if (typeof getPost != "undefined") {
            await renderPosts(id, usersId);
            messageOutput.style.display = "block";
            loadingIcon.style.display = "none";
            messageOutput.style.color = "green";
            messageOutput.innerText = "Photo posted successfully!";
            description.value = "";
            imageFile.value = "";
            setTimeout(function () {
                messageOutput.style.color = "#CC0606";
                messageOutput.innerText = "";
            }, 10000);
        }
    });
}

async function renderPosts(id, usersId) {
    var postsContainer = document.getElementById("show-posts");
    var modal = document.getElementById("post-modal");
    var modalContent = document.getElementById("post-activity");
    var usersSection = document.getElementById("modal-users-section");
    var getPosts = await addDataToDB(`https://localhost:44373/api/posts/usersid`, usersId);
    if (typeof getPosts != "undefined") {
        if (getPosts.length == 0) {
            postsContainer.innerHTML = "";
            var noPosts = document.createElement("div");
            noPosts.id = "no-posts";
            noPosts.innerText = "There are no posts currently for you! Share your first photo and add more friends.";
            postsContainer.appendChild(noPosts);
            postsContainer.style.paddingBottom = "650px";
        } else {
            postsContainer.innerHTML = "";
            getPosts.sort((a, b) => (b.id) - (a.id));
            for (var i = 0; i < getPosts.length; i++) {
                var profileAnchor = document.createElement("a");
                profileAnchor.href = `./profile/profile.html?id=${getPosts[i].user.id}`;
                var postDiv = document.createElement("div");
                postDiv.id = getPosts[i].id + "post";
                postDiv.className = "items-width";
                var userInfo = document.createElement("div");
                userInfo.className = "post-user-info";
                var userPicture = document.createElement("img");
                userPicture.id = getPosts[i].user.id + "user";
                userPicture.className = "post-user-picture";
                userPicture.src = "data:image/*;base64," + getPosts[i].user.profilePicture;
                profileAnchor.appendChild(userPicture);
                userInfo.appendChild(profileAnchor);
                var userAction = document.createElement("p");
                userAction.innerHTML = `<b>${getPosts[i].user.fullName}</b> shared a photo`;
                userInfo.appendChild(userAction);
                var image = document.createElement("img");
                image.src = "data:image/*;base64," + getPosts[i].photoUploaded;
                image.className = "post-image";
                var imageDate = document.createElement("div");
                var dateString = getPosts[i].timeUploaded;
                var formatedDate = dateString.replace("T", " at ")
                imageDate.innerText = "On " + formatedDate.slice(0, 19);
                var postDescription = document.createElement("div");
                postDescription.className = "post-image-description";
                if (getPosts[i].description != "") {
                    postDescription.innerHTML = "<b>Description</b>: " + getPosts[i].description;
                }
                var postLikes = document.createElement("div");
                var totalLikes = document.createElement("p");
                totalLikes.id = getPosts[i].id + "likesmodal";
                totalLikes.innerHTML = `Liked by <p id="likes${getPosts[i].id}" class="total-likes-number">
                ${getPosts[i].likes.length}</p> people`;
                totalLikes.className = "post-image-likes";
                var likeButton = document.createElement("div");
                likeButton.id = getPosts[i].id + "like";
                likeButton.className = "post-image-likebutton";
                for (var y = 0; y < getPosts[i].likes.length; y++) {
                    if (getPosts[i].likes[y].user.id === id) {
                        likeButton.style.color = "#C50E0E";
                        break;
                    }
                }
                likeButton.innerHTML = "&#x2764;";
                postLikes.appendChild(totalLikes);
                postLikes.appendChild(likeButton);
                var postComments = document.createElement("p");
                postComments.id = getPosts[i].id + "commentsmodal";
                postComments.className = "post-image-comments";
                postComments.innerText = "View comments";
                var addComment = document.createElement("textarea");
                addComment.id = getPosts[i].id + "comment";
                addComment.className = "post-user-addcomment";
                addComment.placeholder = "Add a comment";
                addComment.maxLength = "100";
                var commentButton = document.createElement("div");
                commentButton.id = getPosts[i].id + "button";
                commentButton.innerText = "Comment";
                commentButton.className = "button button-post";
                postDiv.appendChild(userInfo);
                postDiv.appendChild(image);
                postDiv.appendChild(imageDate);
                postDiv.appendChild(postDescription);
                postDiv.appendChild(postLikes);
                postDiv.appendChild(postComments);
                postDiv.appendChild(addComment);
                postDiv.appendChild(commentButton);
                postsContainer.appendChild(postDiv);
            }
            postsContainer.style.paddingBottom = "100px";
        }
        addCommentToPost(id);
        viewComments(modal, modalContent, usersSection, id);
        likePost(id, getPosts);
        viewLikes(modal, modalContent, usersSection);
    }
}

function closeModal() {
    var span = document.getElementsByClassName("close")[0];
    var modal = document.getElementById("post-modal");
    var modalContent = document.getElementById("post-activity");
    var usersSection = document.getElementById("modal-users-section");
    span.onclick = function () {
        modal.style.display = "none";
        modalContent.innerHTML = "";
        usersSection.innerHTML = "";
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            modalContent.innerHTML = "";
            usersSection.innerHTML = "";
        }
    }
}

function searchUsers(users) {
    var searchInput = document.getElementById("search");
    var searchResult = document.getElementById("search-result");
    var filteredArray = [];
    searchInput.onfocus = function () {
        searchResult.style.display = "block";
        searchResult.innerHTML = `<p style="margin:10px">Search for users</p>`;
    }
    window.onclick = function (event) {
        if (event.target != searchInput && event.target != searchResult) {
            searchResult.style.display = "none";
        }
    }
    searchInput.onkeyup = function () {
        searchResult.innerHTML = "";
        filteredArray = [];
        if (searchInput.value != "") {
            for (var i = 0; i < users.length; i++) {
                if (users[i].fullName.toLowerCase().includes(searchInput.value.toLowerCase().trim())) {
                    filteredArray.push(users[i]);
                }
            }
        }
        else if (searchInput.value === "") {
            filteredArray = [];
            searchResult.innerHTML = `<p style="margin:10px">Search for users</p>`;
        }
        if (filteredArray.length != 0) {
            renderSearchResults(filteredArray, searchResult);
        }
        else {
            searchResult.innerHTML = `<p style="margin:10px">Nothing to show</p>`;
        }
    }
}

function renderSearchResults(filteredArray, searchResult) {
    for (var y = 0; y < filteredArray.length; y++) {
        var profileAnchor = document.createElement("a");
        profileAnchor.href = `./profile/profile.html?id=${filteredArray[y].id}`;
        profileAnchor.className = "search-anchor";
        var userDiv = document.createElement("div");
        userDiv.className = "search-user-div";
        var userInfo = document.createElement("div");
        userInfo.className = "search-user-info";
        var userPicture = document.createElement("img");
        userPicture.className = "search-user-picture";
        userPicture.src = "data:image/*;base64," + filteredArray[y].profilePicture;
        var userName = document.createElement("div");
        userName.className = "search-name-value";
        userName.innerHTML = `<b>${filteredArray[y].fullName}</b>`;
        profileAnchor.appendChild(userDiv);
        userInfo.appendChild(userPicture);
        userInfo.appendChild(userName);
        userDiv.appendChild(userInfo);
        searchResult.appendChild(profileAnchor);
    }
}

function photoValidation(imageFile, validation, messageOutput) {
    if (imageFile.value === "") {
        validation = false;
        messageOutput.innerText = "Please select photo!";
    }
    return validation;
}

File.prototype.convertToBase64 = function (callback) {
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
        callback(e.target.result);
    };
    fileReader.readAsDataURL(this);
}

function toggleLoaderIcon(outputMessage, loaderIcon) {
    if (outputMessage.innerText != "") {
        loaderIcon.style.display = "none";
        outputMessage.style.display = "block";
    } else {
        loaderIcon.style.display == "block";
        outputMessage.style.display = "none";
    }
}

function toggleFunctions() {
    try {
        homeButton();
        toggleUploadSection();
        closeModal();
    } catch (error) {
        console.log(error);
    }
}

toggleFunctions();