// Datos mock para demostración
const mockUser = {
    id: 1,
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    phone: "+34 623 456 789",
    address: "Calle Principal 123, Madrid",
    avatar: "/api/placeholder/150/150",
    role: "Usuario",
    stats: {
        totalRequests: 8,
        pendingRequests: 3,
        completedRequests: 5
    }
};

const mockServices = [
    {
        id: 1,
        title: "Soporte Técnico",
        description: "Servicio de asistencia técnica para equipos informáticos.",
        category: "Informática",
        image: "/api/placeholder/300/200"
    },
    {
        id: 2,
        title: "Mantenimiento de Red",
        description: "Revisión y mantenimiento de infraestructura de red.",
        category: "Redes",
        image: "/api/placeholder/300/200"
    },
    {
        id: 3,
        title: "Desarrollo Web",
        description: "Desarrollo de sitios web personalizados para empresas.",
        category: "Desarrollo",
        image: "/api/placeholder/300/200"
    },
    {
        id: 4,
        title: "Seguridad Informática",
        description: "Auditorías y soluciones de seguridad para su empresa.",
        category: "Seguridad",
        image: "/api/placeholder/300/200"
    }
];

let mockRequests = [
    {
        id: 1,
        title: "Reparación de PC",
        serviceId: 1,
        serviceName: "Soporte Técnico",
        description: "Mi computadora está fallando al iniciar y emite pitidos extraños.",
        date: "2025-04-20",
        createdAt: "2025-04-10",
        status: "pending",
        priority: "alta"
    },
    {
        id: 2,
        title: "Instalación de servidor",
        serviceId: 2,
        serviceName: "Mantenimiento de Red",
        description: "Necesitamos instalar un nuevo servidor para nuestra oficina.",
        date: "2025-05-01",
        createdAt: "2025-04-05",
        status: "approved",
        priority: "media"
    },
    {
        id: 3,
        title: "Desarrollo de landing page",
        serviceId: 3,
        serviceName: "Desarrollo Web",
        description: "Necesitamos una página web para nuestra nueva campaña.",
        date: "2025-04-25",
        createdAt: "2025-03-30",
        status: "completed",
        priority: "baja"
    }
];

// Elementos DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar interfaz
    initUI();
    
    // Manejar navegación de pestañas
    initTabNavigation();
    
    // Cargar datos iniciales
    loadUserData();
    loadServices();
    loadRequests();
    
    // Inicializar menú de usuario
    initUserMenu();
    
    // Inicializar modal de solicitudes
    initRequestModal();
    
    // Inicializar filtros
    initFilters();
});

// Iniciar elementos UI básicos
function initUI() {
    // Manejar menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Inicializar fecha mínima para solicitudes
    const dateInput = document.getElementById('requestDate');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        dateInput.min = formattedDate;
        dateInput.value = formattedDate;
    }
}

// Manejar navegación entre pestañas
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Desactivar todos los botones y contenidos
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Activar el botón y contenido seleccionado
            this.classList.add('active');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}

// Cargar datos del usuario
function loadUserData() {
    // Mostrar nombre de usuario en la navegación
    const userNavName = document.getElementById('userNavName');
    if (userNavName) {
        userNavName.textContent = mockUser.name;
    }
    
    // Cargar datos del perfil completo en su pestaña
    renderUserProfile();
}

