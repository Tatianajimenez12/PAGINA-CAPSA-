document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        preferencia_contacto: document.getElementById('preferencia-contacto').value,
        servicio_contratado: document.getElementById('servicio-contratado').value,
        problema_area: document.getElementById('problema-area').value,
        especialista: document.getElementById('especialista').value,
        fecha: document.getElementById('fecha').value,
        horario: document.getElementById('horario').value,
        descripcion: document.getElementById('descripcion').value
    };

    fetch('http://localhost:3000/quejas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.text())
        .then(data => {
            alert('Queja enviada correctamente');
        })
        .catch(error => console.error('Error:', error));
});