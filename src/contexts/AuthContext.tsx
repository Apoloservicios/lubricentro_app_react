// src/contexts/AuthContext.tsx (Versión corregida)
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import { User, Lubricentro, AuthState } from '../interfaces';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, Timestamp  } from 'firebase/firestore';
import { Alert } from 'react-native';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string, onError?: (errorType: string) => void) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  authState: { user: null, lubricentro: null, isLoading: true, error: null },
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    lubricentro: null,
    isLoading: true,
    error: null,
  });

  // Función para obtener los datos del usuario desde Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<{ user: User | null, lubricentro: Lubricentro | null, error?: string }> => {
    try {
      console.log('Fetching user data for:', firebaseUser.uid);
      
      // Obtener datos del usuario
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        console.error('Usuario no encontrado en Firestore');
        return { user: null, lubricentro: null, error: 'Usuario no encontrado en la base de datos' };
      }
      
      const userData = userDoc.data() as Omit<User, 'id'>;
      const user: User = {
        id: userDoc.id,
        ...userData,
        // Usar casting para que TypeScript entienda que estamos trabajando con Timestamps
        createdAt: userData.createdAt ? (userData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: userData.updatedAt ? (userData.updatedAt as unknown as Timestamp).toDate() : new Date(),
        lastLogin: userData.lastLogin ? (userData.lastLogin as unknown as Timestamp).toDate() : new Date(),
      };
      
      console.log('User data:', user);
      
      // Verificar estado del usuario
      if (user.estado !== 'activo') {
        console.warn('Usuario inactivo:', user.estado);
        return { user: null, lubricentro: null, error: 'Usuario inactivo. Contacte a soporte.' };
      }
      
      // Obtener datos del lubricentro
      console.log('Fetching lubricentro:', user.lubricentroId);
      const lubricentroDoc = await getDoc(doc(db, 'lubricentros', user.lubricentroId));
      
      if (!lubricentroDoc.exists()) {
        console.error('Lubricentro no encontrado:', user.lubricentroId);
        return { user, lubricentro: null, error: 'Lubricentro no encontrado' };
      }
      
      const lubricentroData = lubricentroDoc.data() as Omit<Lubricentro, 'id'>;
      const lubricentro: Lubricentro = {
        id: lubricentroDoc.id,
        ...lubricentroData,
        createdAt: lubricentroData.createdAt ? (lubricentroData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: lubricentroData.updatedAt ? (lubricentroData.updatedAt as unknown as Timestamp).toDate() : new Date(),
        trialEndDate: lubricentroData.trialEndDate ? (lubricentroData.trialEndDate as unknown as Timestamp).toDate() : new Date(),
      };
      
      console.log('Lubricentro data:', lubricentro);
      console.log('Lubricentro estado:', lubricentro.estado);
      
      // Verificar estado del lubricentro - Corregir lógica
      if (lubricentro.estado === 'inactive' || lubricentro.estado === 'suspended') {
        console.warn('Lubricentro inactivo:', lubricentro.estado);
        return { user, lubricentro: null, error: 'Su lubricentro se encuentra desactivado. Por favor contacte a info@hisma.com.ar para más información.' };
      }
      
      // Verificar fecha de trial - Solo si está en trial
      if (lubricentro.estado === 'trial') {
        const trialEndDate = lubricentro.trialEndDate || new Date();
        if (new Date() > trialEndDate) {
          console.warn('Período de prueba finalizado:', trialEndDate);
          return { user, lubricentro: null, error: 'El período de prueba ha finalizado. Contacte a info@hisma.com.ar para activar su cuenta.' };
        }
      }
      
      console.log('Authentication successful');
      return { user, lubricentro };
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      return { user: null, lubricentro: null, error: `Error al cargar datos: ${error.message}` };
    }
  };

  // Efecto para observar el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { user, lubricentro, error } = await fetchUserData(firebaseUser);
          
          if (user && lubricentro) {
            setAuthState({
              user,
              lubricentro,
              isLoading: false,
              error: null,
            });
          } else {
            // Si no se encontró el usuario o lubricentro, cerrar sesión
            await signOut(auth);
            setAuthState({
              user: null,
              lubricentro: null,
              isLoading: false,
              error: error || 'No se pudo cargar los datos',
            });
          }
        } catch (error: any) {
          console.error('Error in auth state change:', error.message);
          await signOut(auth);
          setAuthState({
            user: null,
            lubricentro: null,
            isLoading: false,
            error: 'Error de autenticación',
          });
        }
      } else {
        // Usuario no autenticado
        setAuthState({
          user: null,
          lubricentro: null,
          isLoading: false,
          error: null,
        });
      }
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Función de inicio de sesión mejorada
  const login = async (email: string, password: string, onError?: (errorType: string) => void): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Attempting login for:', email);
      
      // Intentar inicio de sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('Firebase Auth successful, fetching user data...');
      
      // Obtener datos adicionales del usuario y lubricentro
      const { user, lubricentro, error } = await fetchUserData(firebaseUser);
      
      if (!user) {
        throw new Error(error || 'No se pudo cargar los datos del usuario');
      }
      
      if (!lubricentro) {
        throw new Error(error || 'No se pudo cargar los datos del lubricentro');
      }
      
      setAuthState({
        user,
        lubricentro,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      let errorTitle = 'Error de autenticación';
      let errorType = 'error_general';
      
      // Errores de Firebase Auth
      if (error.code === 'auth/user-not-found') {
        errorTitle = 'Usuario no encontrado';
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      } else if (error.code === 'auth/wrong-password') {
        errorTitle = 'Contraseña incorrecta';
        errorMessage = 'La contraseña ingresada es incorrecta.';
      } else if (error.code === 'auth/invalid-email') {
        errorTitle = 'Email inválido';
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorTitle = 'Demasiados intentos';
        errorMessage = 'Se han realizado demasiados intentos fallidos. Intente más tarde.';
      } 
      // Errores personalizados
      else if (error.message?.includes('Usuario inactivo')) {
        errorTitle = 'Usuario deshabilitado';
        errorMessage = 'Su cuenta de usuario ha sido desactivada. Por favor, contacte a info@hisma.com.ar para más información.';
        errorType = 'usuario_inactivo';
      } else if (error.message?.includes('lubricentro se encuentra desactivado')) {
        errorTitle = 'Lubricentro desactivado';
        errorMessage = error.message;
        errorType = 'lubricentro_inactivo';
      } else if (error.message?.includes('período de prueba ha finalizado')) {
        errorTitle = 'Período de prueba finalizado';
        errorMessage = error.message;
        errorType = 'periodo_prueba_finalizado';
      } else if (error.message?.includes('Lubricentro no encontrado')) {
        errorTitle = 'Error de configuración';
        errorMessage = 'No se pudo encontrar la información del lubricentro. Contacte a info@hisma.com.ar para obtener ayuda.';
        errorType = 'lubricentro_no_encontrado';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      // Mostrar alerta con mensaje detallado
      Alert.alert(
        errorTitle, 
        errorMessage,
        [
          {
            text: 'OK',
            style: 'default',
          }
        ]
      );
      
      // Llamar al callback si existe
      if (onError) {
        onError(errorType);
      }
      
      return false;
    }
  };

  // Función de cierre de sesión
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await signOut(auth);
      setAuthState({
        user: null,
        lubricentro: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error en logout:', error.message);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al cerrar sesión',
      }));
    }
  };

  // Función para refrescar datos del usuario
  const refreshUser = async (): Promise<void> => {
    if (!auth.currentUser) return;
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { user, lubricentro, error } = await fetchUserData(auth.currentUser);
      
      if (user && lubricentro) {
        setAuthState({
          user,
          lubricentro,
          isLoading: false,
          error: null,
        });
      } else {
        // Si no se encontró el usuario o lubricentro, cerrar sesión
        await signOut(auth);
        setAuthState({
          user: null,
          lubricentro: null,
          isLoading: false,
          error: error || 'No se pudo cargar los datos',
        });
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error.message);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al actualizar datos del usuario',
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;