// Mostrar perfil de usuario
function renderUserProfile() {
    const userProfile = document.getElementById('userProfile');
    
    if (!userProfile) return;
    
    userProfile.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="${mockUser.avatar}" alt="${mockUser.name}">
            </div>
            <div class="profile-info">
                <h2>${mockUser.name}</h2>
                <p>${mockUser.email}</p>
                <p><i class="fas fa-phone"></i> ${mockUser.phone}</p>
            </div>
        </div>
        
        <div class="profile-stats">
            <div class="stat-card">
                <div class="stat-value">${mockUser.stats.totalRequests}</div>
                <div class="stat-label">Total Solicitudes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockUser.stats.pendingRequests}</div>
                <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockUser.stats.completedRequests}</div>
                <div class="stat-label">Completadas</div>
            </div>
        </div>
        
        <div class="profile-section">
            <h3>Información Personal</h3>
            <div class="profile-form">
                <div class="form-group">
                    <label for="profileName">Nombre Completo</label>
                    <input type="text" id="profileName" value="${mockUser.name}" disabled>
                </div>
                <div class="form-group">
                    <label for="profileEmail">Correo Electrónico</label>
                    <input type="email" id="profileEmail" value="${mockUser.email}" disabled>
                </div>
                <div class="form-group">
                    <label for="profilePhone">Teléfono</label>
                    <input type="tel" id="profilePhone" value="${mockUser.phone}" disabled>
                </div>
                <div class="form-group">
                    <label for="profileAddress">Dirección</label>
                    <input type="text" id="profileAddress" value="${mockUser.address}" disabled>
                </div>
                <div class="form-actions">
                    <button id="editProfileButton" class="button primary-button">Editar Perfil</button>
                </div>
            </div>
        </div>
    `;
    
    // Añadir evento al botón de editar perfil
    const editProfileButton = document.getElementById('editProfileButton');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', function() {
            const inputs = userProfile.querySelectorAll('input[disabled]');
            inputs.forEach(input => {
                input.disabled = false;
            });
            
            // Cambiar botón a Guardar
            this.textContent = 'Guardar Cambios';
            this.removeEventListener('click', arguments.callee);
            
            // Añadir evento para guardar
            this.addEventListener('click', function() {
                // Aquí se implementaría la lógica para guardar los cambios
                const inputs = userProfile.querySelectorAll('input:not([disabled])');
                inputs.forEach(input => {
                    // Actualizar datos mock
                    mockUser[input.id.replace('profile', '').toLowerCase()] = input.value;
                    input.disabled = true;
                });
                
                // Restaurar botón
                this.textContent = 'Editar Perfil';
                this.addEventListener('click', arguments.callee);
                
                // Actualizar nombre en la barra de navegación
                const userNavName = document.getElementById('userNavName');
                if (userNavName) {
                    userNavName.textContent = mockUser.name;
                }
                
                // Mostrar mensaje de éxito
                showNotification('Perfil actualizado correctamente', 'success');
            });
        });
    }
}

// Cargar lista de servicios
function loadServices() {
    const servicesList = document.getElementById('servicesList');
    
    if (!servicesList) return;
    
    // Limpiar contenedor
    servicesList.innerHTML = '';
    
    if (mockServices.length === 0) {
        servicesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tools"></i>
                <h3>No hay servicios disponibles en este momento</h3>
                <p>Pronto añadiremos nuevos servicios para ti</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada servicio
    mockServices.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <div class="service-image">
                <img src="${service.image}" alt="${service.title}">
            </div>
            <div class="service-content">
                <span class="category">${service.category}</span>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <div class="service-actions">
                    <button class="button primary-button request-service-btn" data-service-id="${service.id}">Solicitar</button>
                </div>
            </div>
        `;
        
        servicesList.appendChild(serviceCard);
    });
    
    // Añadir eventos a los botones de solicitar
    document.querySelectorAll('.request-service-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = parseInt(this.getAttribute('data-service-id'));
            openRequestModal(serviceId);
        });
    });
}

