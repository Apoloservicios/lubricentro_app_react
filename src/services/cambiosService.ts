// src/services/cambiosService.ts - Corregido
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
    
    // Consultar el último cambio para ese lubricentro
    const q = query(
      collection(db, CAMBIOS_COLLECTION),
      where('lubricentroId', '==', lubricentroId),
      orderBy('createdAt', 'desc'),
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
    
    // Extraer el número y aumentarlo
    const matches = lastNumber.match(/(\w+)-(\d+)/);
    
    if (!matches || matches.length < 3) {
      return `${prefix}-00001`;
    }
    
    const lastNumberInt = parseInt(matches[2]);
    const newNumber = lastNumberInt + 1;
    
    // Formatear el nuevo número con ceros a la izquierda
    return `${prefix}-${newNumber.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error('Error al obtener último número de cambio:', error);
    throw error;
  }
};

// Función para obtener todos los cambios de un lubricentro
export const getCambios = async (lubricentroId: string, limitCount = 20): Promise<CambioAceite[]> => {
  try {
    const q = query(
      collection(db, CAMBIOS_COLLECTION),
      where('lubricentroId', '==', lubricentroId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate(),
        fechaServicio: data.fechaServicio?.toDate(),
        fechaProximoCambio: data.fechaProximoCambio?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as CambioAceite;
    });
  } catch (error) {
    console.error('Error al obtener cambios:', error);
    throw error;
  }
};

// Función para buscar cambios por dominio o cliente
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
      return dominioSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate(),
          fechaServicio: data.fechaServicio?.toDate(),
          fechaProximoCambio: data.fechaProximoCambio?.toDate(),
          createdAt: data.createdAt?.toDate(),
        } as CambioAceite;
      });
    }
    
    // Si no encontramos por dominio, buscamos por nombre de cliente
    // Firestore no soporta búsquedas parciales directamente, así que hacemos una búsqueda amplia
    // y filtramos los resultados en el cliente
    const clienteQuery = query(
      collection(db, CAMBIOS_COLLECTION),
      where('lubricentroId', '==', lubricentroId),
      orderBy('nombreCliente'),
      orderBy('createdAt', 'desc')
    );
    
    const clienteSnapshot = await getDocs(clienteQuery);
    
    // Filtrar resultados que contengan el término de búsqueda
    const searchTermLower = searchTerm.toLowerCase();
    
    return clienteSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.nombreCliente.toLowerCase().includes(searchTermLower);
      })
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate(),
          fechaServicio: data.fechaServicio?.toDate(),
          fechaProximoCambio: data.fechaProximoCambio?.toDate(),
          createdAt: data.createdAt?.toDate(),
        } as CambioAceite;
      });
  } catch (error) {
    console.error('Error al buscar cambios:', error);
    throw error;
  }
};

// Función para obtener un cambio por ID
export const getCambioById = async (cambioId: string): Promise<CambioAceite | null> => {
  try {
    const docRef = doc(db, CAMBIOS_COLLECTION, cambioId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      ...data,
      fecha: data.fecha?.toDate(),
      fechaServicio: data.fechaServicio?.toDate(),
      fechaProximoCambio: data.fechaProximoCambio?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as CambioAceite;
  } catch (error) {
    console.error('Error al obtener cambio por ID:', error);
    throw error;
  }
};

// Función para crear un cambio - CORREGIDA
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
    // Preparar el objeto a guardar - asegurándonos de que todas las fechas estén presentes
    const cambioToSave = {
      // Campos del formulario
      ...formData,
      // Campos adicionales requeridos
      lubricentroId: lubricentro.id,
      lubricentroNombre: lubricentro.fantasyName,
      operatorId: currentUser.id,
      nombreOperario: `${currentUser.nombre} ${currentUser.apellido}`,
      // Timestamp de creación
      createdAt: serverTimestamp(),
      // Convertir fechas a Timestamp - asegurándonos de que existan
      fecha: formData.fecha ? Timestamp.fromDate(formData.fecha) : Timestamp.fromDate(new Date()),
      fechaServicio: formData.fechaServicio ? Timestamp.fromDate(formData.fechaServicio) : Timestamp.fromDate(new Date()),
      fechaProximoCambio: formData.fechaProximoCambio ? Timestamp.fromDate(formData.fechaProximoCambio) : Timestamp.fromDate(new Date()),
    };
    
    // Agregar el documento a Firestore
    const docRef = await addDoc(collection(db, CAMBIOS_COLLECTION), cambioToSave);
    
    return docRef.id;
  } catch (error) {
    console.error('Error al crear cambio:', error);
    throw error;
  }
};

// Función para actualizar un cambio - CORREGIDA
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