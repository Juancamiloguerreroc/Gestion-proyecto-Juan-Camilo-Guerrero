/**
 * Módulo de autenticación
 * Maneja registro, login, verificación de sesión y logout
 */

// Inicializar datos de usuarios si no existen
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('users')) {
        // Crear admin por defecto
        const defaultUsers = [
            {
                id: 'admin1',
                name: 'Administrador',
                email: 'admin@example.com',
                password: 'admin123', // En producción usar hash
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 'viewer1',
                name: 'Usuario Básico',
                email: 'user@example.com',
                password: 'user123', // En producción usar hash
                role: 'viewer',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Verificar página actual
    setupCurrentPage();
});

// Configurar página actual según su tipo
function setupCurrentPage() {
    const currentPath = window.location.pathname;
    
    // Verificar si es página de login o registro
    if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
        setupAuthForm();
        return;
    }
    
    // Verificar sesión para otras páginas
    const user = getCurrentUser();
    
    // Si no hay sesión, redirigir a login
    if (!user && !currentPath.includes('index.html') && !currentPath.includes('contact.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar acceso a páginas restringidas
    if (user) {
        if (currentPath.includes('admin.html') && user.role !== 'admin') {
            window.location.href = 'viewer.html';
            return;
        }
        
        if (currentPath.includes('viewer.html') && user.role !== 'viewer' && user.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        // Actualizar UI con información del usuario
        updateUserInterface(user);
    }
}

// Obtener usuario actual desde sessionStorage
function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser'));
}

// Actualizar interfaz con datos del usuario
function updateUserInterface(user) {
    const userDisplayEl = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userDisplayEl) {
        userDisplayEl.textContent = user.name;
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Actualizar menú según rol
    const adminLinks = document.querySelectorAll('.admin-only');
    
    adminLinks.forEach(link => {
        link.style.display = user.role === 'admin' ? 'block' : 'none';
    });
}

// Configurar formularios de autenticación (login/registro)
function setupAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            login(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };
            
            register(userData);
        });
    }
}

// Iniciar sesión
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
        showMessage('Credenciales incorrectas', 'error');
        return;
    }
    
    // Guardar sesión (omitir password)
    const { password: _, ...userSession } = user;
    sessionStorage.setItem('currentUser', JSON.stringify(userSession));
    
    // Redirigir según rol
    window.location.href = user.role === 'admin' ? 'admin.html' : 'viewer.html';
}

// Registrar nuevo usuario
function register(userData) {
    // Validar datos
    if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
        showMessage('Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (userData.password !== userData.confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        showMessage('Email no válido', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verificar si email ya existe
    if (users.some(user => user.email === userData.email)) {
        showMessage('El email ya está registrado', 'error');
        return;
    }
    
    // Crear nuevo usuario (por defecto rol viewer)
    const newUser = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name: userData.name,
        email: userData.email,
        password: userData.password, // En producción usar hash
        role: 'viewer',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registro exitoso, puedes iniciar sesión', 'success');
    
    // Redirigir a login
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Cerrar sesión
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Mostrar mensaje de feedback
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    
    if (!messageContainer) {
        const container = document.createElement('div');
        container.id = 'messageContainer';
        container.className = `message ${type}`;
        container.textContent = message;
        
        document.body.appendChild(container);
        
        // Autoocultar después de 3 segundos
        setTimeout(() => {
            container.remove();
        }, 3000);
    } else {
        messageContainer.className = `message ${type}`;
        messageContainer.textContent = message;
        
        // Reset timeout
        clearTimeout(messageContainer.timeout);
        messageContainer.timeout = setTimeout(() => {
            messageContainer.remove();
        }, 3000);
    }
}