// Cargar solicitudes
function loadRequests(filter = 'all', dateFilter = 'all') {
    const requestsList = document.getElementById('requestsList');
    
    if (!requestsList) return;
    
    // Limpiar contenedor
    requestsList.innerHTML = '';
    
    // Filtrar solicitudes
    let filteredRequests = [...mockRequests];
    
    if (filter !== 'all') {
        filteredRequests = filteredRequests.filter(request => request.status === filter);
    }
    
    // Filtrar por fecha
    if (dateFilter !== 'all') {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        switch(dateFilter) {
            case 'today':
                filteredRequests = filteredRequests.filter(request => {
                    return request.createdAt === todayStr;
                });
                break;
            case 'week':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(today.getDate() - 7);
                filteredRequests = filteredRequests.filter(request => {
                    const requestDate = new Date(request.createdAt);
                    return requestDate >= oneWeekAgo;
                });
                break;
            case 'month':
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(today.getMonth() - 1);
                filteredRequests = filteredRequests.filter(request => {
                    const requestDate = new Date(request.createdAt);
                    return requestDate >= oneMonthAgo;
                });
                break;
        }
    }
    
    if (filteredRequests.length === 0) {
        requestsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No hay solicitudes que mostrar</h3>
                <p>Crea una nueva solicitud para comenzar</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada solicitud
    filteredRequests.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        
        // Definir color lateral según estado
        if (request.status === 'pending') {
            requestCard.style.borderLeftColor = 'var(--warning-color)';
        } else if (request.status === 'approved') {
            requestCard.style.borderLeftColor = 'var(--success-color)';
        } else if (request.status === 'rejected') {
            requestCard.style.borderLeftColor = 'var(--danger-color)';
        } else if (request.status === 'completed') {
            requestCard.style.borderLeftColor = 'var(--primary-color)';
        }
        
        // Traducir estados para mostrar
        const statusTexts = {
            'pending': 'Pendiente',
            'approved': 'Aprobada',
            'rejected': 'Rechazada',
            'completed': 'Completada'
        };
        
        const statusClasses = {
            'pending': 'status-pending',
            'approved': 'status-approved',
            'rejected': 'status-rejected',
            'completed': 'status-approved'
        };
        
        // Traducir prioridades
        const priorityTexts = {
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta'
        };
        
        // Formatear fechas
        const formattedCreatedDate = formatDate(request.createdAt);
        const formattedDate = formatDate(request.date);
        
        requestCard.innerHTML = `
            <div class="request-header">
                <h3 class="request-title">${request.title}</h3>
                <span class="request-status ${statusClasses[request.status]}">${statusTexts[request.status]}</span>
            </div>
            <div class="request-details">
                <div class="request-detail">
                    <span class="detail-label">Servicio</span>
                    <span class="detail-value">${request.serviceName}</span>
                </div>
                <div class="request-detail">
                    <span class="detail-label">Fecha Creación</span>
                    <span class="detail-value">${formattedCreatedDate}</span>
                </div>
                <div class="request-detail">
                    <span class="detail-label">Fecha Solicitada</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="request-detail">
                    <span class="detail-label">Prioridad</span>
                    <span class="detail-value">${priorityTexts[request.priority]}</span>
                </div>
            </div>
            <div class="request-description">
                ${request.description}
            </div>
            <div class="request-footer">
                ${request.status === 'pending' ? 
                    `<button class="button secondary-button cancel-request-btn" data-request-id="${request.id}">Cancelar</button>` : ''}
                <button class="button primary-button view-request-btn" data-request-id="${request.id}">Ver Detalles</button>
            </div>
        `;
        
        requestsList.appendChild(requestCard);
    });
    
    // Añadir eventos a los botones de cancelar solicitud
    document.querySelectorAll('.cancel-request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = parseInt(this.getAttribute('data-request-id'));
            cancelRequest(requestId);
        });
    });
    
    // Añadir eventos a los botones de ver detalles
    document.querySelectorAll('.view-request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = parseInt(this.getAttribute('data-request-id'));
            viewRequestDetails(requestId);
        });
    });
}

// Inicializar filtros de solicitudes
function initFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            loadRequests(this.value, dateFilter.value);
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            loadRequests(statusFilter.value, this.value);
        });
    }
}

// Inicializar menú de usuario
function initUserMenu() {
    const userNavLink = document.getElementById('userNavLink');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    const viewProfileLink = document.getElementById('viewProfileLink');
    const editProfileLink = document.getElementById('editProfileLink');
    const logoutLink = document.getElementById('logoutLink');
    
    // Mostrar/ocultar menú desplegable
    if (userNavLink && userMenuDropdown) {
        userNavLink.addEventListener('click', function(e) {
            e.preventDefault();
            userMenuDropdown.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!userNavLink.contains(e.target) && !userMenuDropdown.contains(e.target)) {
                userMenuDropdown.classList.remove('active');
            }
        });
    }
    
    // Enlace para ver perfil
    if (viewProfileLink) {
        viewProfileLink.addEventListener('click', function(e) {
            e.preventDefault();
            userMenuDropdown.classList.remove('active');
            // Cambiar a pestaña de perfil
            document.querySelector('.tab-btn[data-tab="profileTab"]').click();
        });
    }
    
    // Enlace para editar perfil
    if (editProfileLink) {
        editProfileLink.addEventListener('click', function(e) {
            e.preventDefault();
            userMenuDropdown.classList.remove('active');
            // Cambiar a pestaña de perfil y activar edición
            document.querySelector('.tab-btn[data-tab="profileTab"]').click();
            setTimeout(() => {
                const editProfileButton = document.getElementById('editProfileButton');
                if (editProfileButton) {
                    editProfileButton.click();
                }
            }, 100);
        });
    }
    
    // Enlace para cerrar sesión
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Aquí iría la lógica de cierre de sesión
            // Simulamos redireccionamiento
            alert('Sesión cerrada. Redirigiendo al inicio...');
            // window.location.href = 'index.html';
        });
    }
}

