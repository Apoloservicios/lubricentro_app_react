// src/utils/helpers.ts - Corregido
import moment from 'moment';

// Función para formatear la fecha
export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  return moment(date).format('DD/MM/YYYY');
};

// Función para formatear la fecha y hora
export const formatDateTime = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  return moment(date).format('DD/MM/YYYY HH:mm');
};

// Función para convertir una cadena a mayúsculas
export const toUpperCase = (text: string): string => {
  return text.toUpperCase();
};

// Función para verificar si una fecha está próxima (menos de 7 días)
export const isDateApproaching = (date: Date): boolean => {
  const days = moment(date).diff(moment(), 'days');
  return days <= 7 && days > 0;
};

// Función para verificar si una fecha está vencida
export const isDateOverdue = (date: Date): boolean => {
  return moment(date).isBefore(moment(), 'day');
};

// Función para calcular la fecha del próximo cambio
export const calculateNextChangeDate = (date: Date, intervalMonths: number): Date => {
  return moment(date).add(intervalMonths, 'months').toDate();
};

// Función para calcular el próximo kilometraje - CORREGIDA para usar 10000 por defecto
export const calculateNextKm = (currentKm: number, interval: number = 10000): number => {
  return currentKm + interval;
};

// Función para validar un número de teléfono
export const isValidPhoneNumber = (phone: string): boolean => {
  // Acepta números con espacios, guiones y paréntesis
  return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(phone);
};

// Función para validar un dominio de vehículo
export const isValidDominio = (dominio: string): boolean => {
  // Formato argentino nuevo (AA123BB) o viejo (ABC123)
  return /^[A-Z]{2}[0-9]{3}[A-Z]{2}$|^[A-Z]{3}[0-9]{3}$/i.test(dominio);
};

// Función para validar un email
export const isValidEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

// Función para normalizar un dominio (convertir a mayúsculas y eliminar espacios)
export const normalizeDominio = (dominio: string): string => {
  return dominio.toUpperCase().replace(/\s/g, '');
};

// Función para convertir la primera letra de cada palabra a mayúscula
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Constantes para los tipos de vehículos
export const vehicleTypes = [
  { label: 'Auto', value: 'Auto' },
  { label: 'Camioneta', value: 'Camioneta' },
  { label: 'Camión', value: 'Camión' },
  { label: 'Moto', value: 'Moto' },
  { label: 'Tractor', value: 'Tractor' },
  { label: 'Maquinaria', value: 'Maquinaria' },
  { label: 'Otro', value: 'Otro' },
];

// Constantes para los tipos de aceite
export const oilTypes = [
  { label: 'Mineral', value: 'Mineral' },
  { label: 'Semisintético', value: 'Semisintético' },
  { label: 'Sintético', value: 'Sintético' },
];

// Constantes para las viscosidades SAE
export const saeOptions = [
  { label: 'SAE 10W-30', value: 'SAE 10W-30' },
  { label: 'SAE 10W-40', value: 'SAE 10W-40' },
  { label: 'SAE 5W-30', value: 'SAE 5W-30' },
  { label: 'SAE 5W-40', value: 'SAE 5W-40' },
  { label: 'SAE 15W-40', value: 'SAE 15W-40' },
  { label: 'SAE 20W-50', value: 'SAE 20W-50' },
  { label: 'SAE 25W-60', value: 'SAE 25W-60' },
  { label: 'SAE 30', value: 'SAE 30' },
  { label: 'SAE 40', value: 'SAE 40' },
  { label: 'SAE 50', value: 'SAE 50' },
  { label: 'SAE 90', value: 'SAE 90' },
  { label: 'SAE 140', value: 'SAE 140' },
  { label: 'SAE 80W-90', value: 'SAE 80W-90' },
  { label: 'SAE 85W-140', value: 'SAE 85W-140' },
  { label: 'Otro', value: 'Otro' },
];

// Constantes para las marcas de aceite comunes
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

// Constantes para los intervalos de cambio en meses
export const changeIntervals = [
  { label: '1 mes', value: 1 },
  { label: '3 meses', value: 3 },
  { label: '6 meses', value: 6 },
  { label: '12 meses', value: 12 },
];