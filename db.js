/**
 * Módulo de base de datos
 * Maneja todas las operaciones con IndexedDB
 */

// Clase Database para manejar operaciones con IndexedDB
class Database {
    constructor() {
        this.dbName = 'serviciosApp';
        this.dbVersion = 1;
        this.db = null;
    }
    
    // Inicializar la base de datos
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            // Crear o actualizar la estructura de la base de datos
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear almacén de usuarios si no existe
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    usersStore.createIndex('email', 'email', { unique: true });
                    usersStore.createIndex('role', 'role');
                }
                
                // Crear almacén de servicios si no existe
                if (!db.objectStoreNames.contains('services')) {
                    const servicesStore = db.createObjectStore('services', { keyPath: 'id', autoIncrement: true });
                    servicesStore.createIndex('category', 'category');
                    servicesStore.createIndex('price', 'price');
                }
                
                // Crear almacén de solicitudes si no existe
                if (!db.objectStoreNames.contains('requests')) {
                    const requestsStore = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
                    requestsStore.createIndex('userId', 'userId');
                    requestsStore.createIndex('serviceId', 'serviceId');
                    requestsStore.createIndex('createdAt', 'createdAt');
                    requestsStore.createIndex('status', 'status'); // CORREGIDO: Usar requestsStore en lugar de servicesStore
                }
                
                // Crear almacén de sesiones si no existe
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                    sessionsStore.createIndex('userId', 'userId');
                    sessionsStore.createIndex('token', 'token', { unique: true });
                    sessionsStore.createIndex('expiresAt', 'expiresAt');
                }
            };
            
            // Manejar errores
            request.onerror = (event) => {
                console.error('Error al abrir la base de datos:', event.target.error);
                reject(event.target.error);
            };
            
            // Conexión exitosa
            request.onsuccess = (event) => {
                this.db = event.target.result;
                
                // Manejar errores de la base de datos
                this.db.onerror = (event) => {
                    console.error('Error en la base de datos:', event.target.error);
                };
                
                resolve(this.db);
            };
        });
    }
    
    // Realizar una transacción genérica
    async performTransaction(storeName, mode, callback) {
        if (!this.db) {
            await this.initDatabase();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            
            transaction.oncomplete = () => {
                resolve();
            };
            
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
            
            resolve(callback(store));
        });
    }
    
    // Añadir un usuario (para migración)
    async addUser(userData) {
        return this.performTransaction('users', 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                // Verificar si el email ya existe
                const emailIndex = store.index('email');
                const emailCheck = emailIndex.get(userData.email);
                
                emailCheck.onsuccess = (event) => {
                    if (event.target.result) {
                        reject(new Error('El email ya está registrado'));
                        return;
                    }
                    
                    // Si no existe, añadir el usuario
                    const request = store.add(userData);
                    
                    request.onsuccess = (event) => {
                        resolve({ id: event.target.result, ...userData });
                    };
                    
                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                };
                
                emailCheck.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
    }
    
    // Verificar si un email ya existe
    async checkEmailExists(email) {
        return this.performTransaction('users', 'readonly', (store) => {
            return new Promise((resolve) => {
                const index = store.index('email');
                const request = index.get(email);
                
                request.onsuccess = (event) => {
                    resolve(!!event.target.result);
                };
                
                request.onerror = () => {
                    resolve(false);
                };
            });
        });
    }
    
    // Crear un nuevo usuario
    async createUser(userData) {
        // Añadir estadísticas iniciales y fecha de creación
        const userWithStats = {
            ...userData,
            createdAt: new Date().toISOString(),
            stats: {
                totalRequests: 0,
                pendingRequests: 0,
                completedRequests: 0
            }
        };
        
        return this.addUser(userWithStats);
    }
    
    // Verificar credenciales de usuario
    async verifyCredentials(email, password) {
        return this.performTransaction('users', 'readonly', (store) => {
            return new Promise((resolve) => {
                const index = store.index('email');
                const request = index.get(email);
                
                request.onsuccess = (event) => {
                    const user = event.target.result;
                    
                    if (user && user.password === password) {
                        resolve(user);
                    } else {
                        resolve(null);
                    }
                };
                
                request.onerror = () => {
                    resolve(null);
                };
            });
        });
    }
    
    // Crear una sesión para un usuario
    async createSession(userId) {
        const token = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días
        
        const session = {
            userId,
            token,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
        };
        
        return this.performTransaction('sessions', 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.add(session);
                
                request.onsuccess = (event) => {
                    resolve({ id: event.target.result, ...session });
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
    }
    
    // Generar un token aleatorio
    generateToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    // Obtener usuario actual desde sessionStorage
    async getCurrentUser() {
        const userJson = sessionStorage.getItem('currentUser');
        
        if (!userJson) {
            return null;
        }
        
        try {
            const user = JSON.parse(userJson);
            
            // Verificar si la sesión es válida
            const isValid = await this.validateSession(user.id, user.sessionId);
            
            if (!isValid) {
                sessionStorage.removeItem('currentUser');
                return null;
            }
            
            // Obtener datos actualizados del usuario
            return this.performTransaction('users', 'readonly', (store) => {
                return new Promise((resolve) => {
                    const request = store.get(user.id);
                    
                    request.onsuccess = (event) => {
                        if (event.target.result) {
                            // No devolver la contraseña
                            const { password, ...userData } = event.target.result;
                            resolve({
                                ...userData,
                                sessionId: user.sessionId
                            });
                        } else {
                            sessionStorage.removeItem('currentUser');
                            resolve(null);
                        }
                    };
                    
                    request.onerror = () => {
                        sessionStorage.removeItem('currentUser');
                        resolve(null);
                    };
                });
            });
        } catch (e) {
            console.error('Error al parsear usuario:', e);
            sessionStorage.removeItem('currentUser');
            return null;
        }
    }
    
    // Validar una sesión
    async validateSession(userId, sessionId) {
        return this.performTransaction('sessions', 'readonly', (store) => {
            return new Promise((resolve) => {
                const request = store.get(sessionId);
                
                request.onsuccess = (event) => {
                    const session = event.target.result;
                    
                    if (!session || session.userId !== userId) {
                        resolve(false);
                        return;
                    }
                    
                    // Verificar si la sesión ha expirado
                    const expiresAt = new Date(session.expiresAt);
                    const now = new Date();
                    
                    if (now > expiresAt) {
                        // Eliminar sesión expirada
                        this.performTransaction('sessions', 'readwrite', (store) => {
                            store.delete(sessionId);
                        }).catch(console.error);
                        
                        resolve(false);
                        return;
                    }
                    
                    resolve(true);
                };
                
                request.onerror = () => {
                    resolve(false);
                };
            });
        });
    }
    
    // Actualizar un usuario
    async updateUser(userId, userData) {
        return this.performTransaction('users', 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                // Primero obtener el usuario actual
                const getRequest = store.get(userId);
                
                getRequest.onsuccess = (event) => {
                    const currentUser = event.target.result;
                    
                    if (!currentUser) {
                        reject(new Error('Usuario no encontrado'));
                        return;
                    }
                    
                    // Mantener la contraseña y estadísticas existentes
                    const updatedUser = {
                        ...currentUser,
                        ...userData,
                        password: currentUser.password,
                        stats: currentUser.stats || {
                            totalRequests: 0,
                            pendingRequests: 0,
                            completedRequests: 0
                        }
                    };
                    
                    // Actualizar el usuario
                    const updateRequest = store.put(updatedUser);
                    
                    updateRequest.onsuccess = () => {
                        // No devolver la contraseña
                        const { password, ...userDataWithoutPassword } = updatedUser;
                        resolve(userDataWithoutPassword);
                    };
                    
                    updateRequest.onerror = (event) => {
                        reject(event.target.error);
                    };
                };
                
                getRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
    }
    
    // Inicializar servicios por defecto
    async initDefaultServices() {
        try {
            // Verificar si ya existen servicios
            const services = await this.performTransaction('services', 'readonly', store => store.getAll());
            
            if (services && services.length > 0) {
                return; // Ya hay servicios, no hacer nada
            }
            
            // Servicios por defecto
            const defaultServices = [
                {
                    name: 'Reparación de Ordenadores',
                    category: 'Reparación',
                    description: 'Servicio de reparación de ordenadores de sobremesa y portátiles. Incluye diagnóstico, limpieza y reparación de hardware.',
                    price: 50.00,
                    image: 'repair.jpg',
                    createdAt: new Date().toISOString()
                },
                {
                    name: 'Instalación de Software',
                    category: 'Software',
                    description: 'Instalación y configuración de sistemas operativos, programas y aplicaciones en tu ordenador o dispositivo móvil.',
                    price: 30.00,
                    image: 'computer_installation.jpg',
                    createdAt: new Date().toISOString()
                },
                {
                    name: 'Diseño Web',
                    category: 'Diseño',
                    description: 'Creación de sitios web profesionales, responsive y optimizados para SEO. Incluye diseño, desarrollo y puesta en marcha.',
                    price: 300.00,
                    image: 'Diseño-web.jpg',
                    createdAt: new Date().toISOString()
                },
                {
                    name: 'Soporte Técnico',
                    category: 'Soporte',
                    description: 'Asistencia técnica para resolver problemas informáticos, configuración de redes, y optimización de sistemas.',
                    price: 40.00,
                    image: 'soporte-tecnico.png',
                    createdAt: new Date().toISOString()
                },
                {
                    name: 'Desarrollo de Aplicaciones',
                    category: 'Desarrollo',
                    description: 'Desarrollo de aplicaciones a medida para web, móvil o escritorio según tus necesidades específicas.',
                    price: 500.00,
                    image: 'app-dev.jpg',
                    createdAt: new Date().toISOString()
                }
            ];
            
            // Añadir servicios a la base de datos
            for (const service of defaultServices) {
                await this.performTransaction('services', 'readwrite', store => {
                    return store.add(service);
                });
            }
            
            console.log('Servicios por defecto insertados en IndexedDB');
        } catch (error) {
            console.error('Error al inicializar servicios por defecto:', error);
        }
    }
    
    // Obtener todos los servicios
    async getServices() {
        return this.performTransaction('services', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
    }
    
    // Obtener un servicio por ID
    async getServiceById(id) {
        return this.performTransaction('services', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.get(id);
                
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
    }
    
    // Crear una nueva solicitud de servicio
    async createRequest(requestData) {
        // Añadir fecha de creación y estado inicial
        const newRequest = {
            ...requestData,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'pending',
            updates: []
        };
        
        // Crear la solicitud
        const createdRequest = await this.performTransaction('requests', 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.add(newRequest);
                
                request.onsuccess = (event) => {
                    resolve({ id: event.target.result, ...newRequest });
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
        
        // Actualizar estadísticas del usuario
        await this.updateUserStats(requestData.userId);
        
        return createdRequest;
    }
    
    // Obtener solicitudes de un usuario
    async getRequests(userId) {
        const requests = await this.performTransaction('requests', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const index = store.index('userId');
                const request = index.getAll(userId);
                
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
        
        // Obtener nombres de servicios para cada solicitud
        for (const request of requests) {
            try {
                const service = await this.getServiceById(request.serviceId);
                request.serviceName = service ? service.name : 'Servicio no disponible';
            } catch (error) {
                request.serviceName = 'Error al cargar servicio';
            }
        }
        
        return requests;
    }
    
    // Obtener una solicitud por ID
    async getRequestById(id) {
        const request = await this.performTransaction('requests', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const req = store.get(id);
                
                req.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                req.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
        
        if (request) {
            // Obtener nombre del servicio
            try {
                const service = await this.getServiceById(request.serviceId);
                request.serviceName = service ? service.name : 'Servicio no disponible';
            } catch (error) {
                request.serviceName = 'Error al cargar servicio';
            }
        }
        
        return request;
    }
    
    // Actualizar estado de una solicitud
    async updateRequestStatus(id, status, comment = '') {
        return this.performTransaction('requests', 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const getRequest = store.get(id);
                
                getRequest.onsuccess = async (event) => {
                    const request = event.target.result;
                    
                    if (!request) {
                        reject(new Error('Solicitud no encontrada'));
                        return;
                    }
                    
                    // Añadir actualización al historial
                    const update = {
                        date: new Date().toISOString(),
                        status,
                        comment
                    };
                    
                    request.status = status;
                    request.updates = request.updates || [];
                    request.updates.push(update);
                    
                    const updateRequest = store.put(request);
                    
                    updateRequest.onsuccess = () => {
                        // Actualizar estadísticas del usuario
                        this.updateUserStats(request.userId)
                            .then(() => resolve(request))
                            .catch(error => {
                                console.error('Error al actualizar estadísticas:', error);
                                resolve(request);
                            });
                    };
                    
                    updateRequest.onerror = (event) => {
                        reject(event.target.error);
                    };
                };
                
                getRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
    }
    
    // Actualizar estadísticas del usuario
    async updateUserStats(userId) {
        try {
            // Obtener todas las solicitudes del usuario
            const requests = await this.getRequests(userId);
            
            // Calcular estadísticas
            const stats = {
                totalRequests: requests.length,
                pendingRequests: requests.filter(r => r.status === 'pending').length,
                completedRequests: requests.filter(r => r.status === 'completed').length
            };
            
            // Actualizar usuario
            await this.performTransaction('users', 'readwrite', (store) => {
                return new Promise((resolve, reject) => {
                    const getRequest = store.get(userId);
                    
                    getRequest.onsuccess = (event) => {
                        const user = event.target.result;
                        
                        if (!user) {
                            reject(new Error('Usuario no encontrado'));
                            return;
                        }
                        
                        user.stats = stats;
                        
                        const updateRequest = store.put(user);
                        
                        updateRequest.onsuccess = () => {
                            resolve();
                        };
                        
                        updateRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    };
                    
                    getRequest.onerror = (event) => {
                        reject(event.target.error);
                    };
                });
            });
            
            return stats;
        } catch (error) {
            console.error('Error al actualizar estadísticas:', error);
            throw error;
        }
    }
}

// Exportar la clase Database al objeto window para que sea accesible globalmente
window.Database = Database;