// src/interfaces/index.ts - CORRECCIÓN PARA INCLUIR DATOS DEL LUBRICENTRO EN PDF

// Interfaces principales existentes (mantener tal como están)

// Tipo de usuario
export type UserRole = 'admin' | 'operator' | 'viewer';
export type UserStatus = 'activo' | 'inactivo' | 'suspendido';

// Estado del lubricentro
export type LubricentroStatus = 'active' | 'activo' | 'inactive' | 'trial' | 'suspended';

export type CambioEstado = 'pendiente' | 'completo' | 'enviado';

export interface LoginFormValues {
  email: string;
  password: string;
}

// Usuario
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  estado: UserStatus;
  lubricentroId: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

// Lubricentro
export interface Lubricentro {
  id: string;
  fantasyName: string;
  razonSocial: string;
  cuit: string;
  responsable: string;
  domicilio: string;
  email: string;
  phone: string;
  logoUrl?: string;
  ticketPrefix: string;
  estado: LubricentroStatus;
  trialEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
    servicesUsed?: number;        // NUEVA - Para contar servicios utilizados
  servicesRemaining?: number;   // NUEVA - Para contar servicios restantes
}

// Cambio de aceite - ACTUALIZADA para incluir información completa del lubricentro
export interface CambioAceite {
  id: string;
  nroCambio: string;
  
  // Información del cliente
  nombreCliente: string;
  celular: string;
  
  // Información del vehículo
  dominioVehiculo: string;
  marcaVehiculo: string;
  modeloVehiculo: string;
  añoVehiculo: string;
  tipoVehiculo: string;
  kmActuales: number;
  kmProximo: number;
  
  // Fechas
  fecha: Date;
  fechaServicio: Date;
  fechaProximoCambio: Date;
  perioricidad_servicio: number;
  
  // Información del aceite
  tipoAceite: string;
  marcaAceite: string;
  sae: string;
  cantidadAceite: string;
  
  // Servicios realizados
  filtroAceite: boolean;
  filtroAceiteNota: string;
  filtroAire: boolean;
  filtroAireNota: string;
  filtroCombustible: boolean;
  filtroCombustibleNota: string;
  filtroHabitaculo: boolean;
  filtroHabitaculoNota: string;
  aditivo: boolean;
  aditivoNota: string;
  engrase: boolean;
  engraseNota: string;
  refrigerante: boolean;
  refrigeranteNota: string;
  caja: boolean;
  cajaNota: string;
  diferencial: boolean;
  diferencialNota: string;
  
  // Observaciones
  observaciones: string;
  
  // Información del lubricentro y operario
  lubricentroId: string;
  lubricentroNombre: string;

  // NUEVO: Estado del cambio
estado?: CambioEstado; // Opcional para cambios antiguos
  fechaCreacion?: Date;
  fechaCompletado?: Date;
  usuarioCompletado?: string;
  
  // NUEVO: Información completa del lubricentro para PDF
  lubricentro?: {
    fantasyName: string;
    razonSocial: string;
    cuit: string;
    responsable: string;
    domicilio: string;
    email: string;
    phone: string;
    logoUrl?: string;
  };
  
  operatorId: string;
  nombreOperario: string;
  
  // Timestamps
  createdAt: Date;
}

// Formulario de cambio de aceite (sin cambios)
export interface CambioAceiteFormValues {
  nombreCliente: string;
  celular: string;
  dominioVehiculo: string;
  marcaVehiculo: string;
  modeloVehiculo: string;
  añoVehiculo: string;
  tipoVehiculo: string;
  kmActuales: number;
  kmProximo: number;
  fecha: Date;
  fechaServicio: Date;
  fechaProximoCambio: Date;
  perioricidad_servicio: number;
  tipoAceite: string;
  marcaAceite: string;
  sae: string;
  cantidadAceite: string;
  filtroAceite: boolean;
  filtroAceiteNota: string;
  filtroAire: boolean;
  filtroAireNota: string;
  filtroCombustible: boolean;
  filtroCombustibleNota: string;
  filtroHabitaculo: boolean;
  filtroHabitaculoNota: string;
  aditivo: boolean;
  aditivoNota: string;
  engrase: boolean;
  engraseNota: string;
  refrigerante: boolean;
  refrigeranteNota: string;
  caja: boolean;
  cajaNota: string;
  diferencial: boolean;
  diferencialNota: string;
  observaciones: string;
    estado?: CambioEstado;
}

// Estado de autenticación (sin cambios)
export interface AuthState {
  user: User | null;
  lubricentro: Lubricentro | null;
  isLoading: boolean;
  error: string | null;
}