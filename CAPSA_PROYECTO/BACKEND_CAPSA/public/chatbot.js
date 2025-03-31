// Función global para las sugerencias
window.insertSuggestion = function(text) {
    const userQuestionInput = document.getElementById('userQuestion');
    if (userQuestionInput) {
        userQuestionInput.value = text;
        userQuestionInput.focus();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Estado y elementos del DOM
    let isFirstInteraction = true;
    const chatbotContainer = document.querySelector('.chatbot-container');
    const floatingBtn = document.querySelector('.chatbot-floating-btn');
    const closeBtn = document.querySelector('.chatbot-close-btn');
    const chatbotBody = document.getElementById('chatbotBody');
    const userQuestionInput = document.getElementById('userQuestion');
    const sendQuestionBtn = document.getElementById('sendQuestionBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Inicialización
    initChatbot();

    function initChatbot() {
        // Event listeners para el botón flotante y cierre
        floatingBtn.addEventListener('click', toggleChatbot);
        closeBtn.addEventListener('click', closeChatbot);
        
        // Event listeners para el funcionamiento del chat
        userQuestionInput.addEventListener('keypress', handleKeyPress);
        sendQuestionBtn.addEventListener('click', sendUserQuestion);

        // Event delegation para las sugerencias
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('suggestion')) {
                const question = e.target.getAttribute('data-question');
                if (question) {
                    insertSuggestion(question);
                }
            }
        });
    }

    function toggleChatbot() {
        const isVisible = chatbotBody.style.display === 'block';
        chatbotBody.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible && isFirstInteraction) {
            showWelcomeMessage();
            isFirstInteraction = false;
        }
        
        // Alternar clase active para estilos CSS
        chatbotContainer.classList.toggle('active', chatbotBody.style.display === 'block');
    }

    function closeChatbot(e) {
        e.stopPropagation();
        chatbotBody.style.display = 'none';
        chatbotContainer.classList.remove('active');
    }

    function showWelcomeMessage() {
        addMessageToChat(`
            <div class="bot-message">
                ¡Hola! Soy el asistente virtual de CAPSA. ¿En qué puedo ayudarte hoy?
            </div>
            <div class="bot-message suggestions">
                <strong>Puedes preguntar sobre:</strong>
                <div class="suggestion" data-question="¿Cómo contrato servicios para un adulto mayor?">Contratación de servicios</div>
                <div class="suggestion" data-question="¿Qué documentos necesito para contratar?">Documentación requerida</div>
                <div class="suggestion" data-question="¿Cuáles son sus horarios de atención?">Horarios de atención</div>
            </div>
        `);
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            sendUserQuestion();
        }
    }

    async function sendUserQuestion() {
        const question = userQuestionInput.value.trim();
        if (!question) return;

        addMessageToChat(`<div class="user-message">${escapeHtml(question)}</div>`);
        userQuestionInput.value = '';
        
        const thinkingId = showThinkingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': '7F$jBm2@8zR-5tGv9yLn!4sPx6wQz3dK'
                },
                body: JSON.stringify({ 
                    question ,

                     // Configuración optimizada:
                    model_config: {
                        model: 'command',
                        max_tokens: 300,  // Aumentamos el límite de tokens
                        temperature: 0.3, // Reducimos para respuestas más deterministas
                        p: 0.9,          // Control de diversidad
                        k: 0,             // Evitar muestreo con baja probabilidad
                        stop_sequences: ['\n'], // Detenerse en saltos de línea
                        frequency_penalty: 0.5, // Reducir repeticiones
                        presence_penalty: 0.5,  // Fomentar nuevos temas
                        prompt_truncation: 'AUTO' // Truncamiento automático
                }
                
                })

            });
            
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const data = await response.json();
            removeThinkingIndicator(thinkingId);

            // Procesamiento adicional de la respuesta
            const cleanAnswer = cleanAIResponse(data.answer);
            addMessageToChat(`<div class="bot-message">${formatBotResponse(data.answer)}</div>`);
        } catch (error) {
            removeThinkingIndicator(thinkingId);
            addMessageToChat('<div class="error-message">Error al procesar tu pregunta. Por favor intenta nuevamente.</div>');
            console.error('Error en sendUserQuestion:', error);
        }
    }

    // Funciones auxiliares
    function addMessageToChat(messageHtml) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = messageHtml;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function showThinkingIndicator() {
        const id = 'thinking-' + Date.now();
        addMessageToChat(`
            <div id="${id}" class="bot-message thinking">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `);
        return id;
    }

    function removeThinkingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatBotResponse(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    function cleanAIResponse(text) {
        // Eliminar texto en inglés no deseado
        let cleaned = text.replace(/(Translation|Note|English):.*?\n/gi, '');
        
        // Corregir frases cortadas
        cleaned = cleaned.replace(/([^.!?])\s*$/, '$1.');
        
        // Eliminar código JSON o marcado no deseado
        cleaned = cleaned.replace(/\{.*?\}/g, '');
        cleaned = cleaned.replace(/\[.*?\]/g, '');
        
        // Asegurar que la respuesta esté en español
        if (cleaned.includes('English') && !cleaned.includes('español')) {
            cleaned = 'Lo siento, hubo un problema generando la respuesta. Por favor reformula tu pregunta.';
        }
        
        return cleaned;
    }
});