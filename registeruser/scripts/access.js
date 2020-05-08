window.onload = async function() {
    var currentUser = localStorage.getItem('email');
    var access = localStorage.getItem('access');
    if(currentUser != null || access != null) {
        window.location.href = "../home.html";
    }
    else {
        document.body.style.display = "block";
    }
}