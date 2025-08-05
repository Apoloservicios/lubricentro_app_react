// src/utils/helpers.ts - AGREGANDO NUEVAS FUNCIONES SIN MODIFICAR LAS EXISTENTES
import moment from 'moment';

// Funciones de validación existentes (MANTENIDAS)
// ✅ FUNCIÓN CORREGIDA: Validación de teléfono más flexible
export const isValidPhoneNumber = (phone: string): boolean => {
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Permitir números de 7 a 15 dígitos (puede empezar con +)
  // Ejemplos válidos: +5492604515854, 2604515854, 260-451-5854, (260) 451-5854
  return /^[+]?[0-9]{7,15}$/i.test(cleanPhone);
};

export const isValidDominio = (dominio: string): boolean => {
  return /^[A-Z]{2}[0-9]{3}[A-Z]{2}$|^[A-Z]{3}[0-9]{3}$/i.test(dominio);
};

export const isValidEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const normalizeDominio = (dominio: string): string => {
  return dominio.toUpperCase().replace(/\s/g, '');
};

export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ✅ NUEVA FUNCIÓN: Formatear teléfono para mostrar
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si es un número argentino (empieza con +549 o 549 o 11 dígitos)
  if (cleanPhone.startsWith('+549') && cleanPhone.length === 13) {
    // +5492604515854 -> +549 260 451-5854
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7, 10)}-${cleanPhone.slice(10)}`;
  } else if (cleanPhone.startsWith('549') && cleanPhone.length === 12) {
    // 5492604515854 -> 549 260 451-5854
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 9)}-${cleanPhone.slice(9)}`;
  } else if (cleanPhone.length === 10) {
    // 2604515854 -> 260 451-5854
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  }
  
  return phone; // Devolver el original si no coincide con los patrones
};

// NUEVAS FUNCIONES AGREGADAS:

// Función para formatear texto en mayúsculas automáticamente
export const toUpperCase = (text: string): string => {
  return text.toUpperCase();
};

// Función para extraer solo números de un texto
export const extractNumbers = (text: string): string => {
  return text.replace(/[^0-9]/g, '');
};

// Función para formatear cantidad de litros automáticamente
export const formatLitros = (cantidad: string): string => {
  // Si solo contiene números, agregar "Litros"
  const numeros = extractNumbers(cantidad);
  if (numeros && cantidad === numeros) {
    return `${cantidad} Litros`;
  }
  return cantidad;
};

// Constantes para los tipos de vehículos (MANTENIDAS)
export const vehicleTypes = [
  { label: 'Automovil', value: 'Automovil' },
  { label: 'Suv', value: 'Suv' },
    { label: 'Utilitario', value: 'Utilitario' },
  { label: 'Camioneta', value: 'Camioneta' },
  { label: 'Camión', value: 'Camión' },
  { label: 'Moto', value: 'Moto' },
  
  { label: 'Maquinaria', value: 'Maquinaria' },
  { label: 'Otro', value: 'Otro' },
];

// ACTUALIZADO: Constantes para los tipos de aceite con nueva opción
export const oilTypes = [
  { label: 'Mineral', value: 'Mineral' },
  { label: 'Semisintético', value: 'Semisintético' },
  { label: 'Sintético', value: 'Sintético' },
  { label: 'Sintético de alta performance', value: 'Sintético de alta performance' }, // ✅ NUEVA OPCIÓN
];

// Constantes para las viscosidades SAE (MANTENIDAS)
export const saeOptions = [
  { label: 'SAE 0W-20', value: 'SAE 0W-20' },
  { label: 'SAE 0W-30', value: 'SAE 0W-30' },
  { label: 'SAE 0W-40', value: 'SAE 0W-40' },
   { label: 'SAE 5W-20', value: 'SAE 5W-20' },
  { label: 'SAE 5W-30', value: 'SAE 5W-30' },
  { label: 'SAE 5W-40', value: 'SAE 5W-40' },
   { label: 'SAE 5W-50', value: 'SAE 5W-50' },


  { label: 'SAE 10W-30', value: 'SAE 10W-30' },
  { label: 'SAE 10W-40', value: 'SAE 10W-40' },
   { label: 'SAE 10W-50', value: 'SAE 10W-50' },
    { label: 'SAE 10W-60', value: 'SAE 10W-60' },

  { label: 'SAE 15W-40', value: 'SAE 15W-40' },
  { label: 'SAE 20W-50', value: 'SAE 20W-50' },
  { label: 'SAE 25W-60', value: 'SAE 25W-60' },
  
  { label: 'SAE 20', value: 'SAE 20' },
  { label: 'SAE 30', value: 'SAE 30' },
  { label: 'SAE 40', value: 'SAE 40' },
  { label: 'SAE 50', value: 'SAE 50' },
  { label: 'SAE 90', value: 'SAE 90' },
  { label: 'SAE 140', value: 'SAE 140' },
  { label: 'SAE 80W-90', value: 'SAE 80W-90' },
  { label: 'SAE 85W-140', value: 'SAE 85W-140' },
  { label: 'Otro', value: 'Otro' },
];



// Constantes para las marcas de aceite comunes (MANTENIDAS)
export const oilBrands = [
  { label: 'YPF', value: 'YPF' },
  { label: 'Shell', value: 'Shell' },
  { label: 'Castrol', value: 'Castrol' },
  { label: 'Mobil', value: 'Mobil' },
  { label: 'Total', value: 'Total' },
  { label: 'Valvoline', value: 'Valvoline' },
  { label: 'Petronas', value: 'Petronas' },
  { label: 'Motul', value: 'Motul' },
  { label: 'Gulf', value: 'Gulf' },
  { label: 'Pennzoil', value: 'Pennzoil' },
  { label: 'Liqui Moly', value: 'Liqui Moly' },
  { label: 'Otra', value: 'Otra' },
];

// Constantes para los intervalos de cambio en meses (MANTENIDAS)
export const changeIntervals = [
  { label: '1 mes', value: 1 },
  { label: '3 meses', value: 3 },
  { label: '6 meses', value: 6 },
  { label: '12 meses', value: 12 },
];

// Funciones de utilidad existentes (MANTENIDAS)
export const formatDate = (date: Date): string => {
  return moment(date).format('DD/MM/YYYY');
};

export const calculateNextChangeDate = (currentDate: Date, intervalMonths: number): Date => {
  return moment(currentDate).add(intervalMonths, 'months').toDate();
};

export const calculateNextKm = (currentKm: number, intervalKm: number = 10000): number => {
  return currentKm + intervalKm;
};