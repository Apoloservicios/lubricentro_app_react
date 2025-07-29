// src/services/cambiosService.ts - CORREGIDO PARA INCLUIR INFORMACIÓN COMPLETA DEL LUBRICENTRO
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { CambioAceite, CambioAceiteFormValues, User, Lubricentro } from '../interfaces';

// Constantes
const CAMBIOS_COLLECTION = 'cambiosAceite';

// Función para obtener el último número de cambio
export const getLastCambioNumber = async (lubricentroId: string): Promise<string> => {
  try {
    // Obtener el lubricentro para el prefijo
    const lubricentroDoc = await getDoc(doc(db, 'lubricentros', lubricentroId));
    
    if (!lubricentroDoc.exists()) {
      throw new Error('Lubricentro no encontrado');
    }
    
    const lubricentro = lubricentroDoc.data() as Lubricentro;
    const prefix = lubricentro.ticketPrefix || 'LUB';
    
    // CORREGIR: Consultar TODOS los cambios, no solo los recientes
    const q = query(
      collection(db, CAMBIOS_COLLECTION),
      where('lubricentroId', '==', lubricentroId),
      orderBy('nroCambio', 'desc'), // CAMBIAR: ordenar por nroCambio, no por createdAt
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Si no hay cambios previos, empezar desde 1
      return `${prefix}-00001`;
    }
    
    // Extraer el último número y aumentarlo
    const lastChange = querySnapshot.docs[0].data() as CambioAceite;
    const lastNumber = lastChange.nroCambio;
    
    console.log('Último número encontrado:', lastNumber);
    
    // MEJORAR: Extraer solo el número y aumentarlo
    const matches = lastNumber.match(/(\w+)-(\d+)/);
    
    if (!matches || matches.length < 3) {
      return `${prefix}-00001`;
    }
    
    const lastNumberInt = parseInt(matches[2]);
    const newNumber = lastNumberInt + 1;
    
    // Formatear el nuevo número con ceros a la izquierda
    const newNumberFormatted = `${prefix}-${newNumber.toString().padStart(5, '0')}`;
    
    console.log('Nuevo número generado:', newNumberFormatted);
    
    return newNumberFormatted;
  } catch (error) {
    console.error('Error al obtener último número de cambio:', error);
    throw error;
  }
};

// Función auxiliar para obtener información del lubricentro
const getLubricentroInfo = async (lubricentroId: string) => {
  try {
    const lubricentroDoc = await getDoc(doc(db, 'lubricentros', lubricentroId));
    
    if (!lubricentroDoc.exists()) {
      return null;
    }
    
    const lubricentroData = lubricentroDoc.data() as Lubricentro;
    
    // Retornar solo la información necesaria para el PDF
    return {
      fantasyName: lubricentroData.fantasyName,
      razonSocial: lubricentroData.razonSocial,
      cuit: lubricentroData.cuit,
      responsable: lubricentroData.responsable,
      domicilio: lubricentroData.domicilio,
      email: lubricentroData.email,
      phone: lubricentroData.phone,
      logoUrl: lubricentroData.logoUrl,
    };
  } catch (error) {
    console.error('Error al obtener información del lubricentro:', error);
    return null;
  }
};

