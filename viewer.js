// Usar la clase Database global
let db;

// Elementos DOM
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar sessionStorage
    try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
    } catch (e) {
        showNotification('Error crítico: sessionStorage no está disponible', 'error');
        return;
    }

    try {
        // Crear instancia de Database
        db = new Database();
        
        // Inicializar base de datos primero
        await db.initDatabase().catch(error => {
            console.error('Error inicializando DB:', error);
            showNotification('Error crítico: No se pudo iniciar la base de datos', 'error');
            throw error; // Detener ejecución si falla la inicialización
        });
        
        // Verificar si hay un usuario con sesión activa
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (!currentUser) {
            // Si no hay usuario con sesión, redirigir al login
            window.location.href = 'login.html';
            return;
        }
        
        // Continuar con la inicialización
        await db.initDefaultServices();

        // Inicializar interfaz
        initUI();
        
        // Manejar navegación de pestañas
        initTabNavigation();
        
        // Cargar datos iniciales desde la base de datos
        await loadUserData();
        await loadServices();
        await loadRequests();
        
        // Inicializar menú de usuario
        initUserMenu();
        
        // Inicializar modal de solicitudes (asegúrate de que sea async si usa await internamente)
        await initRequestModal();
        
        // Inicializar filtros
        initFilters();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showNotification('Error al cargar la aplicación', 'error');
    }
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
async function loadUserData() {
    try {
        // Obtener usuario de sessionStorage
        const userDataStr = sessionStorage.getItem('currentUser');
        let user = userDataStr ? JSON.parse(userDataStr) : null;
        
        // Si no hay usuario en sessionStorage, intentar obtenerlo de la base de datos
        if (!user && db.getCurrentUser) {
            user = await db.getCurrentUser();
        }
        
        // Si aún no hay usuario, redirigir al login
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        // Actualizar nombre en la navegación
        const userNavName = document.getElementById('userNavName');
        if (userNavName) {
            userNavName.textContent = user.name || user.nombre || '';
        }
        
        // Cargar datos del perfil completo en su pestaña
        await renderUserProfile(user);
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        showNotification('Error al cargar datos del usuario', 'error');
    }
}

// Mostrar perfil de usuario
async function renderUserProfile(user) {
    const userProfile = document.getElementById('userProfile');
    
    if (!userProfile || !user) return;
    
    // Asegurarse de que user.stats exista
    const stats = user.stats || {
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0
    };
    
    userProfile.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="${user.avatar || 'assets/default-avatar.png'}" alt="${user.name || user.nombre || 'Usuario'}" onerror="this.src='assets/default-avatar.png'">
            </div>
            <div class="profile-info">
                <h2>${user.name || user.nombre || 'Usuario'}</h2>
                <p>${user.email || ''}</p>
                <p><i class="fas fa-phone"></i> ${user.phone || 'No especificado'}</p>
            </div>
        </div>
        
        <div class="profile-stats">
            <div class="stat-card">
                <div class="stat-value">${stats.totalRequests || 0}</div>
                <div class="stat-label">Total Solicitudes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.pendingRequests || 0}</div>
                <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.completedRequests || 0}</div>
                <div class="stat-label">Completadas</div>
            </div>
        </div>
        
        <div class="profile-section">
            <h3>Información Personal</h3>
            <div class="profile-form">
                <div class="form-group">
                    <label for="profileName">Nombre Completo</label>
                    <input type="text" id="profileName" value="${user.name}" disabled>
                </div>
                <div class="form-group">
                    <label for="profileEmail">Correo Electrónico</label>
                    <input type="email" id="profileEmail" value="${user.email}" disabled>
                </div>
                <div class="form-group">
                    <label for="profilePhone">Teléfono</label>
                    <input type="tel" id="profilePhone" value="${user.phone || 'No especificado'}" disabled>
                </div>
                <div class="form-group">
                    <label for="profileAddress">Dirección</label>
                    <input type="text" id="profileAddress" value="${user.address || 'No especificada'}" disabled>
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

            this.textContent = 'Guardar Cambios';
            this.removeEventListener('click', arguments.callee);

            this.addEventListener('click', async function() {
                const updatedUser = {
                    ...user,
                    name: document.getElementById('profileName').value.trim(),
                    email: document.getElementById('profileEmail').value.trim(),
                    phone: document.getElementById('profilePhone').value.trim(),
                    address: document.getElementById('profileAddress').value.trim()
                };

                // Validación básica
                if (!updatedUser.name || !updatedUser.email) {
                    showNotification('Nombre y correo son obligatorios', 'error');
                    return;
                }

                try {
                    await db.updateUser(updatedUser.id, updatedUser);
                    inputs.forEach(input => input.disabled = true);
                    this.textContent = 'Editar Perfil';
                    this.addEventListener('click', arguments.callee);

                    const userNavName = document.getElementById('userNavName');
                    if (userNavName) {
                        userNavName.textContent = updatedUser.name;
                    }
                    showNotification('Perfil actualizado correctamente', 'success');
                } catch (error) {
                    showNotification('Error al actualizar el perfil', 'error');
                }
            });
        });
    }
}

