// Validar datos de verificación
document.getElementById('verificacionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;

    if (nombre && correo && telefono) {
        document.getElementById('verificacionSection').classList.add('hidden');
        document.getElementById('reseñaSection').classList.remove('hidden');
    } else {
        alert('Por favor, completa todos los campos correctamente.');
    }
});

// Seleccionar calificación con estrellas
let calificacionSeleccionada = 0;
document.querySelectorAll('.estrella').forEach(estrella => {
    estrella.addEventListener('click', function() {
        calificacionSeleccionada = parseInt(this.dataset.calificacion, 10);
        document.querySelectorAll('.estrella').forEach(e => e.style.opacity = '0.3');
        for (let i = 0; i < calificacionSeleccionada; i++) {
            document.querySelectorAll('.estrella')[i].style.opacity = '1';
        }
    });
});

// Enviar reseña
document.getElementById('formularioReseña').addEventListener('submit', function(event) {
    event.preventDefault();

    const servicio = document.getElementById('servicio').value;
    const comentario = document.getElementById('comentario').value;

    if (calificacionSeleccionada > 0) {
        // Guardar las reseñas en una lista
        const nuevaReseña = {
            servicio,
            calificacion: calificacionSeleccionada,
            comentario
        };

        let reseñasGuardadas = JSON.parse(localStorage.getItem('reseñas')) || [];
        reseñasGuardadas.push(nuevaReseña);
        localStorage.setItem('reseñas', JSON.stringify(reseñasGuardadas));

        // Redirigir a la nueva página
        window.location.href = 'reseña-mostrada.html';
    } else {
        alert('Por favor, selecciona una calificación.');
    }
});