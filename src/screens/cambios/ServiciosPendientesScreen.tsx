// src/screens/cambios/ServiciosPendientesScreen.tsx - VERSIÓN MEJORADA
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Chip, 
  FAB,
  Divider,
  Badge
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation';
import { getCambiosPendientes } from '../../services/cambiosService';
import { CambioAceite } from '../../interfaces';
import { colors } from '../../styles/theme';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

type ServiciosPendientesScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'ServiciosPendientes'>;

const ServiciosPendientesScreen: React.FC = () => {
  const { authState } = useAuth();
  const navigation = useNavigation<ServiciosPendientesScreenNavigationProp>();
  const [cambiosPendientes, setCambiosPendientes] = useState<CambioAceite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar cambios pendientes
  const loadCambiosPendientes = useCallback(async () => {
    if (!authState.lubricentro) return;
    
    try {
      setLoading(true);
      const results = await getCambiosPendientes(authState.lubricentro.id);
      setCambiosPendientes(results);
    } catch (error) {
      console.error('Error al cargar cambios pendientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los servicios pendientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authState.lubricentro]);

  useFocusEffect(
    useCallback(() => {
      loadCambiosPendientes();
    }, [loadCambiosPendientes])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadCambiosPendientes();
  };

  const handleCompletarServicio = (cambio: CambioAceite) => {
    navigation.navigate('CompletarServicio', { cambio });
  };

  const renderItem = ({ item, index }: { item: CambioAceite; index: number }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.numeroContainer}>
            <Badge style={styles.posicionBadge}>{index + 1}</Badge>
            <View style={styles.infoContainer}>
              <Text style={styles.numeroCambio}>{item.nroCambio}</Text>
              <Text style={styles.clienteName}>{item.nombreCliente}</Text>
            </View>
          </View>
          <Chip 
            style={styles.chipPendiente}
            textStyle={styles.chipText}
            icon="clock-outline"
          >
            En cola
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.vehicleInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="car" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              {item.marcaVehiculo} {item.modeloVehiculo}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="card" size={16} color={colors.primary} />
            <Text style={styles.infoText}>{item.dominioVehiculo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color={colors.primary} />
            <Text style={styles.infoText}>{item.celular}</Text>
          </View>
        </View>
        
        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>Creado:</Text>
          <Text style={styles.timeText}>
            {moment(item.fechaCreacion).format('DD/MM/YYYY HH:mm')}
          </Text>
          <Text style={styles.timeAgo}>
            ({moment(item.fechaCreacion).fromNow()})
          </Text>
        </View>
        
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={() => handleCompletarServicio(item)}
            style={styles.completarButton}
            icon="check-circle"
          >
            Atender Ahora
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('CambioDetail', { cambioId: item.id })}
            style={styles.verButton}
            icon="eye"
          >
            Ver Detalle
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Ionicons name="time" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>Cola de espera</Text>
        <Badge style={styles.countBadge}>{cambiosPendientes.length}</Badge>
      </View>
      <Text style={styles.headerSubtitle}>
        Servicios pendientes de completar
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando cola de espera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cambiosPendientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done" size={64} color={colors.success} />
            <Text style={styles.emptyTitle}>¡Todo al día!</Text>
            <Text style={styles.emptyText}>
              No hay servicios pendientes de completar
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
  headerContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.warning,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  posicionBadge: {
    backgroundColor: colors.primary,
    marginRight: 12,
    minWidth: 24,
  },
  infoContainer: {
    flex: 1,
  },
  numeroCambio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  clienteName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  chipPendiente: {
    backgroundColor: colors.warning,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  divider: {
    marginBottom: 12,
  },
  vehicleInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textLight,
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completarButton: {
    backgroundColor: colors.success,
    flex: 1,
    marginRight: 8,
  },
  verButton: {
    borderColor: colors.primary,
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default ServiciosPendientesScreen;