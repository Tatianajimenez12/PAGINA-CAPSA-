function toggleChatbot() {
    const chatbotBody = document.getElementById('chatbotBody');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotMessage = document.querySelector('.chatbot-message');

    chatbotBody.style.display = chatbotBody.style.display === 'none' || !chatbotBody.style.display ? 'block' : 'none';
    chatbotContainer.style.animation = 'none';
    chatbotMessage.style.animation = 'none';

    if (chatbotBody.style.display !== 'none' && !document.getElementById('chatbotMessages').innerHTML.trim()) {
        document.getElementById('chatbotMessages').innerHTML =
            `<div style="background-color: #f1f1f1; padding: 10px; margin: 5px; border-radius: 4px; align-self: flex-start;">
                ¡Hola! Bienvenid@ al soporte de CAPSA. Estamos aquí para ayudarte. Por favor, ingresa tu nombre y correo electrónico para continuar.
            </div>`;
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
    document.getElementById('chatbotForm').style.display = 'none';
    document.getElementById('chatInputSection').style.display = 'block';

    chatbotMessages.innerHTML +=
        `<div style="text-align: center; font-weight: bold; margin: 10px;">
            Hola ${name}, dinos cuál es tu duda y con gusto te ayudaremos.
        </div>`;
}

function sendUserQuestion() {
    const userQuestion = document.getElementById('userQuestion').value.trim();
    if (!userQuestion) {
        alert('Por favor, escribe tu pregunta.');
        return;
    }

    const chatbotMessages = document.getElementById('chatbotMessages');
    chatbotMessages.innerHTML +=
        `<div style="text-align: right; background-color: #d1e7dd; padding: 10px; margin: 5px; border-radius: 4px; align-self: flex-end;">
            ${userQuestion}
        </div>`;

    const botResponse = getBotResponse(userQuestion);
    chatbotMessages.innerHTML +=
        `<div style="background-color: #f1f1f1; padding: 10px; margin: 5px; border-radius: 4px; align-self: flex-start;">
            ${botResponse}
        </div>`;

    document.getElementById('userQuestion').value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(question) {
    const responses = {
        "hola": "Hola que tal como estas en que puedo ayudarte'.",
        "contratar": "Para contratar un servicio, dirígete a la página principal de CAPSA y haz clic en 'CONTÁCTENOS'.",
        "agendar": "Puedes agendar un servicio a través del ícono de WhatsApp en la página.",
        "tiempo": "El tiempo de respuesta es de 24 horas aproximadamente.",
        "calidad": "Contamos con personal altamente capacitado para garantizar la calidad del servicio.",
        "paquetes": "Sí, ofrecemos paquetes especiales. Contáctanos para más información.",
        "comunicar": "Puedes comunicarte con nosotros a través de WhatsApp o llamada al 5535112950.",
        "opiniones": "Las opiniones de nuestros clientes están en la sección 'Reseñas'.",
        "reseñas": "Para dejar una reseña, visita la sección 'Reseñas' en el menú principal.",
        "horarios": "Nuestros servicios están disponibles las 24 horas del día.",
        "navegar": "Para navegar en la página, usa el menú principal que incluye diferentes secciones.",
        "gracias": "Denada cualquier otra duda que tengas por favor contactate por este medio o por el WhatsApp'.",
    };

    for (const key in responses) {
        if (question.toLowerCase().includes(key)) {
            return responses[key];
        }
    }

    return "Lo siento, no tengo una respuesta para esa pregunta. Contáctanos para más información a nuestro WhatsApp con el numero 5548176178 y con gusto te atenderemos.";
}

function closeChatbot() {
    document.getElementById('chatbotBody').style.display = 'none';
}

function resetChatbot() {
    document.getElementById('chatbotForm').style.display = 'block';
    document.getElementById('chatInputSection').style.display = 'none';
}