// src/utils/validations.ts - CORRECCIÓN
import * as Yup from 'yup';
import { isValidPhoneNumber, isValidDominio } from './helpers';

// Esquema de validación para el formulario de cambio de aceite
export const cambioAceiteSchema = Yup.object().shape({
  // Datos del cliente
  nombreCliente: Yup.string()
    .required('El nombre del cliente es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  
  celular: Yup.string()
    .required('El número de teléfono es requerido')
    .test('is-valid-phone', 'Número de teléfono inválido', value => 
      value ? isValidPhoneNumber(value) : false
    ),
  
  // Datos del vehículo
  dominioVehiculo: Yup.string()
    .required('El dominio es requerido')
    .test('is-valid-dominio', 'Formato de dominio inválido', value => 
      value ? isValidDominio(value.toUpperCase()) : false
    ),
  
  marcaVehiculo: Yup.string()
    .required('La marca del vehículo es requerida')
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(50, 'La marca es demasiado larga'),
  
  modeloVehiculo: Yup.string()
    .required('El modelo del vehículo es requerido')
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(50, 'El modelo es demasiado largo'),
  
  añoVehiculo: Yup.string()
    .required('El año del vehículo es requerido')
    .matches(/^[0-9]{4}$/, 'Formato de año inválido (debe ser un número de 4 dígitos)'),
  
  tipoVehiculo: Yup.string()
    .required('El tipo de vehículo es requerido'),
  
  kmActuales: Yup.number()
    .required('El kilometraje actual es requerido')
    .min(0, 'El kilometraje no puede ser negativo')
    .max(9999999, 'Kilometraje demasiado alto'),
  
  kmProximo: Yup.number()
    .required('El kilometraje del próximo cambio es requerido')
    .min(Yup.ref('kmActuales'), 'El kilometraje próximo debe ser mayor al actual')
    .max(9999999, 'Kilometraje demasiado alto'),
  
  // Datos del servicio
  fechaServicio: Yup.date()
    .required('La fecha del servicio es requerida'),
  
  fechaProximoCambio: Yup.date()
    .required('La fecha del próximo cambio es requerida')
    .min(Yup.ref('fechaServicio'), 'La fecha del próximo cambio debe ser posterior a la del servicio'),
  
  perioricidad_servicio: Yup.number()
    .required('La periodicidad del servicio es requerida')
    .min(1, 'La periodicidad debe ser de al menos 1 mes'),
  
  // Datos del aceite
  tipoAceite: Yup.string()
    .required('El tipo de aceite es requerido'),
  
  marcaAceite: Yup.string()
    .required('La marca de aceite es requerida'),
  
  sae: Yup.string()
    .required('La viscosidad SAE es requerida'),
  
  cantidadAceite: Yup.string()
    .required('La cantidad de aceite es requerida'),
  
  // Servicios realizados - CORREGIDOS
  filtroAceite: Yup.boolean(),
  filtroAceiteNota: Yup.string()
    .when('filtroAceite', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  filtroAire: Yup.boolean(),
  filtroAireNota: Yup.string()
    .when('filtroAire', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  filtroCombustible: Yup.boolean(),
  filtroCombustibleNota: Yup.string()
    .when('filtroCombustible', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  filtroHabitaculo: Yup.boolean(),
  filtroHabitaculoNota: Yup.string()
    .when('filtroHabitaculo', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  aditivo: Yup.boolean(),
  aditivoNota: Yup.string()
    .when('aditivo', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  engrase: Yup.boolean(),
  engraseNota: Yup.string()
    .when('engrase', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  refrigerante: Yup.boolean(),
  refrigeranteNota: Yup.string()
    .when('refrigerante', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  caja: Yup.boolean(),
  cajaNota: Yup.string()
    .when('caja', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  diferencial: Yup.boolean(),
  diferencialNota: Yup.string()
    .when('diferencial', {
      is: true,
      then: (schema) => schema.required('Nota requerida cuando el servicio es realizado'),
      otherwise: (schema) => schema
    }),
  
  // Observaciones (opcional)
  observaciones: Yup.string()
});