// Inicializar modal de solicitudes
function initRequestModal() {
    const requestModal = document.getElementById('requestModal');
    const newRequestBtn = document.getElementById('newRequestBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelRequest = document.getElementById('cancelRequest');
    const submitRequest = document.getElementById('submitRequest');
    const serviceSelect = document.getElementById('serviceSelect');
    
    // Cargar opciones de servicios en el select
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Selecciona un servicio</option>';
        mockServices.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.title;
            serviceSelect.appendChild(option);
        });
    }
    
    // Abrir modal con botón de nueva solicitud
    if (newRequestBtn && requestModal) {
        newRequestBtn.addEventListener('click', function() {
            openRequestModal();
        });
    }
    
    // Cerrar modal
    if (closeModal && requestModal) {
        closeModal.addEventListener('click', function() {
            closeRequestModal();
        });
    }
    
    // Cerrar modal con botón cancelar
    if (cancelRequest && requestModal) {
        cancelRequest.addEventListener('click', function() {
            closeRequestModal();
        });
    }
    
    // Enviar formulario de solicitud
    if (submitRequest && requestModal) {
        submitRequest.addEventListener('click', function() {
            const form = document.getElementById('requestForm');
            
            // Validar formulario
            const serviceSelect = document.getElementById('serviceSelect');
            const requestTitle = document.getElementById('requestTitle');
            const requestDescription = document.getElementById('requestDescription');
            const requestDate = document.getElementById('requestDate');
            const requestPriority = document.getElementById('requestPriority');
            
            if (!serviceSelect.value || !requestTitle.value || !requestDescription.value || !requestDate.value) {
                showNotification('Por favor, completa todos los campos obligatorios', 'error');
                return;
            }
            
            // Crear nueva solicitud
            const newRequest = {
                id: mockRequests.length + 1,
                title: requestTitle.value,
                serviceId: parseInt(serviceSelect.value),
                serviceName: serviceSelect.options[serviceSelect.selectedIndex].text,
                description: requestDescription.value,
                date: requestDate.value,
                createdAt: new Date().toISOString().split('T')[0],
                status: 'pending',
                priority: requestPriority.value
            };
            
            // Añadir a la lista de solicitudes
            mockRequests.push(newRequest);
            
            // Actualizar estadísticas
            mockUser.stats.totalRequests++;
            mockUser.stats.pendingRequests++;
            
            // Recargar listas
            loadRequests();
            renderUserProfile();
            
            // Cerrar modal y mostrar mensaje
            closeRequestModal();
            showNotification('Solicitud enviada correctamente', 'success');
            
            // Cambiar a pestaña de solicitudes
            document.querySelector('.tab-btn[data-tab="requestsTab"]').click();
        });
    }
}

// Abrir modal de solicitud
function openRequestModal(serviceId = null) {
    const requestModal = document.getElementById('requestModal');
    const serviceSelect = document.getElementById('serviceSelect');
    
    if (requestModal) {
        // Resetear formulario
        document.getElementById('requestForm').reset();
        
        // Si se proporciona un ID de servicio, seleccionarlo
        if (serviceId && serviceSelect) {
            serviceSelect.value = serviceId;
        }
        
        // Establecer fecha mínima
        const dateInput = document.getElementById('requestDate');
        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const formattedDate = tomorrow.toISOString().split('T')[0];
            dateInput.min = formattedDate;
            dateInput.value = formattedDate;
        }
        
        // Mostrar modal
        requestModal.classList.add('active');
    }
}

// Cerrar modal de solicitud
function closeRequestModal() {
    const requestModal = document.getElementById('requestModal');
    
    if (requestModal) {
        requestModal.classList.remove('active');
    }
}

// Cancelar solicitud
function cancelRequest(requestId) {
    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
        // Buscar índice de la solicitud
        const index = mockRequests.findIndex(request => request.id === requestId);
        
        if (index !== -1) {
            // Actualizar estado o eliminar
            mockRequests[index].status = 'rejected';
            
            // Actualizar estadísticas
            mockUser.stats.pendingRequests--;
            
            // Recargar listas
            loadRequests();
            renderUserProfile();
            
            // Mostrar mensaje
            showNotification('Solicitud cancelada correctamente', 'success');
        }
    }
}

