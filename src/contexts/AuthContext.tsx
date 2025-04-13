// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import { User, Lubricentro, AuthState } from '../interfaces';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs,Timestamp  } from 'firebase/firestore';
import { Alert } from 'react-native';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
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
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<{ user: User | null, lubricentro: Lubricentro | null }> => {
    try {
      // Obtener datos del usuario
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
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
      // Verificar estado del usuario
      if (user.estado !== 'activo') {
        throw new Error('Usuario inactivo. Contacte a soporte.');
      }
      
      // Obtener datos del lubricentro
      const lubricentroDoc = await getDoc(doc(db, 'lubricentros', user.lubricentroId));
      
      if (!lubricentroDoc.exists()) {
        throw new Error('Lubricentro no encontrado');
      }
      
      const lubricentroData = lubricentroDoc.data() as Omit<Lubricentro, 'id'>;
      const lubricentro: Lubricentro = {
        id: lubricentroDoc.id,
        ...lubricentroData,
        createdAt: lubricentroData.createdAt ? (lubricentroData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: lubricentroData.updatedAt ? (lubricentroData.updatedAt as unknown as Timestamp).toDate() : new Date(),
        trialEndDate: lubricentroData.trialEndDate ? (lubricentroData.trialEndDate as unknown as Timestamp).toDate() : new Date(),
      };
      
      // Verificar estado del lubricentro
      if (lubricentro.estado !== 'active' && lubricentro.estado !== 'trial') {
        throw new Error('Lubricentro inactivo. Contacte a soporte.');
      }
      
      // Verificar fecha de trial
      if (lubricentro.estado === 'trial' && new Date() > lubricentro.trialEndDate) {
        throw new Error('Período de prueba finalizado. Contacte a soporte.');
      }
      
      return { user, lubricentro };
    } catch (error: any) {
      console.error('Error fetching user data:', error.message);
      return { user: null, lubricentro: null };
    }
  };

  // Efecto para observar el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { user, lubricentro } = await fetchUserData(firebaseUser);
          
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
              error: 'No se pudo cargar los datos del usuario',
            });
          }
        } catch (error: any) {
          console.error('Error in auth state change:', error.message);
          await signOut(auth);
          setAuthState({
            user: null,
            lubricentro: null,
            isLoading: false,
            error: error.message,
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

  // Función de inicio de sesión
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Intentar inicio de sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Obtener datos adicionales del usuario y lubricentro
      const { user, lubricentro } = await fetchUserData(firebaseUser);
      
      if (!user || !lubricentro) {
        throw new Error('No se pudo cargar los datos del usuario');
      }
      
      setAuthState({
        user,
        lubricentro,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error en login:', error.message);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Correo electrónico o contraseña incorrectos';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      Alert.alert('Error de autenticación', errorMessage);
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
      const { user, lubricentro } = await fetchUserData(auth.currentUser);
      
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
          error: 'No se pudo cargar los datos del usuario',
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