// src/utils/authErrorHandler.ts - MANEJADOR DE ERRORES DE AUTENTICACIÓN AMIGABLES

/**
 * Interfaz para definir un error de autenticación personalizado
 */
export interface AuthError {
  title: string;       // Título del error para mostrar en Alert
  message: string;     // Mensaje descriptivo y amigable
  type: string;        // Tipo de error para manejo programático
  showSupport: boolean; // Si debe mostrar opción de contactar soporte
}

/**
 * Mapea los códigos de error de Firebase a mensajes amigables en español
 * @param firebaseErrorCode - Código de error de Firebase
 * @param errorMessage - Mensaje original del error
 * @returns AuthError - Objeto con información del error formateada
 */
export const getAuthError = (firebaseErrorCode: string, errorMessage?: string): AuthError => {
  
  // === ERRORES DE FIREBASE AUTH ===
  switch (firebaseErrorCode) {
    
    // ❌ Usuario no encontrado
    case 'auth/user-not-found':
      return {
        title: 'Usuario no encontrado',
        message: 'No existe una cuenta registrada con este correo electrónico.\n\n¿Estás seguro de que el email es correcto?',
        type: 'user_not_found',
        showSupport: false
      };
    
    // ❌ Contraseña incorrecta  
    case 'auth/wrong-password':
      return {
        title: 'Contraseña incorrecta',
        message: 'La contraseña que ingresaste no es correcta.\n\n¿Olvidaste tu contraseña? Contacta a soporte para restablecerla.',
        type: 'wrong_password',
        showSupport: true
      };
    
    // ❌ Email con formato inválido
    case 'auth/invalid-email':
      return {
        title: 'Email inválido',
        message: 'El formato del correo electrónico no es válido.\n\nPor favor, verifica que hayas escrito correctamente tu email.',
        type: 'invalid_email',
        showSupport: false
      };
    
    // ❌ Demasiados intentos fallidos
    case 'auth/too-many-requests':
      return {
        title: 'Demasiados intentos',
        message: 'Se han realizado demasiados intentos de inicio de sesión fallidos.\n\nPor favor, espera unos minutos antes de intentar nuevamente.',
        type: 'too_many_requests',
        showSupport: false
      };
    
    // ❌ Credenciales inválidas (nuevo error común de Firebase v9+)
    case 'auth/invalid-credential':
      return {
        title: 'Credenciales incorrectas',
        message: 'El email o la contraseña son incorrectos.\n\nPor favor, verifica tus datos e intenta nuevamente.',
        type: 'invalid_credentials',
        showSupport: true
      };
    
    // ❌ Usuario deshabilitado
    case 'auth/user-disabled':
      return {
        title: 'Cuenta deshabilitada',
        message: 'Tu cuenta ha sido deshabilitada por un administrador.\n\nContacta a soporte para más información.',
        type: 'user_disabled',
        showSupport: true
      };
    
    // ❌ Red o conexión
    case 'auth/network-request-failed':
      return {
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor.\n\nVerifica tu conexión a internet e intenta nuevamente.',
        type: 'network_error',
        showSupport: false
      };
    
    // ❌ Operación no permitida
    case 'auth/operation-not-allowed':
      return {
        title: 'Operación no permitida',
        message: 'El inicio de sesión con email/contraseña no está habilitado.\n\nContacta al administrador del sistema.',
        type: 'operation_not_allowed',
        showSupport: true
      };
    
    // ❌ Contraseña muy débil
    case 'auth/weak-password':
      return {
        title: 'Contraseña muy débil',
        message: 'La contraseña debe tener al menos 6 caracteres.\n\nPor favor, elige una contraseña más segura.',
        type: 'weak_password',
        showSupport: false
      };
    
    // ❌ Email ya en uso
    case 'auth/email-already-in-use':
      return {
        title: 'Email ya registrado',
        message: 'Ya existe una cuenta con este correo electrónico.\n\n¿Quieres intentar iniciar sesión en su lugar?',
        type: 'email_in_use',
        showSupport: false
      };
    
    // === ERRORES PERSONALIZADOS DEL SISTEMA ===
    default:
      // Analizar errores personalizados por mensaje
      const message = errorMessage?.toLowerCase() || '';
      
      // 🚫 Usuario inactivo
      if (message.includes('usuario inactivo') || message.includes('contacte a soporte')) {
        return {
          title: 'Usuario deshabilitado',
          message: 'Tu cuenta de usuario ha sido desactivada.\n\n📧 Contacta a info@hisma.com.ar para reactivarla.',
          type: 'usuario_inactivo',
          showSupport: true
        };
      }
      
      // 🏪 Lubricentro desactivado
      if (message.includes('lubricentro') && (message.includes('desactivado') || message.includes('inactivo'))) {
        return {
          title: 'Lubricentro inactivo',
          message: 'El lubricentro al que perteneces está desactivado.\n\n📧 Contacta a info@hisma.com.ar para más información.',
          type: 'lubricentro_inactivo',
          showSupport: true
        };
      }
      
      // ⏰ Período de prueba finalizado
      if (message.includes('período de prueba') || message.includes('trial')) {
        return {
          title: 'Período de prueba finalizado',
          message: 'El período de prueba gratuito ha expirado.\n\n📧 Contacta a info@hisma.com.ar para activar tu cuenta.',
          type: 'periodo_prueba_finalizado',
          showSupport: true
        };
      }
      
      // 🔍 Lubricentro no encontrado
      if (message.includes('lubricentro no encontrado') || message.includes('configuración')) {
        return {
          title: 'Error de configuración',
          message: 'No se pudo encontrar la información del lubricentro.\n\n📧 Contacta a info@hisma.com.ar para resolver este problema.',
          type: 'lubricentro_no_encontrado',
          showSupport: true
        };
      }
      
      // 🌐 Error de red/carga de datos
      if (message.includes('cargar datos') || message.includes('network') || message.includes('timeout')) {
        return {
          title: 'Error de conexión',
          message: 'No se pudieron cargar los datos del servidor.\n\nVerifica tu conexión a internet e intenta nuevamente.',
          type: 'network_error',
          showSupport: false
        };
      }
      
      // ❓ Error genérico - mostrar mensaje original si es comprensible
      return {
        title: 'Error de autenticación',
        message: errorMessage && errorMessage.length < 200 
          ? `${errorMessage}\n\nSi el problema persiste, contacta a soporte.`
          : 'Ocurrió un error inesperado al iniciar sesión.\n\nPor favor, intenta nuevamente o contacta a soporte si el problema persiste.',
        type: 'error_general',
        showSupport: true
      };
  }
};

