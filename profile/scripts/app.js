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

        });
}

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
            console.log(error)
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
    return axios.delete(path, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(response => {
            let data = response.data;
            return data;
        })
        .catch(error => {
            console.log(error);
        });
}

function updateData(path, object, messageOutput) {
    return axios.put(path, object)
        .then(response => {
            let data = response.data;
            return data;
        })
        .catch(error => {
            var response = error.response;
            if (typeof response != "undefined") {
                messageOutput.innerText = response.data;
            }
            else {
                messageOutput.innerText = "An error has occured.Try again later!";
            }
        });
}

class UpdateUser {
    constructor(id, fullName, isPrivate, profilePicture, oldPassword, newPassword, confNewPass) {
        this.id = id;
        this.fullName = fullName;
        this.isPrivate = isPrivate;
        this.profilePicture = profilePicture;
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.confNewPass = confNewPass;
    }
}

class SendRequest {
    constructor(fromUserId, toUserId) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
    }
}

class AcceptRequest {
    constructor(userId, friendId) {
        this.userId = userId;
        this.friendId = friendId;
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
        profileAnchor.href = `./profile.html?id=${filteredArray[y].id}`;
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
        userName.innerHTML = `<p><b>${filteredArray[y].fullName}</b></p>`;
        profileAnchor.appendChild(userDiv);
        userInfo.appendChild(userPicture);
        userInfo.appendChild(userName);
        userDiv.appendChild(userInfo);
        searchResult.appendChild(profileAnchor);
    }
}

function homeButton() {
    var homeButtons = document.getElementsByClassName("home-buttons");
    for (var i = 0; i < homeButtons.length; i++) {
        homeButtons[i].onclick = function () {
            window.location.href = "../home.html";
        }
    }
}

async function showUser(id) {
    var userContainer = document.getElementById("show-user");
    var userIdParameter = (new URL(document.location)).searchParams;
    var userId = userIdParameter.get('id');
    if (userId != null) {
        var targetUser = await getDataParsed(`https://localhost:44373/api/users/${userId}`);
        if (typeof targetUser != "undefined") {
            var userDiv = document.createElement("div");
            userDiv.className = "profile-user-info";
            var profileUserInfo = document.createElement("div");
            profileUserInfo.className = "profile-user-details";
            var userPicture = document.createElement("img");
            userPicture.src = "data:image/*;base64," + targetUser.profilePicture;
            var userName = document.createElement("p");
            userName.innerHTML = `<b>${targetUser.fullName}</b>`;
            var userActions = document.createElement("div");
            var manageFriends = document.createElement("div");
            manageFriends.id = "manage-friends";
            userActions.className = "user-actions";
            if (targetUser.id === id) {
                var editProfile = document.createElement("div");
                editProfile.innerText = "Edit";
                editProfile.className = "user-actions-button";
                var logout = document.createElement("div");
                logout.id = "log-out-button";
                logout.innerText = "Log Out";
                logout.className = "user-actions-button";
                userActions.appendChild(editProfile);
                userActions.appendChild(logout);
                manageFriends.innerText = "Manage friends";
                var editSection = document.createElement("div");
                editSection.className = "edit-section";
                editSection.style.maxHeight = 0;
                viewFriends(manageFriends, id);
                editUser(editProfile, editSection, targetUser);
                logOut(logout);
            }
            var userPosts = document.createElement("div");
            userPosts.className = "user-profile-posts";
            var checkIfFriends = await getDataParsed(`https://localhost:44373/api/friends/${id}/${userId}`);
            if (checkIfFriends.friend === null && targetUser.isPrivate === true && targetUser.id != id) {
                userContainer.innerHTML = "";
                userContainer.style.paddingBottom = "100px";
                userPosts.innerHTML = `<h3 style="width:70%; margin: 0 auto;">This profile is private!</3>`;
                userPosts.style.textAlign = "center";
                userPosts.style.height = "300px";
            }
            else {
                var getPosts = await getDataParsed(`https://localhost:44373/api/posts/userid/${userId}`);
                userContainer.innerHTML = "";
                userContainer.style.paddingBottom = "100px";
                if (getPosts.length != 0) {
                    var modal = document.getElementById("post-modal");
                    var modalContent = document.getElementById("post-activity");
                    var usersSection = document.getElementById("modal-users-section");
                    renderUserPosts(id, userPosts, getPosts);
                    setTimeout(function () {
                        addCommentToPost(id);
                        viewComments(modal, modalContent, usersSection, id);
                        likePost(id, getPosts);
                        viewLikes(modal, modalContent, usersSection);
                        deletePost(userPosts);
                    }, 2000);
                }
                else {
                    userPosts.innerHTML = `<h3 style="width:70%; margin: 0 auto;">No posts found!</3>`;
                    userPosts.style.textAlign = "center";
                    userPosts.style.height = "300px";
                }
            }
            profileUserInfo.appendChild(userPicture);
            profileUserInfo.appendChild(userName);
            userDiv.appendChild(profileUserInfo);
            userDiv.appendChild(userActions);
            userDiv.appendChild(manageFriends);
            if (targetUser.id === id) {
                userDiv.appendChild(editSection);
            }
            userDiv.appendChild(userPosts);
            userContainer.appendChild(userDiv);
            if (targetUser.id != id) {
                var imgLoader = document.createElement("img");
                imgLoader.src = "../images/preloader.gif";
                imgLoader.style.width = "40px";
                userActions.appendChild(imgLoader);
                var friendRequest = await getDataParsed(`https://localhost:44373/api/friendrequests/${id}/${userId}`);
                if (friendRequest.fromUser != null) {
                    userActions.removeChild(imgLoader);
                    if (friendRequest.toUserId === id) {
                        var acceptRequest = document.createElement("div");
                        acceptRequest.innerText = "Accept";
                        acceptRequest.className = "user-actions-button";
                        userActions.appendChild(acceptRequest);
                        acceptFriendRequest(id, userId, acceptRequest);
                    }
                    var cancelRequest = document.createElement("div");
                    cancelRequest.innerText = "Cancel";
                    cancelRequest.className = "user-actions-button";
                    userActions.appendChild(cancelRequest);
                    cancelFriendRequest(id, userId, cancelRequest)
                }
                else {
                    var checkIfFriends = await getDataParsed(`https://localhost:44373/api/friends/${id}/${userId}`);
                    userActions.removeChild(imgLoader);
                    if (checkIfFriends.friend != null) {
                        var removeFriendBtn = document.createElement("div");
                        removeFriendBtn.innerText = "Remove Friend";
                        removeFriendBtn.className = "user-actions-button";
                        userActions.appendChild(removeFriendBtn);
                        removeFriend(id, userId, removeFriendBtn);
                    }
                    else {
                        var sendRequest = document.createElement("div");
                        sendRequest.innerText = "Add Friend";
                        sendRequest.className = "user-actions-button";
                        userActions.appendChild(sendRequest);
                        sendFriendRequest(id, userId, sendRequest);
                    }
                }
            }
        }
        else {
            noUserFound(userContainer);
        }
    }
    else {
        noUserFound(userContainer);
    }
}

