// src/screens/cambios/HomeScreen.tsx - Con búsqueda en tiempo real
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  Text 
} from 'react-native';
import { 
  Searchbar, 
  Card, 
  Button, 
  FAB, 
  Chip,
  IconButton,
  Menu,
  Divider
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation';
import { CambioAceite } from '../../interfaces';
import { getCambios, deleteCambio } from '../../services/cambiosService';
import { colors } from '../../styles/theme';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;
// Función auxiliar para ordenar cambios
const ordenarCambios = (cambios: CambioAceite[]) => {
  return cambios.sort((a, b) => {
    const dateA = a.createdAt || a.fecha || a.fechaServicio;
    const dateB = b.createdAt || b.fecha || b.fechaServicio;
    
    const timestampA = moment(dateA).valueOf();
    const timestampB = moment(dateB).valueOf();
    
    return timestampB - timestampA; // Más reciente primero
  });
};



const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { authState } = useAuth();
  const [cambios, setCambios] = useState<CambioAceite[]>([]);
  const [allCambios, setAllCambios] = useState<CambioAceite[]>([]); // Para guardar todos los cambios sin filtrar
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'completo' | 'enviado'>('todos');

  // Cargar cambios de aceite
// Cargar cambios de aceite ORDENADOS
// En HomeScreen.tsx, agrega este debug temporal en loadCambios:

const loadCambios = useCallback(async () => {
  if (!authState.lubricentro) return;
  
  try {
    setLoading(true);
    const results = await getCambios(authState.lubricentro.id);
    
    // DEBUG: Verificar las fechas de los primeros 3 cambios
    console.log('=== DEBUG CAMBIOS ===');
    results.slice(0, 3).forEach((cambio, index) => {
      console.log(`Cambio ${index + 1}:`);
      console.log(`  ID: ${cambio.id}`);
      console.log(`  Número: ${cambio.nroCambio}`);
      console.log(`  CreatedAt: ${cambio.createdAt}`);
      console.log(`  FechaServicio: ${cambio.fechaServicio}`);
      console.log(`  Cliente: ${cambio.nombreCliente}`);
      console.log('---');
    });
    console.log('=== FIN DEBUG ===');
    
    setCambios(results);
    setAllCambios(results);
    
    // Resetear filtros al cargar
    setFiltroEstado('todos');
    setSearchQuery('');
  } catch (error) {
    console.error('Error al cargar cambios:', error);
    Alert.alert('Error', 'No se pudieron cargar los cambios de aceite');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [authState.lubricentro]);

  // Efecto para cargar cambios cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      loadCambios();
      // Limpiar búsqueda cuando se regresa a esta pantalla
      setSearchQuery('');
    }, [loadCambios])
  );

  // Manejar refrescado
  const handleRefresh = () => {
    setRefreshing(true);
    loadCambios();
    setSearchQuery(''); // Limpiar búsqueda al refrescar
  };

  // Manejar búsqueda en tiempo real
const handleSearchQueryChange = (text: string) => {
  setSearchQuery(text);
  
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  
  const timeout = setTimeout(() => {
    let filteredData = allCambios;
    
    // PRIMERO: Aplicar filtro de texto si hay búsqueda
    if (text.trim() !== '') {
      const lowerText = text.toLowerCase().trim();
      filteredData = filteredData.filter(cambio => 
        cambio.dominioVehiculo.toLowerCase().includes(lowerText) ||
        cambio.nombreCliente.toLowerCase().includes(lowerText)
      );
    }
    
    // SEGUNDO: Aplicar filtro de estado
    if (filtroEstado !== 'todos') {
      filteredData = filteredData.filter(cambio => 
        (cambio.estado || 'completo') === filtroEstado
      );
    }
    
    setCambios(filteredData);
  }, 300);
  
  setTypingTimeout(timeout as NodeJS.Timeout);
};

useEffect(() => {
  const pendientesCount = allCambios.filter(c => (c.estado || 'completo') === 'pendiente').length;
  
  navigation.setOptions({
    headerRight: () => (
      pendientesCount > 0 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: 'white', marginRight: 8, fontSize: 12 }}>
            {pendientesCount}
          </Text>
          <IconButton
            icon="clock-outline"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('ServiciosPendientes')}
          />
        </View>
      ) : null
    ),
  });
}, [allCambios, navigation]);