// Función para convertir datos de Firestore a CambioAceite - ACTUALIZADA
const convertFirestoreDataToCambio = async (doc: any): Promise<CambioAceite> => {
  const data = doc.data();
  
  // Obtener información del lubricentro
  const lubricentroInfo = await getLubricentroInfo(data.lubricentroId);
  
  // CORREGIR: Manejar createdAt problemático
  let createdAtDate: Date;
  
  if (data.createdAt) {
    // Si es un Timestamp de Firestore
    if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
      createdAtDate = data.createdAt.toDate();
    }
    // Si es un objeto con _methodName (serverTimestamp sin procesar)
    else if (data.createdAt._methodName === 'serverTimestamp') {
      // Usar fechaServicio como fallback para registros antiguos
      createdAtDate = data.fechaServicio?.toDate ? data.fechaServicio.toDate() : new Date();
    }
    // Si es una fecha válida
    else if (data.createdAt instanceof Date) {
      createdAtDate = data.createdAt;
    }
    // Si es un string de fecha
    else if (typeof data.createdAt === 'string') {
      createdAtDate = new Date(data.createdAt);
    }
    // Fallback final
    else {
      createdAtDate = data.fechaServicio?.toDate ? data.fechaServicio.toDate() : new Date();
    }
  } else {
    // Si no hay createdAt, usar fechaServicio
    createdAtDate = data.fechaServicio?.toDate ? data.fechaServicio.toDate() : new Date();
  }
  
  return {
    id: doc.id,
    nroCambio: data.nroCambio || 'S/N',
    nombreCliente: data.nombreCliente || '',
    celular: data.celular || '',
    dominioVehiculo: data.dominioVehiculo || '',
    marcaVehiculo: data.marcaVehiculo || '',
    modeloVehiculo: data.modeloVehiculo || '',
    añoVehiculo: data.añoVehiculo || '',
    tipoVehiculo: data.tipoVehiculo || '',
    kmActuales: data.kmActuales || 0,
    kmProximo: data.kmProximo || 0,
    fecha: data.fecha?.toDate ? data.fecha.toDate() : createdAtDate,
    fechaServicio: data.fechaServicio?.toDate ? data.fechaServicio.toDate() : createdAtDate,
    fechaProximoCambio: data.fechaProximoCambio?.toDate ? data.fechaProximoCambio.toDate() : new Date(),
    perioricidad_servicio: data.perioricidad_servicio || 3,
    tipoAceite: data.tipoAceite || '',
    marcaAceite: data.marcaAceite || '',
    sae: data.sae || '',
    cantidadAceite: data.cantidadAceite || '',
    filtroAceite: data.filtroAceite || false,
    filtroAceiteNota: data.filtroAceiteNota || '',
    filtroAire: data.filtroAire || false,
    filtroAireNota: data.filtroAireNota || '',
    filtroCombustible: data.filtroCombustible || false,
    filtroCombustibleNota: data.filtroCombustibleNota || '',
    filtroHabitaculo: data.filtroHabitaculo || false,
    filtroHabitaculoNota: data.filtroHabitaculoNota || '',
    aditivo: data.aditivo || false,
    aditivoNota: data.aditivoNota || '',
    engrase: data.engrase || false,
    engraseNota: data.engraseNota || '',
    refrigerante: data.refrigerante || false,
    refrigeranteNota: data.refrigeranteNota || '',
    caja: data.caja || false,
    cajaNota: data.cajaNota || '',
    diferencial: data.diferencial || false,
    diferencialNota: data.diferencialNota || '',
    observaciones: data.observaciones || '',
    lubricentroId: data.lubricentroId || '',
    lubricentroNombre: data.lubricentroNombre || '',
    operatorId: data.operatorId || '',
    nombreOperario: data.nombreOperario || '',
    
    // USAR LA FECHA CORREGIDA
    createdAt: createdAtDate,
    
    // Manejar estado
    estado: data.estado || 'completo',
    fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : createdAtDate,
    fechaCompletado: data.fechaCompletado?.toDate ? data.fechaCompletado.toDate() : undefined,
    usuarioCompletado: data.usuarioCompletado || data.operatorId,
    
    // Incluir información completa del lubricentro
    lubricentro: lubricentroInfo,
  } as CambioAceite;
};

  export const getCambiosPendientes = async (lubricentroId: string): Promise<CambioAceite[]> => {
    try {
      const q = query(
        collection(db, CAMBIOS_COLLECTION),
        where('lubricentroId', '==', lubricentroId),
        where('estado', '==', 'pendiente'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const cambiosPromises = querySnapshot.docs.map(doc => convertFirestoreDataToCambio(doc));
      
      return await Promise.all(cambiosPromises);
    } catch (error) {
      console.error('Error al obtener cambios pendientes:', error);
      throw error;
    }
  };
  // Función para completar un servicio pendiente
export const completarServicio = async (
  cambioId: string,
  formData: CambioAceiteFormValues,
  currentUser: User
): Promise<void> => {
  try {
    const docRef = doc(db, CAMBIOS_COLLECTION, cambioId);
    
    const updateData: any = {
      ...formData,
      estado: 'completo',
      fechaCompletado: serverTimestamp(),
      usuarioCompletado: currentUser.id,
      
      // Convertir fechas a Timestamp
      fechaServicio: formData.fechaServicio ? Timestamp.fromDate(formData.fechaServicio) : Timestamp.fromDate(new Date()),
      fechaProximoCambio: formData.fechaProximoCambio ? Timestamp.fromDate(formData.fechaProximoCambio) : Timestamp.fromDate(new Date()),
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error al completar servicio:', error);
    throw error;
  }
};

// Función para marcar como enviado
export const marcarComoEnviado = async (cambioId: string): Promise<void> => {
  try {
    const docRef = doc(db, CAMBIOS_COLLECTION, cambioId);
    
    await updateDoc(docRef, {
      estado: 'enviado'
    });
  } catch (error) {
    console.error('Error al marcar como enviado:', error);
    throw error;
  }
};

// Función para obtener todos los cambios de un lubricentro - ACTUALIZADA
export const getCambios = async (lubricentroId: string, limitCount = 50): Promise<CambioAceite[]> => {
  try {
    const q = query(
      collection(db, CAMBIOS_COLLECTION),
      where('lubricentroId', '==', lubricentroId),
      orderBy('createdAt', 'desc'), // ✅ Esto funcionará perfecto con registros nuevos
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Procesar documentos
    const cambiosPromises = querySnapshot.docs.map(doc => convertFirestoreDataToCambio(doc));
    const cambios = await Promise.all(cambiosPromises);
    
    return cambios; // Ya vienen ordenados de Firebase
  } catch (error) {
    console.error('Error al obtener cambios:', error);
    throw error;
  }
};

// Función para buscar cambios por dominio o cliente - ACTUALIZADA
export const searchCambios = async (
  lubricentroId: string, 
  searchTerm: string
): Promise<CambioAceite[]> => {
  try {
    // Búsqueda por dominio (exacta)
    const dominioQuery = query(
      collection(db, CAMBIOS_COLLECTION),
      where('lubricentroId', '==', lubricentroId),
      where('dominioVehiculo', '==', searchTerm.toUpperCase()),
      orderBy('createdAt', 'desc')
    );
    
    const dominioSnapshot = await getDocs(dominioQuery);
    
    // Si encontramos por dominio, devolvemos esos resultados
    if (!dominioSnapshot.empty) {
      const cambiosPromises = dominioSnapshot.docs.map(doc => convertFirestoreDataToCambio(doc));
      return await Promise.all(cambiosPromises);
    }
    
    // Si no encontramos por dominio, buscamos por nombre de cliente
    const clienteQuery = query(
      collection(db, CAMBIOS_COLLECTION),
      where('lubricentroId', '==', lubricentroId),
      orderBy('nombreCliente'),
      orderBy('createdAt', 'desc')
    );
    
    const clienteSnapshot = await getDocs(clienteQuery);
    
    // Filtrar resultados que contengan el término de búsqueda
    const searchTermLower = searchTerm.toLowerCase();
    
    const filteredDocs = clienteSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.nombreCliente.toLowerCase().includes(searchTermLower);
    });
    
    const cambiosPromises = filteredDocs.map(doc => convertFirestoreDataToCambio(doc));
    return await Promise.all(cambiosPromises);
  } catch (error) {
    console.error('Error al buscar cambios:', error);
    throw error;
  }
};

// Función para obtener un cambio por ID - ACTUALIZADA
export const getCambioById = async (cambioId: string): Promise<CambioAceite | null> => {
  try {
    const docRef = doc(db, CAMBIOS_COLLECTION, cambioId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    // Usar la función auxiliar para convertir datos y obtener info del lubricentro
    return await convertFirestoreDataToCambio(docSnap);
  } catch (error) {
    console.error('Error al obtener cambio por ID:', error);
    throw error;
  }
};

// Función para crear un cambio - ACTUALIZADA para incluir información del lubricentro
export const createCambio = async (
  formData: CambioAceiteFormValues & {
    nroCambio: string;
    lubricentroId: string;
    lubricentroNombre: string;
    operatorId: string;
    nombreOperario: string;
  },
  currentUser: User,
  lubricentro: Lubricentro
): Promise<string> => {
  try {
    // Preparar el objeto a guardar - COMPATIBLE CON SISTEMA WEB
    const cambioToSave = {
      // Campos del formulario
      ...formData,
      
      // NUEVOS CAMPOS para compatibilidad con sistema web:
      estado: 'completo', // Estado del cambio
      fechaCreacion: serverTimestamp(), // Fecha de creación
      fechaCompletado: serverTimestamp(), // Fecha de completado
      usuarioCompletado: currentUser.id, // Usuario que completó
      
      // Campos existentes
      lubricentroId: lubricentro.id,
      lubricentroNombre: lubricentro.fantasyName,
      operatorId: currentUser.id,
      nombreOperario: `${currentUser.nombre} ${currentUser.apellido}`,
      
      // Timestamps
      createdAt: serverTimestamp(),
      
      // Convertir fechas a Timestamp
      fecha: formData.fecha ? Timestamp.fromDate(formData.fecha) : Timestamp.fromDate(new Date()),
      fechaServicio: formData.fechaServicio ? Timestamp.fromDate(formData.fechaServicio) : Timestamp.fromDate(new Date()),
      fechaProximoCambio: formData.fechaProximoCambio ? Timestamp.fromDate(formData.fechaProximoCambio) : Timestamp.fromDate(new Date()),
    };
    
    console.log('Guardando cambio con datos:', cambioToSave);
    
    // Agregar el documento a Firestore
    const docRef = await addDoc(collection(db, CAMBIOS_COLLECTION), cambioToSave);
    
    return docRef.id;
  } catch (error) {
    console.error('Error al crear cambio:', error);
    throw error;
  }
};

// Función para actualizar un cambio
export const updateCambio = async (
  cambioId: string,
  data: CambioAceiteFormValues
): Promise<void> => {
  try {
    const docRef = doc(db, CAMBIOS_COLLECTION, cambioId);
    
    // Preparar los datos a actualizar
    const updateData: any = { ...data };
    
    // Convertir fechas a Timestamp si están presentes
    if (data.fecha) {
      updateData.fecha = Timestamp.fromDate(data.fecha);
    }
    
    if (data.fechaServicio) {
      updateData.fechaServicio = Timestamp.fromDate(data.fechaServicio);
    }
    
    if (data.fechaProximoCambio) {
      updateData.fechaProximoCambio = Timestamp.fromDate(data.fechaProximoCambio);
    }
    
    // Actualizar el documento
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error al actualizar cambio:', error);
    throw error;
  }
};

// Función para eliminar un cambio
export const deleteCambio = async (cambioId: string): Promise<void> => {
  try {
    const docRef = doc(db, CAMBIOS_COLLECTION, cambioId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar cambio:', error);
    throw error;
  }
};