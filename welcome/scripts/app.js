function redirectToLogIn() {
    var loginButton = document.getElementById("login-button");
    loginButton.onclick = function () {
        window.location.href = "../loginuser/login.html";
    }
}

function toggleFunctions() {
    redirectToLogIn();
}

toggleFunctions();