// NUEVA FUNCIÓN: Manejar cambio de filtro de estado
const handleFiltroEstadoChange = (nuevoFiltro: 'todos' | 'pendiente' | 'completo' | 'enviado') => {
  setFiltroEstado(nuevoFiltro);
  
  let filteredData = allCambios;
  
  // Aplicar filtro de texto si hay búsqueda activa
  if (searchQuery.trim() !== '') {
    const lowerText = searchQuery.toLowerCase().trim();
    filteredData = filteredData.filter(cambio => 
      cambio.dominioVehiculo.toLowerCase().includes(lowerText) ||
      cambio.nombreCliente.toLowerCase().includes(lowerText)
    );
  }
  
  // Aplicar filtro de estado
  if (nuevoFiltro !== 'todos') {
    filteredData = filteredData.filter(cambio => 
      (cambio.estado || 'completo') === nuevoFiltro
    );
  }
  
  setCambios(filteredData);
};

  // Manejar búsqueda avanzada (para ir a la pantalla de búsqueda)
  const handleAdvancedSearch = () => {
    navigation.navigate('SearchCambio');
  };

  // Manejar eliminar cambio
  const handleDeleteCambio = async (cambioId: string) => {
    Alert.alert(
      'Eliminar Cambio',
      '¿Estás seguro de que quieres eliminar este cambio de aceite?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCambio(cambioId);
              // Actualizar ambas listas: filtrada y completa
              const updatedCambios = cambios.filter(cambio => cambio.id !== cambioId);
              const updatedAllCambios = allCambios.filter(cambio => cambio.id !== cambioId);
              setCambios(updatedCambios);
              setAllCambios(updatedAllCambios);
              Alert.alert('Éxito', 'Cambio de aceite eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar cambio:', error);
              Alert.alert('Error', 'No se pudo eliminar el cambio de aceite');
            }
          },
        },
      ]
    );
  };

  

  // Función para renderizar cada elemento de la lista
  const renderItem = ({ item }: { item: CambioAceite }) => {
    const isMenuVisible = menuVisible[item.id] || false;
    
    const toggleMenu = (id: string) => {
      setMenuVisible(prev => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const closeMenu = (id: string) => {
      setMenuVisible(prev => ({
        ...prev,
        [id]: false,
      }));
    };

    const fecha = moment(item.fechaServicio).format('DD/MM/YYYY');
    const proximoCambio = moment(item.fechaProximoCambio).format('DD/MM/YYYY');
    
    // Determinar si es próximo al cambio (7 días o menos)
    const diasParaProximoCambio = moment(item.fechaProximoCambio).diff(moment(), 'days');
    const esProximoCambio = diasParaProximoCambio <= 7 && diasParaProximoCambio > 0;
    const esCambioVencido = diasParaProximoCambio < 0;
    
    return (
      <Card 
        style={[
          styles.card, 
          esProximoCambio && styles.cardWarning,
          esCambioVencido && styles.cardDanger
        ]} 
        onPress={() => navigation.navigate('CambioDetail', { cambioId: item.id })}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cambioNumero}>{item.nroCambio}</Text>
              <Text style={styles.clienteName}>{item.nombreCliente}</Text>
            </View>
            
            <Menu
              visible={isMenuVisible}
              onDismiss={() => closeMenu(item.id)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => toggleMenu(item.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  closeMenu(item.id);
                  navigation.navigate('CambioDetail', { cambioId: item.id });
                }}
                title="Ver detalle"
                leadingIcon="eye"
              />
              <Menu.Item
                onPress={() => {
                  closeMenu(item.id);
                  navigation.navigate('EditCambio', { cambio: item });
                }}
                title="Editar"
                leadingIcon="pencil"
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  closeMenu(item.id);
                  handleDeleteCambio(item.id);
                }}
                title="Eliminar"
                leadingIcon="delete"
                titleStyle={{ color: colors.error }}
              />
            </Menu>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="car" size={16} color={colors.textLight} />
              <Text style={styles.infoText}>
                {item.marcaVehiculo} {item.modeloVehiculo}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color={colors.textLight} />
              <Text style={styles.infoText}>{fecha}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer" size={16} color={colors.textLight} />
              <Text style={styles.infoText}>{item.kmActuales} km</Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            <Chip 
              style={styles.chipDominio} 
              textStyle={styles.chipText}
            >
              {item.dominioVehiculo}
            </Chip>
            <Chip 
              style={[
                styles.chipProximo,
                esProximoCambio && styles.chipWarning,
                esCambioVencido && styles.chipDanger
              ]}
              textStyle={styles.chipText}
            >
              Próximo: {proximoCambio}
            </Chip>
            {item.estado && (
              <Chip 
                style={[
                  styles.chipEstado,
                  item.estado === 'pendiente' && styles.chipPendiente,
                  item.estado === 'completo' && styles.chipCompleto,
                  item.estado === 'enviado' && styles.chipEnviado,
                ]}
                textStyle={styles.chipText}
                icon={
                  item.estado === 'pendiente' ? 'clock-outline' :
                  item.estado === 'completo' ? 'check-circle' :
                  'send'
                }
              >
                {item.estado === 'pendiente' ? 'Pendiente' :
                item.estado === 'completo' ? 'Completo' :
                'Enviado'}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Renderizar pantalla de carga
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando cambios de aceite...</Text>
      </View>
    );
  }

  // Renderizar lista vacía (cuando no hay cambios en la base de datos)
  if (allCambios.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="water" size={80} color={colors.primary} />
        <Text style={styles.emptyTitle}>No hay cambios registrados</Text>
        <Text style={styles.emptyText}>
          Registra tu primer cambio de aceite presionando el botón de abajo
        </Text>
        <Button
          mode="contained"
          icon="plus"
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCambio')}
        >
          Nuevo Cambio
        </Button>
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('AddCambio')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por dominio o cliente"
          onChangeText={handleSearchQueryChange}
          value={searchQuery}
          style={styles.searchbar}
        />
        <IconButton
          icon="magnify"
          mode="contained"
          containerColor={colors.primary}
          iconColor="white"
          size={24}
          onPress={handleAdvancedSearch}
          style={styles.searchButton}
        />
      </View>
      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          icon="clock-outline"
          onPress={() => navigation.navigate('ServiciosPendientes')}
          style={styles.pendientesButton}
        >
          Servicios Pendientes
        </Button>
      </View>

      <View style={styles.filterContainer}>
        <Button
          mode={filtroEstado === 'todos' ? 'contained' : 'outlined'}
          onPress={() => handleFiltroEstadoChange('todos')}
          style={styles.filterButton}
          compact
        >
          Todos
        </Button>
        <Button
          mode={filtroEstado === 'pendiente' ? 'contained' : 'outlined'}
          onPress={() => handleFiltroEstadoChange('pendiente')}
          style={styles.filterButton}
          compact
        >
          Pendientes
        </Button>
        <Button
          mode={filtroEstado === 'completo' ? 'contained' : 'outlined'}
          onPress={() => handleFiltroEstadoChange('completo')}
          style={styles.filterButton}
          compact
        >
          Completos
        </Button>
        <Button
          mode={filtroEstado === 'enviado' ? 'contained' : 'outlined'}
          onPress={() => handleFiltroEstadoChange('enviado')}
          style={styles.filterButton}
          compact
        >
          Enviados
        </Button>
      </View>
      
      {/* Mostrar mensaje cuando no hay resultados en la búsqueda */}
      {!loading && searchQuery.trim() !== '' && cambios.length === 0 ? (
        <View style={styles.emptySearchContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
          <Text style={styles.emptyText}>
            No se encontraron cambios para "{searchQuery}"
          </Text>
        </View>
        

        
      ) : (
        <FlatList
          data={cambios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddCambio')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    borderRadius: 8,
    elevation: 2,
  },
  searchButton: {
    marginLeft: 8,
  },
  listContainer: {
    padding: 8,
    paddingBottom: 80, // Espacio para el FAB
  },
  card: {
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cambioNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  clienteName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 4,
    color: colors.textLight,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipDominio: {
    backgroundColor: colors.primaryLighter,
    marginRight: 8,
    marginBottom: 4,
  },
  chipProximo: {
    backgroundColor: colors.primaryLight,
    marginBottom: 4,
  },
  chipWarning: {
    backgroundColor: colors.warning,
  },
  chipDanger: {
    backgroundColor: colors.error,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.primary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  actionsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  pendientesButton: {
      borderColor: colors.warning,
      marginBottom: 8,
    },
        chipEstado: {
      marginBottom: 4,
      marginRight: 8,
      },
      chipPendiente: {
        backgroundColor: colors.warning,
      },
      chipCompleto: {
        backgroundColor: colors.success,
      },
      chipEnviado: {
        backgroundColor: colors.info,
      },
      


      // NUEVOS ESTILOS FALTANTES:
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-around',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 2,
  }
});

export default HomeScreen;