// Ver detalles de solicitud (simulado)
function viewRequestDetails(requestId) {
    // Encontrar solicitud
    const request = mockRequests.find(req => req.id === requestId);
    
    if (request) {
        alert(`Detalles de la solicitud "${request.title}":\n- Servicio: ${request.serviceName}\n- Estado: ${request.status}\n- Fecha: ${request.date}`);
    }
}

// Utilitario para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Añadir estilos inline
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 
                                        type === 'error' ? 'var(--danger-color)' : 
                                        'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.boxShadow = 'var(--shadow)';
    notification.style.zIndex = '1000';
    notification.style.minWidth = '300px';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'all 0.3s ease';
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Configurar cierre automático
    const autoCloseTimeout = setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Configurar cierre manual
    const closeButton = notification.querySelector('.close-notification');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            clearTimeout(autoCloseTimeout);
            closeNotification(notification);
        });
    }
}

// Cerrar notificación
function closeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Sistema de persistencia de datos con archivos JSON
const APP_STORAGE_KEY = 'serviceRequestAppData';
const JSON_FILENAME = 'app_data.json';

// Comprobar si el archivo JSON existe o crear uno por defecto
async function checkOrCreateJSONFile() {
    try {
        // Intentar cargar el archivo JSON
        const response = await fetch(JSON_FILENAME);
        
        if (!response.ok) {
            // Si el archivo no existe, crear uno nuevo con datos predeterminados
            await saveDataToJSON();
            console.log('Archivo JSON creado con datos predeterminados');
            return { user: mockUser, requests: mockRequests, services: mockServices };
        }
        
        // Si existe, cargar los datos
        const data = await response.json();
        console.log('Datos cargados desde archivo JSON:', data);
        return data;
        
    } catch (error) {
        console.error('Error al comprobar/crear archivo JSON:', error);
        // En caso de error, intentar usar localStorage como respaldo
        const localData = loadFromLocalStorage();
        await saveDataToJSON(localData);
        return localData;
    }
}

// Cargar datos desde localStorage (respaldo)
function loadFromLocalStorage() {
    const storedData = localStorage.getItem(APP_STORAGE_KEY);
    
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (error) {
            console.error('Error al parsear datos de localStorage:', error);
            return { user: mockUser, requests: mockRequests, services: mockServices };
        }
    } else {
        return { user: mockUser, requests: mockRequests, services: mockServices };
    }
}

