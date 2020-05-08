class Like {
    constructor(userId, postId) {
        this.userId = userId;
        this.postId = postId;
    }
}

class LikeTemp {
    constructor(postId, user) {
        this.postId = postId;
        this.user = function (id) {
            this.id = id
        };
    }
}

class Comment {
    constructor(userId, postId, comment) {
        this.userId = userId;
        this.postId = postId;
        this.comment = comment;
    }
}

function likePost(id, getPosts) {
    var likeButtons = document.getElementsByClassName("post-image-likebutton");
    for (var i = 0; i < likeButtons.length; i++) {
        likeButtons[i].onclick = async function () {
            var currentButton = this;
            this.style.pointerEvents = "none";
            var buttonId = this.id.replace("like", "");
            var totalLikes = document.getElementById(`likes${buttonId}`);
            if (this.style.color == "rgb(197, 14, 14)") {
                this.style.color = "rgb(6,161,76)";
                totalLikes.innerText = (parseInt(totalLikes.innerText) - 1).toString();
            }
            else {
                this.style.color = "rgb(197, 14, 14)";
                totalLikes.innerText = (parseInt(totalLikes.innerText) + 1).toString();
            }
            var post = document.getElementById(`${buttonId}post`);
            var postId = post.id.replace("post", "");
            processLikeAndPost(id, getPosts, postId, currentButton);
        }
    }
}

function processLikeAndPost(id, getPosts, postId, currentButton) {
    var likeExist = false;
    for (var y = 0; y < getPosts.length; y++) {
        if (getPosts[y].id === parseInt(postId)) {
            if (getPosts[y].likes.length === 0) {
                var addLike = new Like();
                addLike.userId = id;
                addLike.postId = parseInt(postId);
                addDataToDBWithoutReturn(`https://localhost:44373/api/likes`, addLike);
                var tempLike = new LikeTemp();
                tempLike.postId = parseInt(postId);
                tempLike.user.id = id;
                getPosts[y].likes.push(tempLike);
                currentButton.style.pointerEvents = "auto";
            }
            else {
                for (var i = 0; i < getPosts[y].likes.length; i++) {
                    if (getPosts[y].likes[i].user.id === id) {
                        likeExist = true;
                        break;
                    }
                    else if (getPosts[y].likes[i].user.id != id) {
                        likeExist = false;
                    }
                }
                if (likeExist === true) {
                    deleteData(`https://localhost:44373/api/likes/${id}/${parseInt(postId)}`);
                    currentButton.style.pointerEvents = "auto";
                    getPosts[y].likes.splice(getPosts[y].likes.findIndex(v => v.user.id === id), 1);
                }
                else if (likeExist === false) {
                    var addLike = new Like();
                    addLike.userId = id;
                    addLike.postId = parseInt(postId);
                    addDataToDBWithoutReturn(`https://localhost:44373/api/likes`, addLike);
                    var tempLike = new LikeTemp();
                    tempLike.postId = parseInt(postId);
                    tempLike.user.id = id;
                    getPosts[y].likes.push(tempLike);
                    currentButton.style.pointerEvents = "auto";
                }
            }
        }
    }
}

function viewLikes(modal,modalContent,usersSection) {
    var totalLikesSection = document.getElementsByClassName("post-image-likes");
    for (var i = 0; i < totalLikesSection.length; i++) {
        totalLikesSection[i].onclick = async function () {
            var postId = this.id.replace("likesmodal", "");
            modal.id = parseInt(postId) + "usersmodal";
            var likedBy = document.createElement("p");
            likedBy.className = "liked-by-modal";
            likedBy.innerText = "Please wait..."
            modalContent.appendChild(likedBy);
            modal.style.display = "block";
            var postId = this.id.replace("likesmodal", "");
            var post = await getDataParsed(`https://localhost:44373/api/posts/${parseInt(postId)}`);
            usersSection.innerHTML = "";
            if(typeof post != "undefined") {
                renderLikes(post,likedBy,usersSection,modal);
            }
        }
    }
}

function renderLikes(post,likedBy,usersSection,modal) {
    if(post.likes.length === 0) {
        likedBy.innerText = "Nothing to show for now";
    }
    if(usersSection.innerHTML === "" && post.id + "usersmodal" === modal.id && post.likes.length != 0) {
        likedBy.innerText = "Likes:"
        for (var y = 0; y < post.likes.length; y++) {
            var profileAnchor = document.createElement("a");
            profileAnchor.href = `./profile.html?id=${post.likes[y].user.id}`;
            var userDiv = document.createElement("div");
            userDiv.className = "modal-user-div";
            var userInfo = document.createElement("div");
            userInfo.className = "modal-user-info";
            var userPicture = document.createElement("img");
            userPicture.className = "modal-user-picture";
            userPicture.src = "data:image/*;base64," + post.likes[y].user.profilePicture;
            var userName = document.createElement("div");
            userName.className = "modal-comment-value";
            userName.innerHTML = `<b>${post.likes[y].user.fullName}</b>`;
            profileAnchor.appendChild(userPicture);
            userInfo.appendChild(profileAnchor);
            userInfo.appendChild(userName);
            userDiv.appendChild(userInfo);
            usersSection.appendChild(userDiv);
        }
    }
}

