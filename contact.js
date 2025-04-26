/**
 * Módulo de contacto
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar página de contacto
    initContactPage();
    
    // Toggle menú móvil
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('#main-nav').classList.toggle('active');
    });
});

// Inicializar página de contacto
function initContactPage() {
    // Configurar formulario de contacto
    setupContactForm();
    
    // Mostrar información de contacto
    loadContactInfo();
}

// Configurar formulario de contacto
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener datos del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Validar formulario
        if (!validateContactForm(name, email, subject, message)) {
            return;
        }
        
        // Simular envío de formulario
        submitContactForm(name, email, subject, message);
    });
}

// Validar formulario de contacto
function validateContactForm(name, email, subject, message) {
    // Validar campos obligatorios
    if (!name || !email || !subject || !message) {
        showMessage('Todos los campos son obligatorios', 'error');
        return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Email no válido', 'error');
        return false;
    }
    
    return true;
}

// Simular envío de formulario
function submitContactForm(name, email, subject, message) {
    // Mostrar loader
    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loader"></span> Enviando...';
    
    // Simular retraso de envío
    setTimeout(() => {
        // Guardar mensaje en localStorage para simular persistencia
        const contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        
        const newMessage = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            name,
            email,
            subject,
            message,
            createdAt: new Date().toISOString(),
            status: 'unread'
        };
        
        contactMessages.push(newMessage);
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
        
        // Resetear formulario
        document.getElementById('contactForm').reset();
        
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Mostrar mensaje de éxito
        showMessage('Mensaje enviado correctamente. Te responderemos lo antes posible.', 'success');
    }, 1500);
}

// Cargar información de contacto
function loadContactInfo() {
    const contactInfoContainer = document.getElementById('contactInfo');
    
    if (!contactInfoContainer) return;
    
    // Información de contacto estática
    contactInfoContainer.innerHTML = `
        <div class="contact-item">
            <div class="icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="info">
                <h4>Dirección</h4>
                <p>Calle Principal 123, 28001 Madrid</p>
            </div>
        </div>
        <div class="contact-item">
            <div class="icon"><i class="fas fa-phone"></i></div>
            <div class="info">
                <h4>Teléfono</h4>
                <p>+34 912 345 678</p>
            </div>
        </div>
        <div class="contact-item">
            <div class="icon"><i class="fas fa-envelope"></i></div>
            <div class="info">
                <h4>Email</h4>
                <p>info@tuempresa.com</p>
            </div>
        </div>
        <div class="contact-item">
            <div class="icon"><i class="fas fa-clock"></i></div>
            <div class="info">
                <h4>Horario</h4>
                <p>Lunes a Viernes: 9:00 - 18:00</p>
                <p>Fines de semana: Cerrado</p>
            </div>
        </div>
    `;
}

// Mostrar mensaje al usuario
function showMessage(message, type = 'info') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${type}`;
    messageContainer.textContent = message;
    
    document.body.appendChild(messageContainer);
    
    // Mostrar mensaje
    setTimeout(() => {
        messageContainer.classList.add('show');
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        messageContainer.classList.remove('show');
        setTimeout(() => {
            messageContainer.remove();
        }, 300);
    }, 3000);
}