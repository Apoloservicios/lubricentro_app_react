// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  HelperText, 
  ActivityIndicator 
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation';
import useAuth from '../../hooks/useAuth';
import { colors, commonStyles } from '../../styles/theme';
import { LoginFormValues } from '../../interfaces';

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

// Esquema de validación
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: Yup.string()
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, authState } = useAuth();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Valores iniciales para el formulario
  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };
  
  // Manejar el inicio de sesión
  const handleLogin = async (values: LoginFormValues) => {
    const success = await login(values.email, values.password);
    
    if (!success && authState.error?.includes('Lubricentro inactivo')) {
      navigation.navigate('Support');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/hisma_logo_vertical.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.subtitle}>Gestión de Cambios de Aceite</Text>
        </View>
        
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
            <View style={styles.formContainer}>
              <TextInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && !!errors.email}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" color={colors.primary} />}
              />
              {touched.email && errors.email && (
                <HelperText type="error" visible={true}>
                  {errors.email}
                </HelperText>
              )}
              
              <TextInput
                label="Contraseña"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && !!errors.password}
                style={styles.input}
                secureTextEntry={secureTextEntry}
                left={<TextInput.Icon icon="lock" color={colors.primary} />}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? 'eye' : 'eye-off'}
                    color={colors.primary}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
              />
              {touched.password && errors.password && (
                <HelperText type="error" visible={true}>
                  {errors.password}
                </HelperText>
              )}
              
              {authState.error && authState.error !== 'Usuario inactivo. Contacte a soporte.' && (
                <Text style={styles.errorText}>{authState.error}</Text>
              )}
              
              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                style={styles.button}
                disabled={isSubmitting}
                loading={isSubmitting || authState.isLoading}
              >
                Iniciar Sesión
              </Button>
              
              <TouchableOpacity
                style={styles.supportButton}
                onPress={() => navigation.navigate('Support')}
              >
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.supportText}>¿Problemas para acceder?</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.error,
    marginTop: 12,
    textAlign: 'center',
  },
  supportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  supportText: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 16,
  },
});

export default LoginScreen;