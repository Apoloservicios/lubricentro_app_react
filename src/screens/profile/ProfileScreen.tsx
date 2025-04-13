// src/screens/profile/ProfileScreen.tsx
import React from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Linking } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Avatar, 
  Divider, 
  List, 
  Switch, 
  IconButton 
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../../hooks/useAuth';
import { colors } from '../../styles/theme';
import { formatDateTime } from '../../utils/helpers';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const ProfileScreen: React.FC = () => {
  const { authState, logout, refreshUser } = useAuth();
  const { user, lubricentro } = authState;
  
  // Manejar cierre de sesión
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };
  
  // Manejar contacto con soporte
  const handleContactSupport = () => {
    // Abrir correo electrónico
    Linking.openURL('mailto:soporte@lubricentroapp.com?subject=Soporte%20Lubricentro%20App');
  };
  
  if (!user || !lubricentro) {
    return null;
  }
  
  // Verificar si el periodo de prueba está activo
  const isTrial = lubricentro.estado === 'trial';
  const trialDaysLeft = isTrial ? 
    moment(lubricentro.trialEndDate).diff(moment(), 'days') : 0;
  
  // Determinar estado de activación
  const isActive = lubricentro.estado === 'active' || 
    (isTrial && trialDaysLeft > 0);
  
  return (
    <ScrollView style={styles.container}>
      {/* Sección de Perfil de Usuario */}
      <View style={styles.header}>
        <Avatar.Image 
          size={100} 
          source={
            user.photoURL ? 
            { uri: user.photoURL } : 
            require('../../../assets/images/avatar-placeholder.png')
          } 
          style={styles.avatar}
        />
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.nombre} {user.apellido}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userStatusContainer}>
            <Text style={styles.userStatus}>
              Estado: {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Text>
            {user.estado === 'activo' && (
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            )}
          </View>
        </View>
      </View>
      
      {/* Sección de Información del Lubricentro */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.lubricentroHeader}>
            <Text style={styles.cardTitle}>Información del Lubricentro</Text>
            {lubricentro.logoUrl && (
              <Image 
                source={{ uri: lubricentro.logoUrl }} 
                style={styles.logo}
                resizeMode="contain"
              />
            )}
          </View>
          
          <List.Item
            title="Nombre"
            description={lubricentro.fantasyName}
            left={props => <List.Icon {...props} icon="store" />}
          />
          
          <List.Item
            title="CUIT"
            description={lubricentro.cuit}
            left={props => <List.Icon {...props} icon="card-account-details" />}
          />
          
          <List.Item
            title="Responsable"
            description={lubricentro.responsable}
            left={props => <List.Icon {...props} icon="account-tie" />}
          />
          
          <List.Item
            title="Domicilio"
            description={lubricentro.domicilio}
            left={props => <List.Icon {...props} icon="map-marker" />}
          />
          
          <List.Item
            title="Contacto"
            description={lubricentro.email}
            descriptionNumberOfLines={2}
            left={props => <List.Icon {...props} icon="email" />}
          />
          
          <List.Item
            title="Teléfono"
            description={lubricentro.phone}
            left={props => <List.Icon {...props} icon="phone" />}
          />
          
          <Divider style={styles.divider} />
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <View style={styles.statusContent}>
              <Text style={[
                styles.statusValue, 
                isActive ? styles.statusActive : styles.statusInactive
              ]}>
                {isActive ? 'Activo' : 'Inactivo'}
              </Text>
              {isActive ? (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              ) : (
                <Ionicons name="close-circle" size={20} color={colors.error} />
              )}
            </View>
          </View>
          
          {isTrial && (
            <View style={styles.trialContainer}>
              <Text style={styles.trialText}>
                Período de prueba: {trialDaysLeft > 0 ? `${trialDaysLeft} días restantes` : 'Finalizado'}
              </Text>
              <IconButton
                icon="information"
                size={20}
                onPress={() => Alert.alert(
                  'Período de Prueba',
                  `Tu lubricentro está en período de prueba hasta el ${moment(lubricentro.trialEndDate).format('DD/MM/YYYY')}. Contacta a soporte para activar la versión completa.`
                )}
              />
            </View>
          )}
        </Card.Content>
      </Card>
      
      {/* Sección de Configuración */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Configuración</Text>
          
          <List.Item
            title="Notificaciones"
            description="Recibir alertas de cambios próximos"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <Switch value={true} />}
          />
          
          <List.Item
            title="Sincronización"
            description="Mantener datos actualizados"
            left={props => <List.Icon {...props} icon="sync" />}
            right={props => <Switch value={true} />}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Último inicio de sesión"
            description={formatDateTime(user.lastLogin)}
            left={props => <List.Icon {...props} icon="clock" />}
          />
          
          <List.Item
            title="Actualizar datos"
            description="Recargar información del perfil"
            left={props => <List.Icon {...props} icon="refresh" />}
            onPress={refreshUser}
          />
          
          <List.Item
            title="Contactar soporte"
            description="Obtener ayuda con la aplicación"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={handleContactSupport}
          />
        </Card.Content>
      </Card>
      
      {/* Botón de cierre de sesión */}
      <Button
        mode="outlined"
        icon="logout"
        onPress={handleLogout}
        style={styles.logoutButton}
        labelStyle={{ color: colors.error }}
      >
        Cerrar Sesión
      </Button>
      
      {/* Información de la aplicación */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appVersion}>Versión 1.0.0</Text>
        <Text style={styles.appCopyright}>© 2025 Lubricentro App</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.surface,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatus: {
    fontSize: 14,
    color: 'white',
    marginRight: 6,
  },
  card: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  lubricentroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 40,
  },
  divider: {
    marginVertical: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 16,
    marginRight: 8,
  },
  statusActive: {
    color: colors.success,
  },
  statusInactive: {
    color: colors.error,
  },
  trialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLighter + '30',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  trialText: {
    flex: 1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 16,
    borderColor: colors.error,
  },
  appInfoContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default ProfileScreen;