/**
 * Determina si un error debe redirigir a la pantalla de soporte
 * @param errorType - Tipo de error retornado por getAuthError
 * @returns boolean - true si debe redirigir a soporte
 */
export const shouldRedirectToSupport = (errorType: string): boolean => {
  const supportRedirectTypes = [
    'usuario_inactivo',
    'lubricentro_inactivo', 
    'periodo_prueba_finalizado',
    'lubricentro_no_encontrado',
    'user_disabled'
  ];
  
  return supportRedirectTypes.includes(errorType);
};

/**
 * Obtiene el texto del botón de soporte según el tipo de error
 * @param errorType - Tipo de error
 * @returns string - Texto del botón
 */
export const getSupportButtonText = (errorType: string): string => {
  switch (errorType) {
    case 'usuario_inactivo':
    case 'user_disabled':
      return 'Contactar para reactivar cuenta';
    
    case 'lubricentro_inactivo':
      return 'Contactar sobre lubricentro';
    
    case 'periodo_prueba_finalizado':
      return 'Activar cuenta completa';
    
    case 'wrong_password':
    case 'invalid_credentials':
      return 'Recuperar contraseña';
    
    default:
      return 'Contactar soporte';
  }
};

/**
 * Obtiene consejos adicionales para mostrar al usuario según el tipo de error
 * @param errorType - Tipo de error
 * @returns string[] - Array de consejos o array vacío
 */
export const getErrorTips = (errorType: string): string[] => {
  switch (errorType) {
    case 'invalid_email':
      return [
        '• Verifica que no hayan espacios extra',
        '• Asegúrate de incluir @ y un dominio válido',
        '• Ejemplo: usuario@ejemplo.com'
      ];
    
    case 'wrong_password':
    case 'invalid_credentials':
      return [
        '• Verifica que no esté activado Caps Lock',
        '• Las contraseñas distinguen mayúsculas y minúsculas',
        '• Intenta escribir la contraseña en un editor de texto primero'
      ];
    
    case 'network_error':
      return [
        '• Verifica tu conexión WiFi o datos móviles',
        '• Intenta cerrar y abrir la aplicación',
        '• Si usas WiFi corporativo, puede haber restricciones'
      ];
    
    default:
      return [];
  }
};