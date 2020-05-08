async function getUserData(path) {
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
            var response = error.response;
            if (typeof response == "undefined") {
                window.location.href = "../loginuser/login.html";
            }
        });
}

window.onload = async function () {
    try {
        var currentUser = localStorage.getItem('email');
        var access = localStorage.getItem('access');
        var resolve = document.getElementById("resolving-user");
        if (currentUser == null || access == null) {
            window.location.href = "../loginuser/login.html";
            localStorage.clear();
        }
        resolve.style.display = "block";
        var requestedUser = await getUserData(`https://localhost:44373/api/users/access/${access}/${currentUser}`);
        if (currentUser != null && access != null && requestedUser != null && typeof requestedUser != "undefined") {
            var mainContent = document.getElementById("main-page-content");
            document.body.removeChild(resolve);
            mainContent.style.display = "block";
            var profileAnchor = document.getElementById("profile-anchor");
            var profilePicture = document.getElementById("profile-picture");
            profileAnchor.href = `./profile.html?id=${requestedUser.id}`;
            profilePicture.src = "data:image/*;base64," + requestedUser.profilePicture;
            var users = await getUserData(`https://localhost:44373/api/users`);
            searchUsers(users);
            await showUser(requestedUser.id)
        } else {
            localStorage.removeItem("email");
            localStorage.removeItem("access");
            window.location.href = "../loginuser/login.html";
        }
    } catch (error) {
        console.log(error);
    }
}