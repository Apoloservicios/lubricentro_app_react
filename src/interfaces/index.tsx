// src/interfaces/index.ts

// Interfaces para Usuario
export interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    lubricentroId: string;
    role: string;
    estado: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
  }
  
  // Interfaces para Lubricentro
  export interface Lubricentro {
    id: string;
    fantasyName: string;
    cuit: string;
    domicilio: string;
    email: string;
    phone: string;
    responsable: string;
    estado: string;
    logoUrl?: string;
    ticketPrefix: string;
    ownerId: string;
    trialEndDate: Date;
    createdAt: Date;
    updatedAt: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
  }
  
  // Interfaces para CambioAceite
  export interface CambioAceite {
    id: string;
    nroCambio: string;
    lubricentroId: string;
    lubricentroNombre: string;
    operatorId: string;
    nombreOperario: string;
    
    // Datos del cliente
    nombreCliente: string;
    celular: string;
    
    // Datos del vehículo
    dominioVehiculo: string;
    marcaVehiculo: string;
    modeloVehiculo: string;
    añoVehiculo: string;
    tipoVehiculo: string;
    kmActuales: number;
    kmProximo: number;
    
    // Datos del servicio
    fecha: Date;
    fechaServicio: Date;
    fechaProximoCambio: Date;
    perioricidad_servicio: number;
    
    // Datos del aceite
    tipoAceite: string;
    marcaAceite: string;
    sae: string;
    cantidadAceite: string;
    
    // Servicios realizados (booleanos y notas)
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
    createdAt: Date;
  }
  
  // Interfaces para formularios
  export interface LoginFormValues {
    email: string;
    password: string;
  }
  
// Modifica esta interfaz para hacer nroCambio opcional
export interface CambioAceiteFormValues {
  nroCambio?: string; // Opcional
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
}

  // Estado de autenticación
  export interface AuthState {
    user: User | null;
    lubricentro: Lubricentro | null;
    isLoading: boolean;
    error: string | null;
  }