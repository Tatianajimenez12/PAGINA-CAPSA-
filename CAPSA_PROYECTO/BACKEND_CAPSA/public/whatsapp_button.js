const whatsappButton = document.getElementById('whatsappButton');
const whatsappQR = document.getElementById('whatsappQR');
const closeQR = document.getElementById('closeQR');

// Mostrar u ocultar el cuadro QR al hacer clic en el botón de WhatsApp
whatsappButton.addEventListener('click', () => {
    if (whatsappQR.style.display === 'block') {
        whatsappQR.style.display = 'none';
    } else {
        whatsappQR.style.display = 'block';
    }
});


// Ocultar el cuadro QR al hacer clic en el botón de cerrar
closeQR.addEventListener('click', () => {
    whatsappQR.style.display = 'none';
});