// Cargar lista de servicios
async function loadServices() {
    const servicesList = document.getElementById('servicesList');
    if (!servicesList) return;

    // Mostrar loader
    servicesList.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;

    // Timeout para evitar carga infinita
    let timeoutId = setTimeout(() => {
        servicesList.innerHTML = `
            <div class="empty-state error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error al cargar los servicios</h3>
                <p>La carga está tomando demasiado tiempo. Intenta recargar la página.</p>
            </div>
        `;
    }, 8000); // 8 segundos

    try {
        const services = await db.getServices();
        clearTimeout(timeoutId);

        servicesList.innerHTML = '';

        if (!services || services.length === 0) {
            servicesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tools"></i>
                    <h3>No hay servicios disponibles en este momento</h3>
                    <p>Pronto añadiremos nuevos servicios para ti</p>
                </div>
            `;
            return;
        }

        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <div class="service-image">
                    <img src="${service.image}" alt="${service.title || service.name}" onerror="this.src='assets/images/default-service.jpg'">
                </div>
                <div class="service-content">
                    <span class="category">${service.category || ''}</span>
                    <h3>${service.title || service.name}</h3>
                    <p>${service.description}</p>
                    <div class="service-price">
                        <span class="price">${service.price ? service.price.toFixed(2) : '0.00'} €</span>
                    </div>
                    <div class="service-actions">
                        <button class="button primary-button request-service-btn" data-service-id="${service.id}">
                            Solicitar Servicio
                        </button>
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
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error al cargar servicios:', error);
        servicesList.innerHTML = `
            <div class="empty-state error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error al cargar los servicios</h3>
                <p>Por favor, intenta recargar la página</p>
            </div>
        `;
    }
}


async function loadRequests(filter = 'all', dateFilter = 'all') {
    try {
        const user = await db.getCurrentUser();
        const requests = await db.getRequests(user.id);
        const requestsList = document.getElementById('requestsList');
        
        if (!requestsList) return;
        
        // Limpiar contenedor
        requestsList.innerHTML = '';
        
        // Si no hay solicitudes o es null/undefined, mostrar mensaje inicial
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Aún no se han realizado solicitudes</h3>
                    <p>Crea una nueva solicitud para comenzar</p>
                </div>
            `;
            return;
        }
        
        // Filtrar solicitudes
        let filteredRequests = [...requests];
        
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
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Error corregido
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
                    <h3>No hay solicitudes que coincidan con los filtros</h3>
                    <p>Intenta con otros filtros o crea una nueva solicitud</p>
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
    } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        showNotification('Error al cargar solicitudes', 'error');
        
        // Mostrar mensaje de error en la interfaz
        if (requestsList) {
            requestsList.innerHTML = `
                <div class="empty-state error">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error al cargar las solicitudes</h3>
                    <p>Por favor, intenta recargar la página</p>
                </div>
            `;
        }
    }
}

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
            // Eliminar la sesión del sessionStorage
            sessionStorage.removeItem('currentUser');
            showNotification('Sesión cerrada correctamente', 'success');
            // Redirigir al login después de un breve retraso
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
}

