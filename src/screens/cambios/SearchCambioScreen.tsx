// src/screens/cambios/SearchCambioScreen.tsx - Versión mejorada
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Text 
} from 'react-native';
import { 
  Searchbar, 
  Card, 
  Chip, 
  IconButton, 
  Menu, 
  Divider 
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation';
import { Ionicons } from '@expo/vector-icons';
import { CambioAceite } from '../../interfaces';
import { searchCambios, deleteCambio } from '../../services/cambiosService';
import { colors } from '../../styles/theme';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

type SearchCambioScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'SearchCambio'>;

type Props = {
  navigation: SearchCambioScreenNavigationProp;
};

const SearchCambioScreen: React.FC<Props> = ({ navigation }) => {
  const { authState } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [cambios, setCambios] = useState<CambioAceite[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [searched, setSearched] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Manejar cambio en el texto de búsqueda con debounce
  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    
    // Cancelar el timeout anterior si existe
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Crear un nuevo timeout
    if (text.trim()) {
      const timeout = setTimeout(() => {
        performSearch(text.trim());
      }, 500); // 500ms de espera para realizar la búsqueda
      
      setTypingTimeout(timeout as NodeJS.Timeout);
    } else {
      setCambios([]);
      setSearched(false);
    }
  };
  
  // Función para realizar la búsqueda
  const performSearch = async (query: string) => {
    if (!query || !authState.lubricentro) return;
    
    try {
      setLoading(true);
      const results = await searchCambios(authState.lubricentro.id, query);
      setCambios(results);
      setSearched(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      Alert.alert('Error', 'No se pudieron obtener los resultados de la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de cambio
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
              setCambios(cambios.filter(cambio => cambio.id !== cambioId));
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

  // Controlar visibilidad del menú
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

  // Renderizar cada elemento de la lista
  const renderItem = ({ item }: { item: CambioAceite }) => {
    const isMenuVisible = menuVisible[item.id] || false;
    
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
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por dominio o cliente"
          onChangeText={handleSearchQueryChange}
          value={searchQuery}
          style={styles.searchbar}
          autoFocus={true}
        />
        <IconButton
          icon="magnify"
          mode="contained"
          containerColor={colors.primary}
          iconColor="white"
          size={24}
          onPress={() => performSearch(searchQuery.trim())}
          disabled={loading || !searchQuery.trim()}
          style={styles.searchButton}
        />
      </View>
      
      {loading ? (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.messageText}>Buscando...</Text>
        </View>
      ) : searched && cambios.length === 0 ? (
        <View style={styles.messageContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textLight} />
          <Text style={styles.messageTitle}>No se encontraron resultados</Text>
          <Text style={styles.messageText}>
            No se encontraron cambios para "{searchQuery}"
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.messageContainer}>
          <Ionicons name="search" size={64} color={colors.primary} />
          <Text style={styles.messageTitle}>Buscar cambios de aceite</Text>
          <Text style={styles.messageText}>
            Ingresa un dominio o nombre de cliente para buscar
          </Text>
        </View>
      ) : (
        <FlatList
          data={cambios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
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
});

export default SearchCambioScreen;