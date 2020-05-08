async function addDataToDB(path,object) {
    return axios.post(path,object, {
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
            var registerButton = document.getElementById("register-button");
            var messageOutput = document.getElementById("message");
            var response = error.response;
            if(typeof response != "undefined"){
                messageOutput.innerText = response.data;
                registerButton.style.pointerEvents = 'auto';
            }
        });
}

class User {
    constructor(email, name, surname, dateOfBirth, gender, password) {
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.password = password;
    }
}

function redirectToLogIn() {
    var loginButton = document.getElementById("login-button");
    loginButton.onclick = function () {
        window.location.href = "../loginuser/login.html";
    }
}

function registerUser() {
    var registerButton = document.getElementById("register-button");
    var inputs = document.getElementsByClassName("register-inputs");
    var messageOutput = document.getElementById("message");
    var emailInput = document.getElementById("email");
    var nameInput = document.getElementById("first-name");
    var surnameInput = document.getElementById("last-name");
    var genderInput = document.getElementById("gender");
    var birthdayInput = document.getElementById("birthday");
    var passwordInput = document.getElementById("password");
    var confPasswordInput = document.getElementById("confirm-password");
    registerButton.onclick = async function () {
        var inputValidation = true;
        var emailValidation = true;
        var birthdayValidation = true;
        var passwordValidation = true;
        inputValidation = checkInputs(messageOutput, inputs, inputValidation);
        emailValidation = checkEmail(emailInput, messageOutput, emailValidation, inputValidation);
        birthdayValidation = checkBirthday(birthdayInput,messageOutput,birthdayValidation,inputValidation,emailValidation);
        passwordValidation = checkPasswords(passwordValidation,passwordInput,confPasswordInput,
        messageOutput,birthdayValidation,inputValidation,emailValidation);
        if(inputValidation == true && emailValidation == true && birthdayValidation == true && passwordValidation == true){
            registerButton.style.pointerEvents = 'none';
            var loadingIcon = document.getElementById("loading-icon");
            loadingIcon.style.display = "block";
            messageOutput.style.display = "none";
            resetInputColor();
            var newUser = new User();
            newUser.email = emailInput.value.trim();
            newUser.name = nameInput.value.trim();
            newUser.surname = surnameInput.value.trim();
            newUser.dateOfBirth = birthdayInput.value;
            if(genderInput.value == "male"){
                newUser.gender = false;
            }
            else if (genderInput.value == "female"){
                newUser.gender = true;
            }
            newUser.password = passwordInput.value;
            var user = await addDataToDB("https://localhost:44373/api/users",newUser);
            toggleLoaderIcon(messageOutput,loadingIcon);
            if(typeof user === "undefined" && messageOutput.innerText == "") {
                messageOutput.innerText = "An error has occured!Try again later!";
                toggleLoaderIcon(messageOutput,loadingIcon);
                registerButton.style.pointerEvents = 'auto';
            }
            else if(typeof user != "undefined"){
                successRegistrationRedirect();
            }
        }
    }
}

function resetInputColorOnClick(){
    var inputs = document.getElementsByClassName("register-inputs");
    var messageOutput = document.getElementById("message");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].onfocus = function (){
            messageOutput.innerText = "";
            this.style.borderColor = "#b5beb9";
        }
    }
}

function resetInputColor(){
    var inputs = document.getElementsByClassName("register-inputs");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].style.borderColor = "#b5beb9";
    }
}

function toggleLoaderIcon(outputMessage,loaderIcon){
    if(outputMessage.innerText != "") {
        loaderIcon.style.display = "none";
        outputMessage.style.display = "block";
    }
    else {
        loaderIcon.style.display == "block";
        outputMessage.style.display = "none";
    }
}

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
    if(inputValidation != false && emailValidation == false) {
        messageOutput.innerText = "Please enter valid e-mail!";
        emailInput.style.borderColor = "red";
    }
    return emailValidation;
}

function checkBirthday(birthdayInput,messageOutput,birthdayValidation,inputValidation,emailValidation) {
    var birthday = +new Date(birthdayInput.value);
    var currentYears = parseInt((Date.now() - birthday) / (31557600000));
    if(currentYears < 16) {
        birthdayValidation = false;
    }
    if(birthdayValidation == false && inputValidation != false && emailValidation != false) {
        messageOutput.innerText = "You need to be atleast 16 years old!";
    }
    return birthdayValidation;
}

function checkPasswords(passwordValidation,passwordInput,confPasswordInput,messageOutput,birthdayValidation,inputValidation,emailValidation) {
    if(passwordInput.value.length > 20 || passwordInput.value.length < 8) {
        passwordValidation = false;
        if(passwordValidation == false && inputValidation != false && emailValidation != false && birthdayValidation != false) {
            messageOutput.innerText = "Enter a password between 8 and 20 characters!";
            passwordInput.style.borderColor = "red";
        }
    }
    else if(passwordInput.value != confPasswordInput.value){
        passwordValidation = false;
        if(passwordValidation == false && inputValidation != false && emailValidation != false && birthdayValidation != false) {
            messageOutput.innerText = "Your passwords are not matching!";
            passwordInput.style.borderColor = "red";
            confPasswordInput.style.borderColor = "red";
        }
    }
    return passwordValidation;
}

function successRegistrationRedirect() {
    window.location.href = "../welcome/welcome.html";
}

function toggleFunctions() {
    redirectToLogIn();
    registerUser();
    resetInputColorOnClick();
}

toggleFunctions();