async function initRequestModal() {
    const requestModal = document.getElementById('requestModal');
    const newRequestBtn = document.getElementById('newRequestBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelRequest = document.getElementById('cancelRequest');
    const submitRequest = document.getElementById('submitRequest');
    const serviceSelect = document.getElementById('serviceSelect');
    
    // Cargar opciones de servicios en el select
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Selecciona un servicio</option>';
        const services = await db.getServices();
        services.forEach(service => {
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
            
            try {
                // Obtener usuario actual
                const user = await db.getCurrentUser();
                
                // Crear nueva solicitud
                const newRequest = {
                    title: requestTitle.value,
                    serviceId: parseInt(serviceSelect.value),
                    userId: user.id,
                    serviceName: serviceSelect.options[serviceSelect.selectedIndex].text,
                    description: requestDescription.value,
                    date: requestDate.value,
                    createdAt: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    priority: requestPriority.value
                };
                
                // Añadir solicitud y actualizar interfaz
                await addNewRequest(newRequest);
                
                // Cerrar modal y mostrar notificación
                showNotification('Solicitud creada correctamente', 'success');
                closeRequestModal();
                
                // Cambiar a pestaña de solicitudes
                document.querySelector('.tab-btn[data-tab="requestsTab"]').click();
            } catch (error) {
                console.error('Error al crear solicitud:', error);
                showNotification('Error al crear la solicitud', 'error');
            }
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
async function cancelRequest(requestId) {
    if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
        try {
            // Obtener la solicitud
            const request = await db.getRequestById(requestId);
            
            if (request) {
                // Actualizar estado a rechazado
                request.status = 'rejected';
                await db.updateRequest(requestId, request);
                
                // Actualizar estadísticas del usuario
                const user = await db.getCurrentUser();
                if (user.stats) {
                    user.stats.pendingRequests = (user.stats.pendingRequests || 0) - 1;
                    await db.updateUser(user.id, user);
                }
                
                // Recargar listas
                await loadRequests();
                await loadUserData();
                
                // Mostrar mensaje
                showNotification('Solicitud cancelada correctamente', 'success');
            } else {
                showNotification('No se encontró la solicitud', 'error');
            }
        } catch (error) {
            console.error('Error al cancelar la solicitud:', error);
            showNotification('Error al cancelar la solicitud', 'error');
        }
    }
}

// Ver detalles de solicitud
async function viewRequestDetails(requestId) {
    try {
        const request = await db.getRequestById(requestId);
        if (request) {
            alert(`Detalles de la solicitud "${request.title}":\n- Servicio: ${request.serviceName}\n- Estado: ${request.status}\n- Fecha: ${request.date}`);
        } else {
            showNotification('Solicitud no encontrada', 'error');
        }
    } catch (error) {
        console.error('Error al obtener detalles de la solicitud:', error);
        showNotification('Error al cargar los detalles', 'error');
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

// Sistema de persistencia de datos
async function loadAppData() {
    try {
        const user = await db.getCurrentUser();
        if (!user) {
            throw new Error('No se encontró un usuario con sesión activa');
        }
        
        const requests = await db.getRequests(user.id);
        const services = await db.getServices();
        
        // Asegurarse de que el usuario tenga la propiedad stats
        if (!user.stats) {
            user.stats = {
                totalRequests: 0,
                pendingRequests: 0,
                completedRequests: 0
            };
            await db.updateUser(user.id, user);
        }
        
        return { user, requests, services };
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showNotification('Error al cargar los datos de la aplicación', 'error');
        throw error;
    }
}

// Función para actualizar perfil de usuario
async function updateUserProfile(updatedUserData) {
    try {
        // Obtener usuario actual
        const user = await db.getCurrentUser();
        
        // Actualizar datos del usuario
        const updatedUser = { ...user, ...updatedUserData };
        
        // Asegurarse de que tenga la propiedad stats
        if (!updatedUser.stats) {
            updatedUser.stats = {
                totalRequests: 0,
                pendingRequests: 0,
                completedRequests: 0
            };
        }
        
        // Guardar en la base de datos
        await db.updateUser(user.id, updatedUser);
        
        // Actualizar UI
        await renderUserProfile(updatedUser);
        
        // Actualizar nombre en la barra de navegación
        const userNavName = document.getElementById('userNavName');
        if (userNavName) {
            userNavName.textContent = updatedUser.name;
        }
        
        return true;
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        showNotification('Error al actualizar el perfil', 'error');
        return false;
    }
}

// Función para añadir una nueva solicitud
async function addNewRequest(newRequest) {
    try {
        // Añadir a la base de datos
        await db.addRequest(newRequest);
        
        // Actualizar estadísticas del usuario
        const user = await db.getCurrentUser();
        
        // Asegurarse de que tenga la propiedad stats
        if (!user.stats) {
            user.stats = {
                totalRequests: 0,
                pendingRequests: 0,
                completedRequests: 0
            };
        }
        
        // Incrementar contadores
        user.stats.totalRequests = (user.stats.totalRequests || 0) + 1;
        user.stats.pendingRequests = (user.stats.pendingRequests || 0) + 1;
        
        // Actualizar usuario
        await db.updateUser(user.id, user);
        
        // Recargar listas
        await loadRequests();
        await loadUserData();
        
        return true;
    } catch (error) {
        console.error('Error al añadir solicitud:', error);
        showNotification('Error al crear la solicitud', 'error');
        return false;
    }
}

// Función para actualizar estado de una solicitud
async function updateRequestStatus(requestId, newStatus) {
    try {
        // Obtener la solicitud
        const request = await db.getRequestById(requestId);
        
        if (!request) {
            return false;
        }
        
        const oldStatus = request.status;
        
        // Actualizar estado
        request.status = newStatus;
        await db.updateRequest(requestId, request);
        
        // Actualizar estadísticas del usuario
        const user = await db.getCurrentUser();
        
        // Asegurarse de que tenga la propiedad stats
        if (!user.stats) {
            user.stats = {
                totalRequests: 0,
                pendingRequests: 0,
                completedRequests: 0
            };
        }
        
        // Actualizar contadores
        if (oldStatus === 'pending' && newStatus !== 'pending') {
            user.stats.pendingRequests = Math.max(0, (user.stats.pendingRequests || 0) - 1);
        }
        
        if (newStatus === 'completed') {
            user.stats.completedRequests = (user.stats.completedRequests || 0) + 1;
        }
        
        // Actualizar usuario
        await db.updateUser(user.id, user);
        
        return true;
    } catch (error) {
        console.error('Error al actualizar estado de solicitud:', error);
        return false;
    }
}

// Función para reiniciar datos a valores predeterminados
async function resetToDefaultData() {
    if (confirm('¿Estás seguro de que deseas reiniciar todos los datos? Esta acción no se puede deshacer.')) {
        try {
            // Limpiar sessionStorage
            sessionStorage.clear();
            
            // Reiniciar la base de datos
            await db.resetDatabase();
            
            // Inicializar servicios predeterminados
            await db.initDefaultServices();
            
            // Crear usuario predeterminado
            const defaultUser = {
                id: 1,
                name: "Carlos Rodríguez",
                email: "carlos.rodriguez@ejemplo.com",
                phone: "+34 623 456 789",
                address: "Calle Principal 123, Madrid",
                avatar: "/api/placeholder/150/150",
                role: "Usuario",
                stats: {
                    totalRequests: 0,
                    pendingRequests: 0,
                    completedRequests: 0
                }
            };
            
            // Guardar usuario predeterminado
            await db.addUser(defaultUser);
            
            // Guardar en sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(defaultUser));
            
            // Mostrar mensaje
            showNotification('Datos reiniciados correctamente', 'success');
            
            // Recargar la página después de un breve retraso
            setTimeout(() => {
                location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error al reiniciar datos:', error);
            showNotification('Error al reiniciar los datos', 'error');
        }
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
                    const importedData = JSON.parse(await file.text());
                    
                    // Usar transacciones de la base de datos
                    const transaction = db.db.transaction(['services', 'requests'], 'readwrite');
                    
                    // Importar servicios
                    if (importedData.services) {
                        const serviceStore = transaction.objectStore('services');
                        for (const service of importedData.services) {
                            serviceStore.put(service);
                        }
                    }
                    
                    // Importar solicitudes
                    if (importedData.requests) {
                        const requestStore = transaction.objectStore('requests');
                        for (const request of importedData.requests) {
                            requestStore.put(request);
                        }
                    }
                    
                    await transaction.complete;
                    
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
// Función para configurar el botón de editar perfil

// Función para configurar el botón de editar perfil
function setupEditProfileButton(user) {
    const editProfileButton = document.getElementById('editProfileButton');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', async function() {
            const userProfile = document.querySelector('#userProfile');
            const inputs = userProfile.querySelectorAll('input[disabled]');
            
            // Si ya están habilitados los campos, guardar los cambios
            if (this.textContent === 'Guardar Cambios') {
                const inputs = userProfile.querySelectorAll('input:not([disabled])');
                const updatedUserData = {};
                
                inputs.forEach(input => {
                    const field = input.id.replace('profile', '').toLowerCase();
                    updatedUserData[field] = input.value;
                    input.disabled = true;
                });
                
                try {
                    // Actualizar usuario en la base de datos
                    await db.updateUser(user.id, updatedUserData);
                    
                    // Actualizar UI
                    const userNavName = document.getElementById('userNavName');
                    if (userNavName) {
                        userNavName.textContent = updatedUserData.name;
                    }
                    
                    showNotification('Perfil actualizado correctamente', 'success');
                    
                    // Cambiar botón de vuelta a "Editar perfil" o texto original
                    this.textContent = 'Editar Perfil';
                } catch (error) {
                    console.error('Error al actualizar perfil:', error);
                    showNotification('Error al actualizar el perfil', 'error');
                }
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