const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signIn');
const signUpForm = document.getElementById('signup');
const recoverPasswordLink = document.getElementById('recoverPasswordLink');
const backToSignIn = document.getElementById('backToSignIn');
const recoverPasswordForm = document.getElementById('recoverPassword');


signUpButton.addEventListener('click', function() {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
})
signInButton.addEventListener('click', function() {
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
})

document.getElementById('submitSignUp').addEventListener('click', function(e) {
    e.preventDefault();
    const fName = document.getElementById('fName').value;
    const lName = document.getElementById('lName').value;
    const rEmail = document.getElementById('rEmail').value;
    const rPassword = document.getElementById('rPassword').value;

    fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fName, lName, rEmail, rPassword }),
        })
        .then(res => res.text())
        .then(data => {
            console.log(data);
            alert(data);
        })
        .catch(err => console.log(err));
});

document.getElementById('submitSignIn').addEventListener('click', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(res => res.text())
        .then(data => {
            console.log(data);
            alert(data);
        })
        .catch(err => console.log(err));
});

// Mostrar el formulario de recuperación de contraseña
recoverPasswordLink.addEventListener('click', function() {
    signInForm.style.display = "none";
    recoverPasswordForm.style.display = "block";
});

// Volver al formulario de inicio de sesión desde el de recuperación de contraseña
backToSignIn.addEventListener('click', function() {
    recoverPasswordForm.style.display = "none";
    signInForm.style.display = "block";
});

// Enviar el correo para recuperación de contraseña
document.getElementById('submitRecover').addEventListener('click', function(e) {
    e.preventDefault();
    const recoverEmail = document.getElementById('recoverEmail').value;

    fetch('http://localhost:3000/recover', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: recoverEmail }),
        })
        .then(res => res.text())
        .then(data => {
            console.log(data);
            alert(data);
        })
        .catch(err => console.log(err));
});

const checkTokenSql = 'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?';
db.query(checkTokenSql, [token, Date.now()], (err, result) => {
    if (err || result.length === 0) {
        return res.status(400).send('El token es inválido o ha expirado.');
    }
    // Si el token es válido, continúa con el proceso de restablecimiento de contraseña
});

const updatePasswordSql = 'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE resetPasswordToken = ?';
db.query(updatePasswordSql, [newPassword, token], (err) => {
    if (err) {
        return res.status(500).send('Error al actualizar la contraseña');
    }
    res.send('Contraseña actualizada correctamente');
});

document.addEventListener("DOMContentLoaded", function() {
    // Selección de elementos de la barra de navegación y formularios
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const signInForm = document.getElementById("signIn");
    const signUpForm = document.getElementById("signup");

    // Función para alternar formularios
    function toggleForms(hideForm, showForm) {
        hideForm.style.display = "none";
        showForm.style.display = "block";
    }

    // Event listeners para los botones de navegación
    loginButton.addEventListener("click", () => toggleForms(signUpForm, signInForm));
    registerButton.addEventListener("click", () => toggleForms(signInForm, signUpForm));
});


document.getElementById('submitSignUp').addEventListener('click', function(e) {
    e.preventDefault();
    const fName = document.getElementById('fName').value;
    const lName = document.getElementById('lName').value;
    const rEmail = document.getElementById('rEmail').value;
    const rPassword = document.getElementById('rPassword').value;

    fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fName, lName, rEmail, rPassword })
        })
        .then(res => res.text())
        .then(data => alert(data))
        .catch(err => console.log(err));
});

// Inicio de sesión
document.getElementById('submitSignIn').addEventListener('click', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.text())
        .then(data => alert(data))
        .catch(err => console.log(err));
});

// Recuperación de contraseña
document.getElementById('submitRecover').addEventListener('click', function(e) {
    e.preventDefault();
    const recoverEmail = document.getElementById('recoverEmail').value;

    fetch('http://localhost:3000/recover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recoverEmail })
        })
        .then(res => res.text())
        .then(data => alert(data))
        .catch(err => console.log(err));
});