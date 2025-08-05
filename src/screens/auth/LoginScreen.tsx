// src/screens/auth/LoginScreen.tsx - VERSIÓN MEJORADA CON ERRORES AMIGABLES
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert 
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  HelperText, 
  ActivityIndicator,
  Card,
  Chip
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation';
import useAuth from '../../hooks/useAuth';
import { colors, commonStyles } from '../../styles/theme';
import { LoginFormValues } from '../../interfaces';
import { shouldRedirectToSupport, getErrorTips } from '../../utils/authErrorHandler';

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

// === ESQUEMA DE VALIDACIÓN ===
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Por favor, ingresa un email válido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, authState } = useAuth();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [lastErrorType, setLastErrorType] = useState<string | null>(null);
  
  // Valores iniciales para el formulario
  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };
  
  // === MANEJAR LOGIN CON ERRORES MEJORADOS ===
  const handleLogin = async (values: LoginFormValues, { setSubmitting }: any) => {
    try {
      setLastErrorType(null); // Limpiar error anterior
      
      const success = await login(values.email, values.password, (errorType: string) => {
        setLastErrorType(errorType);
        
        // Redirigir a soporte si es necesario
        if (shouldRedirectToSupport(errorType)) {
          // Pequeño delay para que se vea la alerta primero
          setTimeout(() => {
            navigation.navigate('Support');
          }, 1000);
        }
      });
      
      if (success) {
        // Login exitoso - La navegación se maneja automáticamente
        console.log('✅ Login successful, navigating...');
      }
      
    } catch (error) {
      console.error('❌ Unexpected error in handleLogin:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // === OBTENER CONSEJOS PARA EL ÚLTIMO ERROR ===
  const errorTips = lastErrorType ? getErrorTips(lastErrorType) : [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* === LOGO Y TÍTULO === */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/hisma_logo_vertical.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>HISMA</Text>
          <Text style={styles.subtitle}>Gestión de Cambios de Aceite</Text>
        </View>
        
        {/* === FORMULARIO DE LOGIN === */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Formik
              initialValues={initialValues}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({ 
                handleChange, 
                handleBlur, 
                handleSubmit, 
                values, 
                errors, 
                touched,
                isSubmitting 
              }) => (
                <>
                  {/* Campo Email */}
                  <TextInput
                    label="Correo electrónico"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && !!errors.email}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    left={<TextInput.Icon icon="email" color={colors.primary} />}
                    disabled={isSubmitting}
                  />
                  {touched.email && errors.email && (
                    <HelperText type="error" visible={true}>
                      {errors.email}
                    </HelperText>
                  )}
                  
                  {/* Campo Contraseña */}
                  <TextInput
                    label="Contraseña"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && !!errors.password}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry={secureTextEntry}
                    autoComplete="password"
                    left={<TextInput.Icon icon="lock" color={colors.primary} />}
                    right={
                      <TextInput.Icon
                        icon={secureTextEntry ? 'eye' : 'eye-off'}
                        color={colors.primary}
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      />
                    }
                    disabled={isSubmitting}
                  />
                  {touched.password && errors.password && (
                    <HelperText type="error" visible={true}>
                      {errors.password}
                    </HelperText>
                  )}
                  
                  {/* === CONSEJOS DE ERROR (si hay) === */}
                  {errorTips.length > 0 && (
                    <Card style={styles.tipsCard}>
                      <Card.Content>
                        <Text style={styles.tipsTitle}>💡 Consejos:</Text>
                        {errorTips.map((tip, index) => (
                          <Text key={index} style={styles.tipText}>{tip}</Text>
                        ))}
                      </Card.Content>
                    </Card>
                  )}
                  
                  {/* === BOTÓN DE LOGIN === */}
                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}  // ✅ CORRECCIÓN 3: Llamar función directamente
                    style={styles.loginButton}
                    contentStyle={styles.loginButtonContent}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                  
                  {/* === INDICADOR DE CARGA === */}
                  {authState.isLoading && !isSubmitting && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator animating={true} color={colors.primary} />
                      <Text style={styles.loadingText}>Cargando datos...</Text>
                    </View>
                  )}
                </>
              )}
            </Formik>
          </Card.Content>
        </Card>
        
        {/* === INFORMACIÓN DE CONTACTO === */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>¿Necesitas ayuda?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Support')}
            style={styles.supportButton}
            icon="help-circle"
          >
            Contactar Soporte
          </Button>
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// === ESTILOS ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  formCard: {
    marginBottom: 20,
    elevation: 4,
  },
  
  input: {
    marginBottom: 8,
  },
  
  tipsCard: {
    backgroundColor: '#E3F2FD',
    marginVertical: 16,
    elevation: 2,
  },
  
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  
  tipText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  
  loginButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  
  loginButtonContent: {
    paddingVertical: 8,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
  },
  
  contactContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  contactTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    opacity: 0.7,
  },
  
  supportButton: {
    marginTop: 8,
  },
});

export default LoginScreen;