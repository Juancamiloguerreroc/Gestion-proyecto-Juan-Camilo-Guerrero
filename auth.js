/**
 * Módulo de autenticación
 * Maneja registro, login, verificación de sesión y logout
 */

// Inicializar datos de usuarios si no existen
document.addEventListener('DOMContentLoaded', async () => {
    // --- BLOQUE PARA INSERTAR USUARIOS POR DEFECTO EN INDEXEDDB ---
    try {
        const db = new Database();
        await db.initDatabase();

        // Verificar si existen usuarios en IndexedDB
        const users = await db.performTransaction('users', 'readonly', store => store.getAll());
        if (!users || users.length === 0) {
            // Insertar usuarios por defecto (contraseñas de al menos 8 caracteres)
            const defaultUsers = [
                {
                    name: 'Administrador',
                    email: 'admin@example.com',
                    password: 'admin1234',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                },
                {
                    name: 'Usuario Básico',
                    email: 'user@example.com',
                    password: 'user1234',
                    role: 'viewer',
                    createdAt: new Date().toISOString()
                }
            ];
            for (const user of defaultUsers) {
                try {
                    await db.addUser(user);
                } catch (e) {
                    // Si ya existe, ignorar el error
                }
            }
            console.log('Usuarios por defecto insertados en IndexedDB');
        }
    } catch (e) {
        console.error('Error insertando usuarios por defecto en IndexedDB:', e);
    }
    // --- FIN DEL BLOQUE ---

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
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value,
                role: document.getElementById('role').value // El rol seleccionado en el formulario
            };
            
            register(userData);
        });
    }
}

