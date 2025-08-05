// src/contexts/AuthContext.tsx - ERRORES TYPESCRIPT CORREGIDOS
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import { User, Lubricentro, AuthState } from '../interfaces';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, Timestamp  } from 'firebase/firestore';
import { Alert } from 'react-native';
import { getAuthError, shouldRedirectToSupport, getSupportButtonText } from '../utils/authErrorHandler';

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

  // === FUNCIÓN PARA OBTENER DATOS DEL USUARIO ===
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<{ user: User | null, lubricentro: Lubricentro | null, error?: string }> => {
    try {
      console.log('Fetching user data for:', firebaseUser.uid);
      
      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        console.error('Usuario no encontrado en Firestore');
        return { user: null, lubricentro: null, error: 'Usuario no encontrado en la base de datos' };
      }
      
      const userData = userDoc.data() as Omit<User, 'id'>;
      const user: User = {
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt ? (userData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: userData.updatedAt ? (userData.updatedAt as unknown as Timestamp).toDate() : new Date(),
        lastLogin: userData.lastLogin ? (userData.lastLogin as unknown as Timestamp).toDate() : new Date(),
      };
      
      console.log('User data loaded:', user.email);
      
      // ✅ Verificar estado del usuario
      if (user.estado !== 'activo') {
        console.warn('Usuario inactivo:', user.estado);
        return { user: null, lubricentro: null, error: 'Usuario inactivo. Contacte a soporte.' };
      }
      
      // Obtener datos del lubricentro
      console.log('Fetching lubricentro data for:', user.lubricentroId);
      const lubricentroDoc = await getDoc(doc(db, 'lubricentros', user.lubricentroId));
      
      if (!lubricentroDoc.exists()) {
        console.error('Lubricentro no encontrado');
        return { user, lubricentro: null, error: 'Lubricentro no encontrado. Contacte a info@hisma.com.ar para obtener ayuda.' };
      }
      
      const lubricentroData = lubricentroDoc.data() as Omit<Lubricentro, 'id'>;
      const lubricentro: Lubricentro = {
        id: lubricentroDoc.id,
        ...lubricentroData,
        createdAt: lubricentroData.createdAt ? (lubricentroData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: lubricentroData.updatedAt ? (lubricentroData.updatedAt as unknown as Timestamp).toDate() : new Date(),
        // ✅ CORRECCIÓN 1: Usar undefined en lugar de new Date() para trialEndDate
        trialEndDate: lubricentroData.trialEndDate ? (lubricentroData.trialEndDate as unknown as Timestamp).toDate() : undefined,
      };
      
      console.log('Lubricentro data loaded:', lubricentro.fantasyName);
      
      // ✅ CORRECCIÓN 2: Verificar estado del lubricentro con valores correctos
      if (lubricentro.estado === 'inactive' || lubricentro.estado === 'inactivo' || lubricentro.estado === 'suspended') {
        console.warn('Lubricentro inactivo:', lubricentro.estado);
        return { user, lubricentro: null, error: 'El lubricentro se encuentra desactivado. Por favor contacte a info@hisma.com.ar para más información.' };
      }
      
      // ✅ Verificar período de prueba solo si está en trial
      if (lubricentro.estado === 'trial') {
        const trialEndDate = lubricentro.trialEndDate || new Date();
        if (new Date() > trialEndDate) {
          console.warn('Período de prueba finalizado:', trialEndDate);
          return { user, lubricentro: null, error: 'El período de prueba ha finalizado. Contacte a info@hisma.com.ar para activar su cuenta.' };
        }
      }
      
      console.log('✅ Authentication successful');
      return { user, lubricentro };
      
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      return { user: null, lubricentro: null, error: `Error al cargar datos: ${error.message}` };
    }
  };

  // === FUNCIÓN DE LOGIN MEJORADA ===
  const login = async (
    email: string, 
    password: string, 
    onError?: (errorType: string) => void
  ): Promise<boolean> => {
    try {
      // Mostrar estado de carga
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔐 Attempting login for:', email);
      
      // Intentar autenticación con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('🔥 Firebase Auth successful, fetching user data...');
      
      // Obtener datos adicionales del usuario y lubricentro
      const { user, lubricentro, error } = await fetchUserData(firebaseUser);
      
      if (!user) {
        throw new Error(error || 'No se pudo cargar los datos del usuario');
      }
      
      if (!lubricentro) {
        throw new Error(error || 'No se pudo cargar los datos del lubricentro');
      }
      
      // ✅ Login exitoso
      setAuthState({
        user,
        lubricentro,
        isLoading: false,
        error: null,
      });
      
      console.log('✅ Login successful for:', user.email);
      return true;
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // === PROCESAR ERROR CON MENSAJES AMIGABLES ===
      const authError = getAuthError(error.code || 'unknown', error.message);
      
      // Actualizar estado con error
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message,
      }));
      
      // === MOSTRAR ALERTA CON ERROR AMIGABLE ===
      const alertButtons = [];
      
      // Botón principal (OK)
      alertButtons.push({
        text: 'Entendido',
        style: 'default' as const,
      });
      
      // Botón de soporte si corresponde
      if (authError.showSupport) {
        alertButtons.unshift({
          text: getSupportButtonText(authError.type),
          style: 'default' as const,
          onPress: () => {
            if (onError) {
              onError(authError.type);
            }
          },
        });
      }
      
      // Mostrar alerta amigable
      Alert.alert(
        authError.title,
        authError.message,
        alertButtons
      );
      
      // Llamar callback con tipo de error
      if (onError) {
        onError(authError.type);
      }
      
      return false;
    }
  };

  // === FUNCIÓN DE LOGOUT ===
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
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout error:', error.message);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al cerrar sesión',
      }));
    }
  };

  // === FUNCIÓN PARA REFRESCAR DATOS DEL USUARIO ===
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
      console.error('❌ Error refreshing user:', error.message);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al actualizar datos del usuario',
      }));
    }
  };

  // === OBSERVER DE ESTADO DE AUTENTICACIÓN ===
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
            // Si no se encontró el usuario o lubricentro, cerrar sesión silenciosamente
            await signOut(auth);
            setAuthState({
              user: null,
              lubricentro: null,
              isLoading: false,
              error: error || 'No se pudo cargar los datos',
            });
          }
        } catch (error: any) {
          console.error('❌ Error in auth state change:', error.message);
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

  return (
    <AuthContext.Provider value={{ authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;