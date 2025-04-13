// src/styles/theme.ts
import { DefaultTheme } from 'react-native-paper';

// Paleta de colores en tonos verdes
export const colors = {
  primary: '#2E7D32', // Verde oscuro
  primaryLight: '#4CAF50', // Verde medio
  primaryLighter: '#8BC34A', // Verde claro
  accent: '#00796B', // Verde azulado
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#B71C1C',
  text: '#212121',
  textLight: '#757575',
  disabled: '#BDBDBD',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  divider: '#EEEEEE',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
};

// Tema personalizado para la aplicación
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: colors.backdrop,
  },
  roundness: 8,
};

// Estilos comunes para la aplicación
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  card: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  error: {
    color: colors.error,
    marginBottom: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
};

export default theme;