// Guardar datos en localStorage (respaldo)
function saveToLocalStorage(data) {
    try {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

// Guardar datos en archivo JSON
async function saveDataToJSON(customData = null) {
    // Datos a guardar
    const dataToSave = customData || {
        user: mockUser,
        requests: mockRequests,
        services: mockServices,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // Convertir a blob JSON
        const jsonBlob = new Blob([JSON.stringify(dataToSave, null, 2)], {type: 'application/json'});
        
        // Crear URL del blob
        const blobUrl = URL.createObjectURL(jsonBlob);
        
        // Crear link para descargar el archivo
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = JSON_FILENAME;
        
        // Añadir al DOM, hacer clic y eliminar
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Liberar la URL del blob
        URL.revokeObjectURL(blobUrl);
        
        // Guardar también en localStorage como respaldo
        saveToLocalStorage(dataToSave);
        
        console.log('Archivo JSON guardado y descargado');
        return true;
    } catch (error) {
        console.error('Error al guardar archivo JSON:', error);
        
        // Intentar guardar en localStorage como respaldo
        saveToLocalStorage(dataToSave);
        
        showNotification('Error al guardar archivo JSON. Se guardó en localStorage como respaldo.', 'warning');
        return false;
    }
}

// Cargar datos desde JSON o localStorage
async function loadAppData() {
    try {
        // Primero intentar cargar desde archivo JSON
        const data = await checkOrCreateJSONFile();
        
        // Actualizar datos de la aplicación
        if (data.user) mockUser = data.user;
        if (data.requests) mockRequests = data.requests;
        if (data.services) mockServices = data.services;
        
        return data;
    } catch (error) {
        console.error('Error al cargar datos:', error);
        
        // Intentar cargar desde localStorage como respaldo
        const localData = loadFromLocalStorage();
        
        // Actualizar datos de la aplicación
        if (localData.user) mockUser = localData.user;
        if (localData.requests) mockRequests = localData.requests;
        if (localData.services) mockServices = localData.services;
        
        return localData;
    }
}

// Función para actualizar perfil de usuario
async function updateUserProfile(updatedUserData) {
    // Actualizar datos del usuario
    Object.assign(mockUser, updatedUserData);
    
    // Guardar en JSON y localStorage
    await saveDataToJSON();
    
    // Actualizar UI
    renderUserProfile();
    
    // Actualizar nombre en la barra de navegación
    const userNavName = document.getElementById('userNavName');
    if (userNavName) {
        userNavName.textContent = mockUser.name;
    }
}

// Función para añadir una nueva solicitud
async function addNewRequest(newRequest) {
    // Añadir a la lista de solicitudes
    mockRequests.push(newRequest);
    
    // Actualizar estadísticas
    mockUser.stats.totalRequests++;
    mockUser.stats.pendingRequests++;
    
    // Guardar en JSON y localStorage
    await saveDataToJSON();
    
    // Recargar listas
    loadRequests();
    renderUserProfile();
}

// Función para actualizar estado de una solicitud
async function updateRequestStatus(requestId, newStatus) {
    // Buscar índice de la solicitud
    const index = mockRequests.findIndex(request => request.id === requestId);
    
    if (index !== -1) {
        const oldStatus = mockRequests[index].status;
        
        // Actualizar estado
        mockRequests[index].status = newStatus;
        
        // Actualizar estadísticas
        if (oldStatus === 'pending' && newStatus !== 'pending') {
            mockUser.stats.pendingRequests--;
        }
        
        if (newStatus === 'completed') {
            mockUser.stats.completedRequests++;
        }
        
        // Guardar en JSON y localStorage
        await saveDataToJSON();
        
        return true;
    }
    
    return false;
}

// Función para reiniciar datos a valores predeterminados
async function resetToDefaultData() {
    if (confirm('¿Estás seguro de que deseas reiniciar todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem(APP_STORAGE_KEY);
        
        // Restaurar datos predeterminados
        mockUser = {
            id: 1,
            name: "Carlos Rodríguez",
            email: "carlos.rodriguez@ejemplo.com",
            phone: "+34 623 456 789",
            address: "Calle Principal 123, Madrid",
            avatar: "/api/placeholder/150/150",
            role: "Usuario",
            stats: {
                totalRequests: 8,
                pendingRequests: 3,
                completedRequests: 5
            }
        };
        
        mockRequests = [
            {
                id: 1,
                title: "Reparación de PC",
                serviceId: 1,
                serviceName: "Soporte Técnico",
                description: "Mi computadora está fallando al iniciar y emite pitidos extraños.",
                date: "2025-04-20",
                createdAt: "2025-04-10",
                status: "pending",
                priority: "alta"
            },
            {
                id: 2,
                title: "Instalación de servidor",
                serviceId: 2,
                serviceName: "Mantenimiento de Red",
                description: "Necesitamos instalar un nuevo servidor para nuestra oficina.",
                date: "2025-05-01",
                createdAt: "2025-04-05",
                status: "approved",
                priority: "media"
            },
            {
                id: 3,
                title: "Desarrollo de landing page",
                serviceId: 3,
                serviceName: "Desarrollo Web",
                description: "Necesitamos una página web para nuestra nueva campaña.",
                date: "2025-04-25",
                createdAt: "2025-03-30",
                status: "completed",
                priority: "baja"
            }
        ];
        
        // Guardar datos predeterminados
        await saveDataToJSON();
        
        // Recargar la página
        location.reload();
    }
}

// Añadir función para cargar datos desde archivo
function addImportDataButton() {
    const profileTab = document.getElementById('profileTab');
    
    if (profileTab) {
        const importContainer = document.createElement('div');
        importContainer.className = 'import-data-container';
        importContainer.innerHTML = `
            <div class="data-management-controls" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                <h3>Gestión de Datos</h3>
                
                <div class="import-export-controls" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <button id="exportDataButton" class="button secondary-button">
                        Exportar Datos (JSON)
                    </button>
                    
                    <div class="import-container" style="display: flex; flex-direction: column;">
                        <label for="importDataFile" class="button primary-button" style="text-align: center; cursor: pointer;">
                            Importar Datos (JSON)
                        </label>
                        <input type="file" id="importDataFile" accept=".json" style="display: none;">
                    </div>
                </div>
                
                <button id="resetDataButton" class="button danger-button">
                    Reiniciar Datos a Valores Predeterminados
                </button>
            </div>
        `;
        
        profileTab.appendChild(importContainer);
        
        // Evento para exportar datos
        document.getElementById('exportDataButton').addEventListener('click', () => saveDataToJSON());
        
        // Evento para importar datos
        document.getElementById('importDataFile').addEventListener('change', async function(e) {
            if (this.files && this.files[0]) {
                try {
                    const file = this.files[0];
                    const fileContent = await file.text();
                    const importedData = JSON.parse(fileContent);
                    
                    // Actualizar datos de la aplicación
                    if (importedData.user) mockUser = importedData.user;
                    if (importedData.requests) mockRequests = importedData.requests;
                    if (importedData.services) mockServices = importedData.services;
                    
                    // Guardar en localStorage como respaldo
                    saveToLocalStorage(importedData);
                    
                    // Recargar UI
                    loadUserData();
                    loadServices();
                    loadRequests();
                    
                    showNotification('Datos importados correctamente', 'success');
                } catch (error) {
                    console.error('Error al importar archivo JSON:', error);
                    showNotification('Error al importar archivo. Verifique el formato.', 'error');
                }
            }
        });
        
        // Añadir evento para reset
        document.getElementById('resetDataButton').addEventListener('click', resetToDefaultData);
    }
}

// Modificar la función que maneja la edición del perfil
async function handleProfileUpdate() {
    const inputs = document.querySelectorAll('#userProfile input:not([disabled])');
    const updatedUserData = {};
    
    inputs.forEach(input => {
        // Extraer el nombre del campo del ID
        const fieldName = input.id.replace('profile', '').charAt(0).toLowerCase() + 
                         input.id.replace('profile', '').slice(1);
        updatedUserData[fieldName] = input.value;
    });
    
    // Actualizar datos y guardar
    await updateUserProfile(updatedUserData);
    
    // Deshabilitar inputs
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    // Restaurar botón
    const editProfileButton = document.getElementById('editProfileButton');
    if (editProfileButton) {
        editProfileButton.textContent = 'Editar Perfil';
    }
    
    // Mostrar mensaje de éxito
    showNotification('Perfil actualizado correctamente', 'success');
}

// Modificar DOMContentLoaded para cargar datos desde JSON primero
document.addEventListener('DOMContentLoaded', async function() {
    // Mostrar indicador de carga
    showLoading('Cargando datos...');
    
    try {
        // Cargar datos desde JSON o localStorage
        await loadAppData();
        
        // Inicializar interfaz
        initUI();
        
        // Manejar navegación de pestañas
        initTabNavigation();
        
        // Cargar datos iniciales
        loadUserData();
        loadServices();
        loadRequests();
        
        // Inicializar menú de usuario
        initUserMenu();
        
        // Inicializar modal de solicitudes
        initRequestModal();
        
        // Inicializar filtros
        initFilters();
        
        // Añadir botones de gestión de datos
        addImportDataButton();
        
        // Ocultar indicador de carga
        hideLoading();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        hideLoading();
        showNotification('Error al cargar datos. Se han utilizado valores predeterminados.', 'error');
    }
});

// Mostrar indicador de carga
function showLoading(message = 'Cargando...') {
    // Crear el elemento de carga si no existe
    let loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '9999';
        
        loadingOverlay.innerHTML = `
            <div class="loading-container" style="text-align: center;">
                <div class="loading-spinner" style="border: 4px solid rgba(0, 0, 0, 0.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: var(--primary-color); animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 10px;">${message}</p>
            </div>
        `;
        
        // Añadir animación de giro
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(loadingOverlay);
    } else {
        loadingOverlay.querySelector('p').textContent = message;
        loadingOverlay.style.display = 'flex';
    }
}

// Ocultar indicador de carga
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Modificar renderUserProfile para usar la función de actualización
function renderUserProfile() {
    const userProfile = document.getElementById('userProfile');
    
    if (!userProfile) return;
    
    userProfile.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="${mockUser.avatar}" alt="${mockUser.name}">
            </div>
            <div class="profile-info">
                <h2>${mockUser.name}</h2>
                <p>${mockUser.email}</p>
                <p><i class="fas fa-phone"></i> ${mockUser.phone}</p>
            </div>
        </div>
        
        <div class="profile-stats">
            <div class="stat-card">
                <div class="stat-value">${mockUser.stats.totalRequests}</div>
                <div class="stat-label">Total Solicitudes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockUser.stats.pendingRequests}</div>
                <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockUser.stats.completedRequests}</div>
                <div class="stat-label">Completadas</div>
            </div>
        </div>
        
        <div class="profile-section">
            <h3>Información Personal</h3>
            <div class="profile-form">
                <div class="form-group">
                    <label for="profileName">Nombre Completo</label>
                    <input type="text" id="profileName" value="${mockUser.name}" disabled>
                </div>
                <div class="form-group">
                    <label for="profileEmail">Correo Electrónico</label>
                    <input type="email" id="profileEmail" value="${mockUser.email}" disabled>
                </div>
                <div class="form-group">
                    <label for="profilePhone">Teléfono</label>
                    <input type="tel" id="profilePhone" value="${mockUser.phone}" disabled>
                </div>
                <div class="form-group">
                    <label for="profileAddress">Dirección</label>
                    <input type="text" id="profileAddress" value="${mockUser.address}" disabled>
                </div>
                <div class="form-actions">
                    <button id="editProfileButton" class="button primary-button">Editar Perfil</button>
                </div>
            </div>
        </div>
    `;
    
    // Añadir evento al botón de editar perfil
    const editProfileButton = document.getElementById('editProfileButton');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', function() {
            const inputs = userProfile.querySelectorAll('input[disabled]');
            
            // Si ya están habilitados los campos, guardar los cambios
            if (this.textContent === 'Guardar Cambios') {
                handleProfileUpdate();
                return;
            }
            
            // Habilitar campos para edición
            inputs.forEach(input => {
                input.disabled = false;
            });
            
            // Cambiar botón a Guardar
            this.textContent = 'Guardar Cambios';
        });
    }
}

// Modificar la función submitRequest para usar addNewRequest
function initRequestModal() {
    const requestModal = document.getElementById('requestModal');
    const newRequestBtn = document.getElementById('newRequestBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelRequest = document.getElementById('cancelRequest');
    const submitRequest = document.getElementById('submitRequest');
    const serviceSelect = document.getElementById('serviceSelect');
    
    // Cargar opciones de servicios en el select
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Selecciona un servicio</option>';
        mockServices.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.title;
            serviceSelect.appendChild(option);
        });
    }
    
    // Abrir modal con botón de nueva solicitud
    if (newRequestBtn && requestModal) {
        newRequestBtn.addEventListener('click', function() {
            openRequestModal();
        });
    }
    
    // Cerrar modal
    if (closeModal && requestModal) {
        closeModal.addEventListener('click', function() {
            closeRequestModal();
        });
    }
    
    // Cerrar modal con botón cancelar
    if (cancelRequest && requestModal) {
        cancelRequest.addEventListener('click', function() {
            closeRequestModal();
        });
    }
    
    // Enviar formulario de solicitud
    if (submitRequest && requestModal) {
        submitRequest.addEventListener('click', async function() {
            const form = document.getElementById('requestForm');
            
            // Validar formulario
            const serviceSelect = document.getElementById('serviceSelect');
            const requestTitle = document.getElementById('requestTitle');
            const requestDescription = document.getElementById('requestDescription');
            const requestDate = document.getElementById('requestDate');
            const requestPriority = document.getElementById('requestPriority');
            
            if (!serviceSelect.value || !requestTitle.value || !requestDescription.value || !requestDate.value) {
                showNotification('Por favor, completa todos los campos obligatorios', 'error');
                return;
            }
            
            // Crear nueva solicitud
            const newRequest = {
                id: mockRequests.length > 0 ? Math.max(...mockRequests.map(r => r.id)) + 1 : 1,
                title: requestTitle.value,
                serviceId: parseInt(serviceSelect.value),
                serviceName: serviceSelect.options[serviceSelect.selectedIndex].text,
                description: requestDescription.value,
                date: requestDate.value,
                createdAt: new Date().toISOString().split('T')[0],
                status: 'pending',
                priority: requestPriority.value
            };
            
            // Añadir y guardar
            await addNewRequest(newRequest);
            
            // Cerrar modal y mostrar mensaje
            closeRequestModal();
            showNotification('Solicitud enviada correctamente', 'success');
            
            // Cambiar a pestaña de solicitudes
            document.querySelector('.tab-btn[data-tab="requestsTab"]').click();
        });
    }
}

// Modificar cancelRequest para usar updateRequestStatus
async function cancelRequest(requestId) {
    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
        // Actualizar estado a rechazado
        if (await updateRequestStatus(requestId, 'rejected')) {
            // Recargar listas
            loadRequests();
            renderUserProfile();
            
            // Mostrar mensaje
            showNotification('Solicitud cancelada correctamente', 'success');
        }
    }
}