function renderUserPosts(id, userPosts, getPosts) {
    for (var i = 0; i < getPosts.length; i++) {
        var postDiv = document.createElement("div");
        postDiv.id = getPosts[i].id + "post";
        postDiv.className = "items-width";
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
        postDiv.appendChild(image);
        if (getPosts[i].user.id === id) {
            var deletePhoto = document.createElement("div");
            deletePhoto.innerText = "Delete";
            deletePhoto.id = getPosts[i].id;
            deletePhoto.className = "remove-post";
            postDiv.appendChild(deletePhoto);
        }
        postDiv.appendChild(imageDate);
        postDiv.appendChild(postDescription);
        postDiv.appendChild(postLikes);
        postDiv.appendChild(postComments);
        postDiv.appendChild(addComment);
        postDiv.appendChild(commentButton);
        userPosts.appendChild(postDiv);
    }
}

function sendFriendRequest(id, targetUser, addFriendBtn) {
    addFriendBtn.onclick = async function () {
        addFriendBtn.style.pointerEvents = "none";
        addFriendBtn.style.opacity = "40%";
        var requestDto = new SendRequest();
        requestDto.fromUserId = id;
        requestDto.toUserId = targetUser;
        var request = await addDataToDB(`https://localhost:44373/api/friendrequests`, requestDto);
        if (typeof request != 'undefined') {
            location.reload();
        }
        else {
            alert("An error has occured.Try again later!");
            addFriendBtn.style.pointerEvents = "auto";
            addFriendBtn.style.opacity = "100%";
        }
    }
}