function addCommentToPost(id) {
    var addButtons = document.getElementsByClassName("button-post");
    for (var i = 0; i < addButtons.length; i++) {
        addButtons[i].onclick = async function () {
            this.style.pointerEvents = "none";
            this.style.opacity = "40%";
            var buttonId = this.id.replace("button", "");
            var post = document.getElementById(`${buttonId}post`);
            var postId = post.id.replace("post", "");
            var commentBox = document.getElementById(`${buttonId}comment`);
            if (commentBox.value === "") {
                commentBox.style.borderColor = "red";
                this.style.pointerEvents = "auto";
                this.style.opacity = "100%";
            } else {
                var addComment = new Comment();
                addComment.userId = id;
                addComment.postId = parseInt(postId);
                addComment.comment = commentBox.value;
                var addedComment = await addDataToDB(`https://localhost:44373/api/comments`, addComment);
                if (typeof addedComment === "undefined") {
                    commentBox.value = "An error has occured!";
                    this.style.pointerEvents = "auto";
                    this.style.opacity = "100%";
                }
                else {
                    commentBox.value = "";
                    this.style.pointerEvents = "auto";
                    this.style.opacity = "100%";
                }
            }
        }
    }
    resetInputColors();
}

function viewComments(modal,modalContent,usersSection,id) {
    var totalCommentsSection = document.getElementsByClassName("post-image-comments");
    for (var i = 0; i < totalCommentsSection.length; i++) {
        totalCommentsSection[i].onclick = async function () {
            var postId = this.id.replace("commentsmodal", "");
            modal.id = parseInt(postId) + "usersmodal";
            var commentedBy = document.createElement("p");
            commentedBy.className = "commented-by-modal";
            commentedBy.innerText = "Please wait..."
            modalContent.appendChild(commentedBy);
            modal.style.display = "block";
            var postId = this.id.replace("commentsmodal", "");
            var post = await getDataParsed(`https://localhost:44373/api/posts/${parseInt(postId)}`);
            usersSection.innerHTML = "";
            if(typeof post != "undefined") {
                renderComments(post,commentedBy,usersSection,modal,id);
            }
        }
    }
}

function renderComments(post,commentedBy,usersSection,modal,id) {
    if(post.comments.length === 0) {
        commentedBy.innerText = "Nothing to show for now";
    }
    if(usersSection.innerHTML === "" && post.id + "usersmodal" === modal.id && post.comments.length != 0) {
        commentedBy.innerText = "Comments:"
        for (var y = 0; y < post.comments.length; y++) {
            var profileAnchor = document.createElement("a");
            profileAnchor.href = `./profile.html?id=${post.comments[y].user.id}`;
            var userDiv = document.createElement("div");
            userDiv.className = "modal-user-div";
            var userInfo = document.createElement("div");
            userInfo.className = "modal-user-info";
            var userPicture = document.createElement("img");
            userPicture.className = "modal-user-picture";
            userPicture.src = "data:image/*;base64," + post.comments[y].user.profilePicture;
            var userName = document.createElement("div");
            userName.className = "modal-comment-value";
            userName.innerHTML = `<b>${post.comments[y].user.fullName}:</b> ${post.comments[y].comment}`;
            profileAnchor.appendChild(userPicture);
            userInfo.appendChild(profileAnchor);
            userInfo.appendChild(userName);
            userDiv.appendChild(userInfo);
            if(post.user.id === id || post.comments[y].user.id === id) {
                var deleteComment = document.createElement("div");
                deleteComment.innerHTML = "&times;";
                deleteComment.className = "modal-user-deletecomment";
                deleteComment.id = `${post.comments[y].id}deletecomment`;
                userDiv.appendChild(deleteComment);
            }
            usersSection.appendChild(userDiv);
        }
    }
    removeComment();
}

function removeComment() {
    var deleteButtons = document.getElementsByClassName("modal-user-deletecomment");
    for(var i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].onclick = function (){
            var parentNode = this.parentElement;
            var mainParent = parentNode.parentElement;
            mainParent.removeChild(parentNode);
            var commentId = this.id.replace("deletecomment", "");
            deleteData(`https://localhost:44373/api/comments/${parseInt(commentId)}`);
        }
    }
}

function resetInputColors() {
    var inputs = document.getElementsByClassName("post-user-addcomment");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].onfocus = function () {
            this.style.borderColor = "#b5beb9";
        }
    }
}