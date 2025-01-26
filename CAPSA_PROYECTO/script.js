document.getElementById('verificarForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const nombre = document.querySelector('input[name="nombre"]').value;
    const correo = document.querySelector('input[name="correo"]').value;
    const telefono = document.querySelector('input[name="telefono"]').value;

    const formData = {
        nombre: nombre,
        correo: correo,
        telefono: telefono
    };

    fetch('http://localhost:3000/verificar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.text())
    .then(data => {
        alert(data);  // Muestra el mensaje de éxito
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Hubo un error al enviar los datos.');
    });
});