function cancelFriendRequest(id, targetUser, cancelRequestBtn) {
    cancelRequestBtn.onclick = async function () {
        var confirmRemove = confirm("Do you want to cancel the request?")
        if (confirmRemove) {
            cancelRequestBtn.style.pointerEvents = "none";
            cancelRequestBtn.style.opacity = "40%";
            var request = await deleteData(`https://localhost:44373/api/friendrequests/${id}/${targetUser}`);
            if (typeof request != 'undefined') {
                location.reload();
            }
            else {
                alert("An error has occured.Try again later!");
                cancelRequestBtn.style.pointerEvents = "auto";
                cancelRequestBtn.style.opacity = "100%";
            }
        }
    }
}

function acceptFriendRequest(id, targetUser, acceptRequestBtn) {
    acceptRequestBtn.onclick = async function () {
        acceptRequestBtn.style.pointerEvents = "none";
        acceptRequestBtn.style.opacity = "40%";
        var newFriend = new AcceptRequest();
        newFriend.userId = id;
        newFriend.friendId = targetUser;
        var response = await addDataToDB(`https://localhost:44373/api/friends`, newFriend);
        if (typeof response != 'undefined') {
            await deleteData(`https://localhost:44373/api/friendrequests/${id}/${targetUser}`);
            location.reload();
        }
        else {
            alert("An error has occured.Try again later!");
            acceptRequestBtn.style.pointerEvents = "auto";
            acceptRequestBtn.style.opacity = "100%";
        }
    }
}

