async function getUserActionsData(path) {
    return axios.get(path, {
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

class AddFriend {
    constructor(userId, friendId) {
        this.userId = userId;
        this.friendId = friendId;
    }
}

function updateData(path) {
    axios.put(path)
        .then(response => {
            let data = response.data;
        })
        .catch(error => {
            var response = error.response;
        });
}

async function getUser() {
    var currentUser = localStorage.getItem('email');
    var access = localStorage.getItem('access');
    var requestsContent = document.getElementById("friend-requests");
    requestsContent.innerHTML = `<p style="margin:10px">Please wait...</p>`;
    var requestedUser = await getUserActionsData(`https://localhost:44373/api/users/access/${access}/${currentUser}`);
    if (requestedUser != 'undefined') {
        friendRequests(requestedUser);
        setInterval(function () {
            if (requestsContent.style.display != "block" || requestsContent.innerText == "Please wait...") {
                friendRequests(requestedUser);
            }
        }, 10000);
        showActionsContent(requestedUser);
    }
}


async function friendRequests(requestedUser) {
    var requestsContent = document.getElementById("friend-requests");
    var requests = await getUserActionsData(`https://localhost:44373/api/friendrequests/${requestedUser.id}`);
    var requestButtons = document.getElementsByClassName("request-actions");
    if (requests.length != 0) {
        if (requestsContent.style.display === "none" || (requestsContent.style.display === "block" && requestButtons.length === 0)) {
            for (var i = 0; i < requests.length; i++) {
                requestsContent.innerHTML = "";
                if (requests[i].seen === false && requestsContent.style.display != "block") {
                    var requestSeen = document.getElementById("request-seen");
                    requestSeen.src = "./images/friend-unread.png";
                }
                var profileAnchor = document.createElement("a");
                profileAnchor.href = `./profile/profile.html?id=${requests[i].fromUser.id}`;
                profileAnchor.className = "search-anchor";
                var userDiv = document.createElement("div");
                userDiv.className = "search-user-div";
                userDiv.id = `${requests[i].fromUser.id}user`;
                var userInfo = document.createElement("div");
                userInfo.className = "search-user-info";
                var userPicture = document.createElement("img");
                userPicture.className = "search-user-picture";
                userPicture.src = "data:image/*;base64," + requests[i].fromUser.profilePicture;
                var userName = document.createElement("div");
                userName.className = "search-name-value";
                userName.innerHTML = `<p><b>${requests[i].fromUser.fullName}</b></p>`;
                var requestActions = document.createElement("div");
                requestActions.className = "request-buttons";
                var acceptRequest = document.createElement("img");
                acceptRequest.src = "./images/accept.png";
                acceptRequest.className = "request-actions";
                acceptRequest.id = `${requests[i].fromUser.id}accept`;
                var refuseRequest = document.createElement("img");
                refuseRequest.src = "./images/refuse.png";
                refuseRequest.className = "request-actions";
                refuseRequest.id = `${requests[i].fromUser.id}refuse`;
                requestActions.appendChild(acceptRequest);
                requestActions.appendChild(refuseRequest);
                profileAnchor.appendChild(userPicture);
                userInfo.appendChild(profileAnchor);
                userInfo.appendChild(userName);
                userDiv.appendChild(userInfo);
                userDiv.appendChild(requestActions);
                requestsContent.appendChild(userDiv);
            }
        }
        friendRequestActions(requestedUser);
    }
    else {
        requestsContent.innerHTML = "";
        requestsContent.innerHTML = `<p style="margin:10px">Nothing to show</p>`;
    }
}

function showActionsContent(requestedUser) {
    var requestButton = document.getElementById("request-image");
    var requestsContent = document.getElementById("friend-requests");
    var requestSeen = document.getElementById("request-seen");
    requestButton.onclick = function () {
        requestsContent.style.display = "block";
        if (requestsContent.innerText != "Please wait...") {
            requestSeen.src = "./images/friend-request.png";
            updateData(`https://localhost:44373/api/friendrequests/${requestedUser.id}`);
        }
    }
    window.onmouseup = function (event) {
        if (event.target != requestButton && event.target != requestsContent) {
            requestsContent.style.display = "none";
        }
    }
}

function friendRequestActions(requestedUser) {
    var requestButtons = document.getElementsByClassName("request-actions");
    var requestsContent = document.getElementById("friend-requests");
    for (var i = 0; i < requestButtons.length; i++) {
        requestButtons[i].onclick = async function () {
            requestsContent.style.display = "block";
            var buttonId = this.id;
            if (buttonId.includes("accept")) {
                this.style.opacity = "40%";
                this.style.pointerEvents = "none";
                var userId = buttonId.replace("accept", "");
                var userDiv = document.getElementById(userId + "user");
                var refuseButton = document.getElementById(userId + "refuse");
                refuseButton.style.pointerEvents = "none";
                var newFriend = new AddFriend();
                newFriend.userId = requestedUser.id;
                newFriend.friendId = userId;
                var response = await addDataToDB(`https://localhost:44373/api/friends`, newFriend);
                if (typeof response != 'undefined') {
                    await deleteData(`https://localhost:44373/api/friendrequests/${parseInt(userId)}/${requestedUser.id}`);
                    requestsContent.removeChild(userDiv);
                    if (requestsContent.innerHTML === "") {
                        requestsContent.innerHTML = `<p style="margin:10px">Nothing to show</p>`;
                    }
                }
                else {
                    alert("An error has occured.Try again later!");
                    this.style.opacity = "40%";
                    this.style.pointerEvents = "none";
                    refuseButton.style.pointerEvents = "auto";
                }
            }
            else if (buttonId.includes("refuse")) {
                this.style.opacity = "40%";
                this.style.pointerEvents = "none";
                var userId = buttonId.replace("refuse", "");
                var userDiv = document.getElementById(userId + "user");
                var acceptButton = document.getElementById(userId + "accept");
                acceptButton.style.pointerEvents = "none";
                await deleteData(`https://localhost:44373/api/friendrequests/${parseInt(userId)}/${requestedUser.id}`);
                requestsContent.removeChild(userDiv);
                if (requestsContent.innerHTML === "") {
                    requestsContent.innerHTML = `<p style="margin:10px">Nothing to show</p>`;
                }
            }
        }
    }
}

function toggleFunctions() {
    try {
        getUser();
    }
    catch (error) {
        console.log("An error has occured!");
    }
}

toggleFunctions();