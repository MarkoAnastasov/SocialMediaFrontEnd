async function getDataParsed(path) {
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
            var loginButton = document.getElementById("login-button");
            var messageOutput = document.getElementById("message");
            var response = error.response;
            if (typeof response != "undefined") {
                messageOutput.innerText = response.data;
                loginButton.style.pointerEvents = 'auto';
            }
        });
}

function loginUser() {
    var loginButton = document.getElementById("login-button");
    var inputs = document.getElementsByClassName("login-inputs");
    var messageOutput = document.getElementById("message");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    loginButton.onclick = async function () {
        messageOutput.innerText = "";
        var validation = true;
        var emailValidation = true;
        validation = checkInputs(messageOutput, inputs, validation);
        emailValidation = checkEmail(emailInput, messageOutput, emailValidation, validation)
        if (validation == true && emailValidation == true) {
            loginButton.style.pointerEvents = 'none';
            var loadingIcon = document.getElementById("loading-icon");
            loadingIcon.style.display = "block";
            messageOutput.style.display = "none";
            resetInputColor();
            var access = await getDataParsed(`https://localhost:44373/api/users/${emailInput.value.trim()}/${passwordInput.value}`);
            toggleLoaderIcon(messageOutput, loadingIcon);
            if (typeof access === "undefined" && messageOutput.innerText == "") {
                messageOutput.innerText = "An error has occured!Try again later!";
                toggleLoaderIcon(messageOutput, loadingIcon);
                loginButton.style.pointerEvents = 'auto';
            }
            else if (typeof access != "undefined") {
                localStorage.setItem('access', access.value);
                localStorage.setItem('email', emailInput.value.trim());
                redirectToHome();
            }
        }
    }
}

function enterKey() {
    var inputs = document.getElementsByClassName("login-inputs");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("login-button").click();
            }
        });
    }
};

function checkInputs(messageOutput, inputs, inputValidation) {
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "") {
            inputValidation = false;
            messageOutput.innerText = "Please fill in all input fields!"
            inputs[i].style.borderColor = "red";
        }
    }
    return inputValidation;
}

function checkEmail(emailInput, messageOutput, emailValidation, inputValidation) {
    var atpos = emailInput.value.trim().indexOf("@");
    var dotpos = emailInput.value.trim().lastIndexOf(".");
    if (atpos < 1 || (dotpos - atpos < 2)) {
        emailValidation = false;
    }
    if (inputValidation != false && emailValidation == false) {
        messageOutput.innerText = "Please enter valid e-mail!";
        emailInput.style.borderColor = "red";
    }
    return emailValidation;
}

function resetInputColorOnClick() {
    var inputs = document.getElementsByClassName("login-inputs");
    var messageOutput = document.getElementById("message");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].onfocus = function () {
            messageOutput.innerText = "";
            this.style.borderColor = "#b5beb9";
        }
    }
}

function resetInputColor() {
    var inputs = document.getElementsByClassName("login-inputs");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].style.borderColor = "#b5beb9";
    }
}

function redirectToRegistration() {
    var registerButton = document.getElementById("register-button");
    registerButton.onclick = function () {
        window.location.href = "../registeruser/register.html";
    }
}

function toggleLoaderIcon(outputMessage, loaderIcon) {
    if (outputMessage.innerText != "") {
        loaderIcon.style.display = "none";
        outputMessage.style.display = "block";
    }
    else {
        loaderIcon.style.display == "block";
        outputMessage.style.display = "none";
    }
}

function redirectToHome() {
    window.location.href = "../home.html";
}

function toggleFunctions() {
    redirectToRegistration();
    resetInputColorOnClick();
    enterKey();
    loginUser();
}

toggleFunctions();