function removeFriend(id, targetUser, removeFriendBtn) {
    removeFriendBtn.onclick = async function () {
        var confirmRemove = confirm("Do you want to remove this friend?")
        if (confirmRemove) {
            removeFriendBtn.style.pointerEvents = "none";
            removeFriendBtn.style.opacity = "40%";
            var user = await deleteData(`https://localhost:44373/api/friends/${id}/${targetUser}`);
            if (typeof user != 'undefined') {
                location.reload();
            }
            else {
                alert("An error has occured.Try again later!");
                removeFriendBtn.style.pointerEvents = "auto";
                removeFriendBtn.style.opacity = "100%";
            }
        }
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

function logOut(logout) {
    logout.onclick = function () {
        localStorage.clear();
        logout.style.pointerEvents = "none";
        logout.style.opacity = "40%";
        setTimeout(function () {
            window.location.href = "../loginuser/login.html";
        }, 1500);
    }
}

function editUser(editProfile, editSection, targetUser) {
    editProfile.onclick = function () {
        if (editSection.innerHTML != "") {
            editSection.innerHTML = "";
        }
        var changePic = document.createElement("p");
        changePic.innerText = "Update your profile picture:";
        var changeProfilePicture = document.createElement("input");
        changeProfilePicture.setAttribute("type", "file");
        changeProfilePicture.setAttribute("accept", "image/*");
        var updateFullName = document.createElement("p");
        updateFullName.innerText = "Change full name:";
        var editName = document.createElement("input");
        editName.setAttribute("maxlength", "40");
        editName.setAttribute("placeholder", "Full Name");
        editName.value = targetUser.fullName;
        var editPivacy = document.createElement("p");
        editPivacy.innerText = "Private profile:";
        var privacy = document.createElement("select");
        var privateFalse = document.createElement("option");
        privateFalse.innerHTML = "No";
        privateFalse.value = false;
        var privateTrue = document.createElement("option");
        privateTrue.value = true;
        privateTrue.innerHTML = "Yes";
        if (targetUser.isPrivate.toString() === "false") {
            privacy.appendChild(privateFalse);
            privacy.appendChild(privateTrue);
        }
        else {
            privacy.appendChild(privateTrue);
            privacy.appendChild(privateFalse);
        }
        var oldPassword = document.createElement("p");
        oldPassword.innerText = "Confirm old password:";
        var oldPasswordInput = document.createElement("input");
        oldPasswordInput.setAttribute("maxlength", "20");
        oldPasswordInput.setAttribute("placeholder", "Old Password");
        oldPasswordInput.setAttribute("type", "password");
        var newPassword = document.createElement("p");
        newPassword.innerText = "Enter new password:";
        var newPasswordInput = document.createElement("input");
        newPasswordInput.setAttribute("placeholder", "New Password");
        newPasswordInput.setAttribute("type", "password");
        newPasswordInput.setAttribute("maxlength", "20");
        var confNewPass = document.createElement("p");
        confNewPass.innerText = "Confirm new password:";
        var confNewPassInput = document.createElement("input");
        confNewPassInput.setAttribute("maxlength", "20");
        confNewPassInput.setAttribute("placeholder", "Confirm Password");
        confNewPassInput.setAttribute("type", "password");
        var deleteAccount = document.createElement("div");
        deleteAccount.innerText = "Delete Account";
        deleteAccount.id = "delete-account";
        var changesSection = document.createElement("div");
        changesSection.className = "changes-section";
        var saveChanges = document.createElement("div");
        saveChanges.innerText = "Save";
        saveChanges.className = "user-actions-button";
        var cancelChanges = document.createElement("div");
        cancelChanges.innerText = "Cancel";
        cancelChanges.id = "cancel-button";
        cancelChanges.className = "user-actions-button";
        var messageOutput = document.createElement("div");
        messageOutput.id = "changes-message";
        messageOutput.style.height = "25px";
        messageOutput.innerText = "*Not all fields are required";
        changesSection.appendChild(saveChanges);
        changesSection.appendChild(cancelChanges);
        editSection.appendChild(deleteAccount);
        editSection.appendChild(changePic);
        editSection.appendChild(changeProfilePicture);
        editSection.appendChild(updateFullName);
        editSection.appendChild(editName);
        editSection.appendChild(editPivacy);
        editSection.appendChild(privacy);
        editSection.appendChild(oldPassword);
        editSection.appendChild(oldPasswordInput);
        editSection.appendChild(newPassword);
        editSection.appendChild(newPasswordInput);
        editSection.appendChild(confNewPass);
        editSection.appendChild(confNewPassInput);
        editSection.appendChild(changesSection);
        editSection.appendChild(messageOutput);
        editSection.style.display = "flex";
        editSection.style.maxHeight = editSection.scrollHeight + "px";
        cancelChangesFn(cancelChanges, editSection);
        updateAccount(saveChanges, targetUser, messageOutput, changeProfilePicture, editName, privacy,
            oldPasswordInput, newPasswordInput, confNewPassInput);
        removeAccount(deleteAccount, targetUser, messageOutput);
    }
}

function cancelChangesFn(cancelButton, editSection) {
    cancelButton.onclick = function () {
        editSection.style.maxHeight = 0;
        setTimeout(function () {
            editSection.style.display = "none";
        }, 110);
    }
}

function updateAccount(saveChanges, targetUser, messageOutput, changeProfilePicture, editName, privacy, oldPasswordInput, newPasswordInput, confNewPassInput) {
    var cancelButton = document.getElementById("cancel-button");
    saveChanges.onclick = async function () {
        saveChanges.style.pointerEvents = "none";
        cancelButton.style.pointerEvents = "none";
        saveChanges.style.opacity = "40%";
        const image = changeProfilePicture.files[0];
        var imageToBase64;
        var updateUserDto = new UpdateUser();
        if (changeProfilePicture.value != "") {
            imageToBase64 = await toBase64(image);
            updateUserDto.profilePicture = imageToBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        }
        else {
            updateUserDto.profilePicture = changeProfilePicture.value;
        }
        updateUserDto.id = targetUser.id;
        updateUserDto.fullName = editName.value.trim();
        if (privacy.value == "false") {
            updateUserDto.isPrivate = false;
        }
        else if (privacy.value == "true") {
            updateUserDto.isPrivate = true;
        }
        updateUserDto.oldPassword = oldPasswordInput.value;
        updateUserDto.newPassword = newPasswordInput.value;
        updateUserDto.confNewPass = confNewPassInput.value;
        var updatedAccount = await updateData("https://localhost:44373/api/users", updateUserDto, messageOutput);
        saveChanges.style.pointerEvents = "auto";
        cancelButton.style.pointerEvents = "auto";
        saveChanges.style.opacity = "100%";
        if (typeof updatedAccount != 'undefined') {
            location.reload();
        }
    }
}

function removeAccount(deleteAccount, targetUser, messageOutput) {
    deleteAccount.onclick = async function () {
        deleteAccount.style.pointerEvents = "none";
        var confirmRemove = confirm("Do you want to remove your account permanently?")
        if (confirmRemove) {
            deleteAccount.style.opacity = "40%";
            var user = await deleteData(`https://localhost:44373/api/users/${targetUser.id}`);
            if (typeof user != 'undefined') {
                localStorage.clear();
                window.location.href = "../loginuser/login.html";
            }
            else {
                messageOutput.innerText = "An error has occured.Try again later!";
                deleteAccount.style.pointerEvents = "auto";
                deleteAccount.style.opacity = "100%";
            }
        }
        else {
            deleteAccount.style.pointerEvents = "auto";
        }
    }
}

function deletePost(userPosts) {
    var removeButtons = document.getElementsByClassName("remove-post");
    for (var i = 0; i < removeButtons.length; i++) {
        removeButtons[i].onclick = async function () {
            this.style.pointerEvents = "none";
            var postId = this.id;
            var postForDelete = document.getElementById(postId + "post");
            var confirmRemove = confirm("Do you want to remove this post?")
            if (confirmRemove) {
                this.style.opacity = "40%";
                var targetPost = await deleteData(`https://localhost:44373/api/posts/${parseInt(postId)}`);
                if (typeof targetPost != 'undefined') {
                    userPosts.removeChild(postForDelete);
                    if (userPosts.innerHTML === "") {
                        userPosts.innerHTML = `<h3 style="width:70%; margin: 0 auto;">No posts found!</3>`;
                        userPosts.style.textAlign = "center";
                        userPosts.style.height = "300px";
                    }
                }
                else {
                    alert("An error has occured.Try again later!");
                    this.style.pointerEvents = "auto";
                    this.style.opacity = "100%";
                }
            }
            else {
                this.style.pointerEvents = "auto";
            }
        }
    }
}

function viewFriends(friendsButton, id) {
    var modal = document.getElementById("post-modal");
    var modalContent = document.getElementById("post-activity");
    var usersSection = document.getElementById("modal-users-section");
    friendsButton.onclick = async function () {
        var friends = document.createElement("p");
        friends.className = "liked-by-modal";
        friends.innerText = "Please wait..."
        modalContent.appendChild(friends);
        modal.style.display = "block";
        var friendsList = await getDataParsed(`https://localhost:44373/api/friends/${id}`);
        usersSection.innerHTML = "";
        if (typeof friendsList != "undefined") {
            renderFriends(friendsList, friends, usersSection);
            removeFriendFromModal(id);
        }
    }
}

function renderFriends(friendsList, friends, usersSection) {
    if (friendsList.length === 0) {
        friends.innerText = "Nothing to show for now";
    }
    if (usersSection.innerHTML === "" && friendsList.length != 0) {
        friends.innerText = "Friends:"
        for (var y = 0; y < friendsList.length; y++) {
            var profileAnchor = document.createElement("a");
            profileAnchor.href = `./profile.html?id=${friendsList[y].friend.id}`;
            var userDiv = document.createElement("div");
            userDiv.className = "modal-user-div";
            userDiv.id = friendsList[y].friend.id + "userfriend";
            var userInfo = document.createElement("div");
            userInfo.className = "modal-user-info";
            var userPicture = document.createElement("img");
            userPicture.className = "modal-user-picture";
            userPicture.src = "data:image/*;base64," + friendsList[y].friend.profilePicture;
            var userName = document.createElement("div");
            userName.className = "modal-comment-value";
            userName.innerHTML = `<b>${friendsList[y].friend.fullName}</b>`;
            var deleteFriend = document.createElement("div");
            deleteFriend.innerHTML = "&times;";
            deleteFriend.className = "modal-user-removefriend";
            deleteFriend.id = `${friendsList[y].friend.id}removefriend`;
            profileAnchor.appendChild(userPicture);
            userInfo.appendChild(profileAnchor);
            userInfo.appendChild(userName);
            userDiv.appendChild(userInfo);
            userDiv.appendChild(deleteFriend);
            usersSection.appendChild(userDiv);
        }
    }
}

function removeFriendFromModal(id) {
    var removeButtons = document.getElementsByClassName("modal-user-removefriend");
    var usersSection = document.getElementById("modal-users-section");
    for(var i = 0; i < removeButtons.length; i++) {
        removeButtons[i].onclick = async function () {
            this.style.pointerEvents = "none";
            this.style.opacity = "40%";
            var buttonId = this.id;
            var userId = buttonId.replace("removefriend", "");
            var userDiv = document.getElementById(userId + "userfriend");
            var user = await deleteData(`https://localhost:44373/api/friends/${id}/${parseInt(userId)}`);
            if (typeof user != 'undefined') {
                usersSection.removeChild(userDiv);
            }
            else {
                alert("An error has occured.Try again later!");
                this.style.pointerEvents = "auto";
                this.style.opacity = "100%";
            }
        }
    }
}

function noUserFound(userContainer) {
    userContainer.innerHTML = "";
    var noUser = document.createElement("div");
    noUser.id = "no-user";
    noUser.innerText = "User not found!";
    userContainer.appendChild(noUser);
    userContainer.style.paddingBottom = "650px";
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function toggleFunctions() {
    try {
        homeButton();
        closeModal();
    } catch (error) {
        console.log(error);
    }
}

toggleFunctions();