// Iniciar sesión
async function login(email, password) {
    try {
        const dbInstance = new Database();
        await dbInstance.initDatabase();

        const user = await dbInstance.verifyCredentials(email, password);

        if (user) {
            // Crear sesión en IndexedDB
            const session = await dbInstance.createSession(user.id);

            // Guardar usuario en sessionStorage (sin contraseña)
            const { password: _, ...userSession } = user;
            sessionStorage.setItem('currentUser', JSON.stringify({
                ...userSession,
                sessionId: session.id
            }));

            // Mostrar mensaje de éxito
            showMessage('¡Inicio de sesión exitoso!', 'success', 'green');

            // Redirigir según rol después de mostrar el mensaje
            setTimeout(() => {
                window.location.href = 'viewer.html';
            }, 1500);
            return true;
        } else {
            showMessage('Credenciales incorrectas o usuario no registrado', 'error', 'red');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Error al conectar con la base de datos', 'error', 'red');
        return false;
    }
}

// Mostrar mensajes de feedback
function showMessage(message, type = 'info', color = 'black', backgroundColor = 'transparent') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${type}`;
    messageContainer.textContent = message;
    messageContainer.style.color = color;
    messageContainer.style.backgroundColor = backgroundColor;
    messageContainer.style.padding = '10px';
    messageContainer.style.margin = '10px 0';
    messageContainer.style.borderRadius = '5px';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.fontWeight = 'bold';
    messageContainer.style.border = `1px solid ${color}`;
    
    // Buscar el formulario o un contenedor adecuado
    const form = document.querySelector('#loginForm') || document.querySelector('.form-container') || document.querySelector('#registerForm');
    
    if (form) {
        // Buscar si ya existe un mensaje y reemplazarlo
        const existingMessage = form.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Agregar el mensaje al principio del formulario
        form.insertBefore(messageContainer, form.firstChild);
    } else {
        // Si no hay formulario, agregar al body
        document.body.appendChild(messageContainer);
    }
    
    // No remover el mensaje en caso de error para que el usuario pueda leerlo
    if (type !== 'error') {
        setTimeout(() => {
            messageContainer.remove();
        }, 3000);
    }
}

// Registrar nuevo usuario
async function register(userData) {
    try {
        const db = new Database();
        await db.initDatabase();

        // Validar datos
        if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword || !userData.role) {
            showMessage('Todos los campos son obligatorios', 'error', 'red');
            return;
        }
        
        if (userData.password.length < 8) {
            showMessage('La contraseña debe tener mínimo 8 caracteres', 'error', 'red');
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error', 'red');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            showMessage('Email no válido', 'error', 'red');
            return;
        }

        // Verificar si el email ya existe en la base de datos
        const emailExists = await db.checkEmailExists(userData.email);
        if (emailExists) {
            showMessage('El email ya está registrado', 'error', 'red');
            return;
        }
        
        // Crear nuevo usuario con el rol seleccionado
        const newUser = {
            name: userData.name,
            email: userData.email,
            password: userData.password, // En producción usar hash
            role: userData.role,
            createdAt: new Date().toISOString()
        };
        
        // Guardar usuario en la base de datos
        const createdUser = await db.createUser(newUser);
        
        if (createdUser) {
            showMessage('Registro exitoso, puedes iniciar sesión', 'success', 'green');
            
            // Redirigir a login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage('Error al crear el usuario', 'error', 'red');
        }
    } catch (error) {
        console.error('Error detallado durante el registro:', error);
        showMessage(`Error al registrar usuario: ${error.message}`, 'error', 'red');
    }
}

/**
 * Funciones de autenticación y gestión de sesiones
 */

// Verificar si hay una sesión activa
function checkSession() {
    // Intentar obtener usuario de sessionStorage primero, luego de localStorage
    const userDataStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    
    if (userDataStr) {
        try {
            const userData = JSON.parse(userDataStr);
            
            // Actualizar elementos de navegación
            updateNavigation(userData);
            
            return userData;
        } catch (error) {
            console.error('Error al parsear datos de usuario:', error);
            // Limpiar datos corruptos
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
        }
    }
    
    return null;
}

// Actualizar elementos de navegación según el usuario
function updateNavigation(userData) {
    // Ocultar enlaces de login/registro
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    
    // Mostrar enlaces según el rol
    const adminLink = document.getElementById('adminLink');
    const viewerLink = document.getElementById('viewerLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNavName = document.getElementById('userNavName');
    
    if (loginLink) loginLink.parentElement.classList.add('hidden');
    if (registerLink) registerLink.parentElement.classList.add('hidden');
    
    if (adminLink) adminLink.classList.remove('hidden');
    if (viewerLink) viewerLink.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    
    // Mostrar nombre de usuario si existe el elemento
    if (userNavName) {
        userNavName.textContent = userData.nombre || userData.name || '';
    }
    
    // Configurar evento de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Cerrar sesión
function logout() {
    // Eliminar datos de sesión
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    
    // Redireccionar a la página de inicio
    window.location.href = 'index.html';
}

// Verificar si un email ya existe (para registro)
async function checkEmailExists(email) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('GestServDB', 1);
        
        request.onerror = function(event) {
            console.error('Error al abrir la base de datos:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['usuarios'], 'readonly');
            const objectStore = transaction.objectStore('usuarios');
            const emailIndex = objectStore.index('email');
            
            const checkRequest = emailIndex.get(email);
            
            checkRequest.onsuccess = function(event) {
                const result = event.target.result;
                resolve(!!result); // Convertir a booleano
            };
            
            checkRequest.onerror = function(event) {
                reject(event.target.error);
            };
        };
    });
}

// Verificar acceso según roles permitidos
function checkRoleAccess(allowedRoles) {
    const userData = checkSession();
    
    if (!userData) {
        // No hay sesión, redirigir a login
        window.location.href = 'login.html';
        return false;
    }
    
    const userRole = userData.rol || userData.role;
    
    if (!allowedRoles.includes(userRole)) {
        // Rol no permitido, redirigir a página apropiada
        if (userRole === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'viewer.html';
        }
        return false;
    }
    
    return true;
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
async function handleRegistration(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    
    try {
        if (!db.db) await db.initDatabase();
        
        // Verificación más robusta de email existente
        const exists = await db.checkEmailExists(email);
        if (exists) {
            showNotification('El correo ya está registrado', 'error');
            return;
        }
        
        async function register(email, password) {
            try {
                const db = new Database();
                
                // Verificación más robusta
                const emailExists = await db.checkEmailExists(email);
                if (emailExists) {
                    return { 
                        success: false, 
                        message: "El correo ya está registrado. ¿Olvidaste tu contraseña?" 
                    };
                }
                
                // Validación de contraseña mejorada
                if (password.length < 8) {
                    return { 
                        success: false, 
                        message: "La contraseña debe tener mínimo 8 caracteres" 
                    };
                }
                
                const newUser = { email, password, role: 'user' };
                await db.addUser(newUser);
                return { success: true, message: "Registro exitoso" };
                
            } catch (error) {
                // Capturar error de unique constraint
                if (error.message.includes('key already exists')) {
                    return { 
                        success: false, 
                        message: "Error: El correo ya está registrado en el sistema" 
                    };
                }
                return { 
                    success: false, 
                    message: "Error en el servidor. Intenta nuevamente" 
                };
            }
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showNotification(error.message.includes('UNIQUE') 
            ? 'El correo ya está registrado' 
            : 'Error en el registro', 'error');
    }
}
async function handleLogin(event) {
    event.preventDefault();
    
    try {
        if (!db.db) {
            await db.initDatabase();
        }
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = await db.verifyCredentials(email, password);
        if (!user) {
            showNotification('Credenciales inválidas', 'error');
            return;
        }
        
        // Crear sesión en la base de datos
        const session = await db.createSession(user.id);
        
        // Registrar actividad
        await db.logActivity(user.id, 'login', {
            timestamp: new Date().toISOString(),
            device: navigator.userAgent
        });
        
        // Guardar sesión (omitir password)
        const { password: _, ...userSession } = user;
        sessionStorage.setItem('currentUser', JSON.stringify({
            ...userSession,
            sessionId: session.id
        }));
        
        // Mostrar mensaje de éxito
        showMessage('¡Inicio de sesión exitoso!', 'success', 'green');
        
        // Redirigir según rol después de mostrar el mensaje
        setTimeout(() => {
            window.location.href = user.role === 'admin' ? 'admin.html' : 'viewer.html';
        }, 1500);
    } catch (error) {
        console.error('Error en login:', error);
        showNotification('Error al conectar con la base de datos', 'error');
    }
}

async function checkEmailExists(email) {
    try {
        const db = new Database();
        await db.initDatabase();  
        const user = await db.getUserByEmail(email);
        return !!user;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

