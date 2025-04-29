/**
 * Módulo de administración para gestión de usuarios y servicios
 */
// Verificar acceso al cargar página
document.addEventListener('DOMContentLoaded', () => {
    // Solo permitir acceso a administradores
    if (!checkRoleAccess(['admin'])) {
        return;
    }
    
    // Inicializar interfaz
    initAdminInterface();
    
    // Toggle menú móvil
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('#main-nav').classList.toggle('active');
    });
});

// Inicializar la interfaz de administración
function initAdminInterface() {
    // Cargar datos de usuarios y servicios
    loadUsers();
    loadServices();
    
    // Configurar manejadores de eventos para formularios
    setupUserForm();
    setupServiceForm();
    
    // Configurar tabs
    setupTabs();
}

// Configurar sistema de pestañas
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Desactivar todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Activar el tab seleccionado
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}

// Cargar y mostrar usuarios en la tabla
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    const users = await db.performTransaction('users', 'readonly', store => store.getAll());
    users.forEach(user => {
        // Renderiza cada usuario como lo hacías antes
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${user.id}">Editar</button>
                <button class="action-btn delete-btn" data-id="${user.id}">Eliminar</button>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
    
    // Agregar event listeners para los botones de acción
    setupUserActionButtons();
}

// Configurar los botones de acción para usuarios
function setupUserActionButtons() {
    // Botones de edición
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.getAttribute('data-id');
            editUser(userId);
        });
    });
    
    // Botones de eliminación
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.getAttribute('data-id');
            deleteUser(userId);
        });
    });
}

// Editar usuario
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    // Rellenar formulario con datos del usuario
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    
    // Cambiar texto del botón
    document.getElementById('userFormBtn').textContent = 'Actualizar Usuario';
    
    // Mostrar tab de formulario
    document.querySelector('[data-tab="userFormTab"]').click();
}

// Eliminar usuario
function deleteUser(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(user => user.id !== userId);
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Recargar la tabla
    loadUsers();
    
    showMessage('Usuario eliminado correctamente', 'success');
}

// Configurar formulario de usuarios
function setupUserForm() {
    const userForm = document.getElementById('userForm');
    
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value
        };
        
        if (validateUserForm(userData)) {
            if (userId) {
                updateUser(userId, userData);
            } else {
                createUser(userData);
            }
            
            userForm.reset();
            document.getElementById('userId').value = '';
            document.getElementById('userFormBtn').textContent = 'Crear Usuario';
            
            // Volver a la lista de usuarios
            document.querySelector('[data-tab="usersTab"]').click();
        }
    });
}

// Validar formulario de usuario
function validateUserForm(userData) {
    // Validar campos vacíos
    if (!userData.name || !userData.email || !userData.role) {
        showMessage('Todos los campos son obligatorios', 'error');
        return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        showMessage('Email no válido', 'error');
        return false;
    }
    
    return true;
}

