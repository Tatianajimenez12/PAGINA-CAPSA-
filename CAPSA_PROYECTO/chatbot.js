function toggleChatbot() {
    const chatbotBody = document.getElementById('chatbotBody');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotMessage = document.querySelector('.chatbot-message');

    chatbotBody.style.display = chatbotBody.style.display === 'none' || !chatbotBody.style.display ? 'block' : 'none';
    chatbotContainer.style.animation = 'none';
    chatbotMessage.style.animation = 'none';

    if (chatbotBody.style.display === 'none') {
        resetChatbot();
    } else {
        const chatbotMessages = document.getElementById('chatbotMessages');
        chatbotMessages.innerHTML = `
            <div style="background-color: #f1f1f1; padding: 10px; margin: 5px; border-radius: 4px; align-self: flex-start;">
                ¡Hola! Bienvenid@ al soporte de CAPSA. Estamos aquí para ayudarte con cualquier duda o solicitud.
                Por favor, ingresa tu nombre y correo electrónico para continuar.
            </div>
        `;
    }
}

function submitUserInfo() {
    const name = document.getElementById('nameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();

    if (!name || !email) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotForm = document.getElementById('chatbotForm');
    const chatbotOptions = document.getElementById('chatbotOptions');
    const optionsForm = document.getElementById('optionsForm');

    chatbotForm.style.display = 'none';
    chatbotMessages.innerHTML = `
        <div style="text-align: center; font-weight: bold; margin: 10px;">
            Hola ${name}, selecciona la duda que tienes:
        </div>
    `;

    chatbotOptions.style.display = 'block';
    optionsForm.innerHTML = generateOptions();
}

function generateOptions() {
    const options = [
        "¿En qué sección de la página puedo contratar un cuidado o servicio?",
        "¿Cómo puedo agendar un cuidado o servicio?",
        "¿Cuánto tiempo tardan en atender mi solicitud de servicio?",
        "¿Qué medidas toman para garantizar la calidad del servicio?",
        "¿Ofrecen paquetes de servicios o promociones especiales?",
        "¿Cómo puedo comunicarme directamente con ustedes?",
        "¿Dónde puedo ver opiniones de otros clientes?",
        "¿Dónde puedo dejar mis reseñas?",
        "¿En qué horarios puedo contratar un servicio o cuidado?",
        "¡Tengo dudas de cómo navegar en la página web!"
    ];

    return options.map((option, index) =>
        `<label><input type="checkbox" onclick="showPopup('${option}', ${index + 1})" /> ${option}</label>`
    ).join('');
}

function showPopup(question, index) {
    const responses = {
        1: "Para contratar un cuidado o servicio, dirígete a la página principal de CAPSA y haz clic en el botón \"CONTÁCTENOS\". Se abrirá un formulario donde deberás ingresar tus datos o los de un familiar. Una vez completado, haz clic en \"Enviar mensaje\" y nuestro equipo se pondrá en contacto contigo lo antes posible.",
        2: "Puedes agendar un cuidado o servicio directamente a través del ícono de WhatsApp que aparece en todas las secciones de la página. Haz clic en el ícono para enviar un mensaje automático o escanea el código QR que se muestra en esa sección para contactarnos de manera rápida y sencilla.",
        3: "El tiempo promedio para atender tu solicitud es de 24 horas. Sin embargo, nos esforzamos por contactarte lo antes posible para ofrecerte una atención personalizada y garantizar que recibas toda la información necesaria sobre el servicio solicitado.",
        4: "En CAPSA, contamos con personal altamente capacitado y seguimos estrictos estándares de calidad para asegurar que cada servicio cumpla con las necesidades y expectativas de nuestros clientes.",
        5: "Sí, ofrecemos paquetes especiales para diferentes servicios y cuidados. Para obtener más información, dirígete al apartado \"CONTÁCTENOS\" en nuestra página principal, llena el formulario y te proporcionaremos todos los detalles. Estamos aquí para ayudarte.",
        6: "Puedes comunicarte con nosotros a través del número de WhatsApp que aparece en todas las secciones de la página de CAPSA. También puedes utilizar el ícono de WhatsApp para iniciar una conversación rápida.",
        7: "Las opiniones de nuestros clientes están disponibles en la sección \"Reseñas\", ubicada en el menú principal. Estas reseñas son proporcionadas por personas que ya han utilizado nuestros servicios y pasaron por un proceso de validación para compartir su experiencia.",
        8: "Para dejar una reseña, visita la sección \"Reseñas\" en el menú principal. Es necesario ser cliente y haber recibido un servicio para completar el proceso de validación antes de compartir tu opinión.",
        9: "Nuestros servicios están disponibles las 24 horas del día. Siempre estamos listos para atenderte en cualquier momento y asegurarnos de ofrecerte la mejor experiencia.",
        10: "Para navegar en nuestra página, utiliza el menú principal, que incluye secciones como \"Inicio\", \"¿Quiénes somos?\", \"Servicios\", \"Nuestro personal\", \"Convenios\", \"Únete con nosotros\" y \"Reseñas\". Haz clic en cualquier apartado para acceder a la información correspondiente. Si tienes más dudas, no dudes en contactarnos al 5535112950, ya sea por WhatsApp o llamada."
    };

    const popup = document.getElementById('popup');
    document.getElementById('popupTitle').textContent = question;
    document.getElementById('popupMessage').textContent = responses[index];
    popup.style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function closeChatbot() {
    document.getElementById('chatbotBody').style.display = 'none';
}

function resetChatbot() {
    document.getElementById('chatbotForm').style.display = 'block';
    document.getElementById('chatbotOptions').style.display = 'none';
}