// Crear nuevo usuario
function createUser(userData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verificar que email no exista
    if (users.some(user => user.email === userData.email)) {
        showMessage('El email ya está registrado', 'error');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: generateId(),
        ...userData,
        password: 'default123', // Password por defecto
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Recargar la tabla
    loadUsers();
    
    showMessage('Usuario creado correctamente', 'success');
}

// Actualizar usuario existente
function updateUser(userId, userData) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verificar que el email no esté en uso por otro usuario
    if (users.some(user => user.email === userData.email && user.id !== userId)) {
        showMessage('El email ya está en uso por otro usuario', 'error');
        return;
    }
    
    // Actualizar usuario
    users = users.map(user => {
        if (user.id === userId) {
            return {
                ...user,
                name: userData.name,
                email: userData.email,
                role: userData.role
            };
        }
        return user;
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Recargar la tabla
    loadUsers();
    
    showMessage('Usuario actualizado correctamente', 'success');
}

// Cargar y mostrar servicios en la tabla
async function loadServices() {
    const servicesList = document.getElementById('servicesList');
    servicesList.innerHTML = '';
    const services = await db.getServices();
    services.forEach(service => {
        // Renderiza cada servicio como lo hacías antes
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${service.name}</td>
            <td>${service.description}</td>
            <td>${service.price} €</td>
            <td>${service.status ? 'Activo' : 'Inactivo'}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${service.id}">Editar</button>
                <button class="action-btn delete-btn" data-id="${service.id}">Eliminar</button>
            </td>
        `;
        
        servicesTableBody.appendChild(row);
    });
    
    // Agregar event listeners para los botones de acción
    setupServiceActionButtons();
}

// Configurar los botones de acción para servicios
function setupServiceActionButtons() {
    // Botones de edición
    document.querySelectorAll('#servicesTableBody .edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const serviceId = e.target.getAttribute('data-id');
            editService(serviceId);
        });
    });
    
    // Botones de eliminación
    document.querySelectorAll('#servicesTableBody .delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const serviceId = e.target.getAttribute('data-id');
            deleteService(serviceId);
        });
    });
}

// Editar servicio
function editService(serviceId) {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const service = services.find(s => s.id === serviceId);
    
    if (!service) return;
    
    // Rellenar formulario con datos del servicio
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceDescription').value = service.description;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceStatus').checked = service.status;
    
    // Cambiar texto del botón
    document.getElementById('serviceFormBtn').textContent = 'Actualizar Servicio';
    
    // Mostrar tab de formulario
    document.querySelector('[data-tab="serviceFormTab"]').click();
}

// Eliminar servicio
async function deleteService(serviceId) {
    await db.performTransaction('services', 'readwrite', store => store.delete(serviceId));
    await loadServices();
}

// Configurar formulario de servicios
function setupServiceForm() {
    const serviceForm = document.getElementById('serviceForm');
    
    serviceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const serviceId = document.getElementById('serviceId').value;
        const serviceData = {
            name: document.getElementById('serviceName').value,
            description: document.getElementById('serviceDescription').value,
            price: parseFloat(document.getElementById('servicePrice').value),
            status: document.getElementById('serviceStatus').checked
        };
        
        if (validateServiceForm(serviceData)) {
            if (serviceId) {
                updateService(serviceId, serviceData);
            } else {
                createService(serviceData);
            }
            
            serviceForm.reset();
            document.getElementById('serviceId').value = '';
            document.getElementById('serviceFormBtn').textContent = 'Crear Servicio';
            
            // Volver a la lista de servicios
            document.querySelector('[data-tab="servicesTab"]').click();
        }
    });
}

// Validar formulario de servicio
function validateServiceForm(serviceData) {
    // Validar campos vacíos
    if (!serviceData.name || !serviceData.description) {
        showMessage('Nombre y descripción son obligatorios', 'error');
        return false;
    }
    
    // Validar que el precio sea un número positivo
    if (isNaN(serviceData.price) || serviceData.price < 0) {
        showMessage('El precio debe ser un número positivo', 'error');
        return false;
    }
    
    return true;
}

// Crear nuevo servicio
function createService(serviceData) {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    
    // Crear nuevo servicio
    const newService = {
        id: generateId(),
        ...serviceData,
        createdAt: new Date().toISOString()
    };
    
    services.push(newService);
    localStorage.setItem('services', JSON.stringify(services));
    
    // Recargar la tabla
    loadServices();
    
    showMessage('Servicio creado correctamente', 'success');
}

// Actualizar servicio existente
function updateService(serviceId, serviceData) {
    let services = JSON.parse(localStorage.getItem('services')) || [];
    
    // Actualizar servicio
    services = services.map(service => {
        if (service.id === serviceId) {
            return {
                ...service,
                name: serviceData.name,
                description: serviceData.description,
                price: serviceData.price,
                status: serviceData.status
            };
        }
        return service;
    });
    
    localStorage.setItem('services', JSON.stringify(services));
    
    // Recargar la tabla
    loadServices();
    
    showMessage('Servicio actualizado correctamente', 'success');
}

async function addService(serviceData) {
    await db.addService(serviceData);
    await loadServices();
}

// Funciones de utilidad

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Verificar acceso por rol
function checkRoleAccess(allowedRoles) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!user) {
        // No hay usuario logueado, redirigir a login
        window.location.href = 'login.html';
        return false;
    }
    
    if (!allowedRoles.includes(user.role)) {
        // Usuario no tiene permiso, redirigir a página apropiada
        window.location.href = user.role === 'viewer' ? 'viewer.html' : 'index.html';
        showMessage('No tienes permiso para acceder a esta página', 'error');
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

async function addService(serviceData) {
    await db.addService(serviceData);
    await loadServices();
}

async function loadRequests() {
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = '';
    const requests = await db.getRequests();
    
    // Crear tabla si no existe
    if (!requestsList.querySelector('table')) {
        requestsList.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Servicio</th>
                        <th>Usuario</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="requestsTableBody"></tbody>
            </table>
        `;
    }
    
    const requestsTableBody = document.getElementById('requestsTableBody');
    requestsTableBody.innerHTML = '';
    
    requests.forEach(request => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${request.title}</td>
            <td>${request.serviceName}</td>
            <td>${request.userName || 'Usuario #' + request.userId}</td>
            <td>${request.date}</td>
            <td>${request.status === 'pending' ? 'Pendiente' : 'Completada'}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${request.id}">Editar</button>
                <button class="action-btn delete-btn" data-id="${request.id}">Eliminar</button>
            </td>
        `;
        
        requestsTableBody.appendChild(row);
    });
}