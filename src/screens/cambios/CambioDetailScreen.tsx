// src/screens/cambios/CambioDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Share, 
  Platform,
  Linking
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  List, 
  Chip,
  IconButton,
  Menu 
} from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation';
import { colors } from '../../styles/theme';
import { getCambioById, deleteCambio } from '../../services/cambiosService';
import { CambioAceite } from '../../interfaces';
import moment from 'moment';
import 'moment/locale/es';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { generatePdfHtml } from '../../utils/pdfGenerator';

moment.locale('es');

type CambioDetailScreenRouteProp = RouteProp<HomeStackParamList, 'CambioDetail'>;
type CambioDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'CambioDetail'>;

type Props = {
  route: CambioDetailScreenRouteProp;
  navigation: CambioDetailScreenNavigationProp;
};

const CambioDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cambioId } = route.params;
  const [cambio, setCambio] = useState<CambioAceite | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Cargar datos del cambio
  useEffect(() => {
    const loadCambio = async () => {
      try {
        const result = await getCambioById(cambioId);
        setCambio(result);
      } catch (error) {
        console.error('Error al cargar cambio:', error);
        Alert.alert('Error', 'No se pudo cargar el detalle del cambio');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    loadCambio();
  }, [cambioId, navigation]);
  
  // Manejar eliminación del cambio
  const handleDelete = () => {
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
              Alert.alert('Éxito', 'Cambio de aceite eliminado correctamente');
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar cambio:', error);
              Alert.alert('Error', 'No se pudo eliminar el cambio de aceite');
            }
          },
        },
      ]
    );
  };
  
  // Generar y compartir PDF
  const generateAndSharePdf = async () => {
    if (!cambio) return;
    
    try {
      setGeneratingPdf(true);
      
      // Generar HTML para el PDF
      const html = generatePdfHtml(cambio);
      
      // Crear el PDF
      const options = {
        html,
        fileName: `Cambio_${cambio.nroCambio.replace('-', '_')}`,
        directory: 'Documents',
      };
      
      const file = await RNHTMLtoPDF.convert(options);
      
      if (file?.filePath) {
        // Compartir el PDF
        if (Platform.OS === 'ios') {
          await Sharing.shareAsync(file.filePath);
        } else {
          await Share.share({
            url: `file://${file.filePath}`,
            title: `Cambio de aceite ${cambio.nroCambio}`,
          });
        }
      } else {
        throw new Error('No se pudo generar el PDF');
      }
    } catch (error) {
      console.error('Error al generar o compartir PDF:', error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  // Compartir mensaje por WhatsApp
  const shareByWhatsApp = async () => {
    if (!cambio) return;
    
    try {
      const message = `🔧 *CAMBIO DE ACEITE ${cambio.nroCambio}* 🔧\n\n` +
        `👤 *Cliente:* ${cambio.nombreCliente}\n` +
        `🚗 *Vehículo:* ${cambio.marcaVehiculo} ${cambio.modeloVehiculo} (${cambio.dominioVehiculo})\n` +
        `🛢️ *Aceite:* ${cambio.tipoAceite} ${cambio.marcaAceite} ${cambio.sae}\n` +
        `📅 *Fecha:* ${moment(cambio.fechaServicio).format('DD/MM/YYYY')}\n` +
        `🔄 *Próximo cambio:* ${moment(cambio.fechaProximoCambio).format('DD/MM/YYYY')} o ${cambio.kmProximo} km\n\n` +
        `Gracias por confiar en ${cambio.lubricentroNombre}! 👍`;
      
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
      }
    } catch (error) {
      console.error('Error al compartir por WhatsApp:', error);
      Alert.alert('Error', 'No se pudo compartir por WhatsApp');
    }
  };
  
  // Renderizar pantalla de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando detalle del cambio...</Text>
      </View>
    );
  }
  
  // Si no hay datos, mostrar error
  if (!cambio) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>No se encontró el cambio</Text>
        <Text style={styles.errorText}>El cambio solicitado no existe o fue eliminado</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          Volver
        </Button>
      </View>
    );
  }
  
  // Calcular días para próximo cambio
  const diasParaProximoCambio = moment(cambio.fechaProximoCambio).diff(moment(), 'days');
  const esProximoCambio = diasParaProximoCambio <= 7 && diasParaProximoCambio > 0;
  const esCambioVencido = diasParaProximoCambio < 0;
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado con información principal */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.numeroCambio}>{cambio.nroCambio}</Text>
            <Text style={styles.fecha}>{moment(cambio.fechaServicio).format('DD MMMM, YYYY')}</Text>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={28}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('EditCambio', { cambio });
              }}
              title="Editar"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
              title="Eliminar"
              leadingIcon="delete"
              titleStyle={{ color: colors.error }}
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                generateAndSharePdf();
              }}
              title="Generar PDF"
              leadingIcon="file-pdf-box"
              disabled={generatingPdf}
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                shareByWhatsApp();
              }}
              title="Compartir por WhatsApp"
              leadingIcon="whatsapp"
            />
          </Menu>
        </View>
        
        {/* Información del cliente y vehículo */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Información del Cliente</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>{cambio.nombreCliente}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{cambio.celular}</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Información del Vehículo</Text>
            <View style={styles.vehicleHeader}>
              <Text style={styles.vehicleTitle}>
                {cambio.marcaVehiculo} {cambio.modeloVehiculo} ({cambio.añoVehiculo})
              </Text>
              <Chip mode="outlined" style={styles.chipDominio}>
                {cambio.dominioVehiculo}
              </Chip>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="car" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>{cambio.tipoVehiculo}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="speedometer" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Kilómetros:</Text>
              <Text style={styles.infoValue}>{cambio.kmActuales} km</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="repeat" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Próximo:</Text>
              <Text style={styles.infoValue}>{cambio.kmProximo} km</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Información del servicio */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Detalles del Servicio</Text>
            
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceLabel}>Aceite:</Text>
                <Text style={styles.serviceValue}>
                  {cambio.tipoAceite} {cambio.marcaAceite} {cambio.sae}
                </Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceLabel}>Cantidad:</Text>
                <Text style={styles.serviceValue}>{cambio.cantidadAceite}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesTitle}>Servicios realizados:</Text>
              
              <List.Item
                title="Filtro de aceite"
                left={() => (
                  <List.Icon
                    icon={cambio.filtroAceite ? "check-circle" : "close-circle"}
                    color={cambio.filtroAceite ? colors.success : colors.error}
                  />
                )}
                description={cambio.filtroAceiteNota || 'Sin notas'}
              />
              
              <List.Item
                title="Filtro de aire"
                left={() => (
                  <List.Icon
                    icon={cambio.filtroAire ? "check-circle" : "close-circle"}
                    color={cambio.filtroAire ? colors.success : colors.error}
                  />
                )}
                description={cambio.filtroAireNota || 'Sin notas'}
              />
              
              <List.Item
                title="Filtro de combustible"
                left={() => (
                  <List.Icon
                    icon={cambio.filtroCombustible ? "check-circle" : "close-circle"}
                    color={cambio.filtroCombustible ? colors.success : colors.error}
                  />
                )}
                description={cambio.filtroCombustibleNota || 'Sin notas'}
              />
              
              <List.Item
                title="Filtro de habitáculo"
                left={() => (
                  <List.Icon
                    icon={cambio.filtroHabitaculo ? "check-circle" : "close-circle"}
                    color={cambio.filtroHabitaculo ? colors.success : colors.error}
                  />
                )}
                description={cambio.filtroHabitaculoNota || 'Sin notas'}
              />
              
              <List.Item
                title="Aditivo"
                left={() => (
                  <List.Icon
                    icon={cambio.aditivo ? "check-circle" : "close-circle"}
                    color={cambio.aditivo ? colors.success : colors.error}
                  />
                )}
                description={cambio.aditivoNota || 'Sin notas'}
              />
              
              <List.Item
                title="Engrase"
                left={() => (
                  <List.Icon
                    icon={cambio.engrase ? "check-circle" : "close-circle"}
                    color={cambio.engrase ? colors.success : colors.error}
                  />
                )}
                description={cambio.engraseNota || 'Sin notas'}
              />
              
              <List.Item
                title="Refrigerante"
                left={() => (
                  <List.Icon
                    icon={cambio.refrigerante ? "check-circle" : "close-circle"}
                    color={cambio.refrigerante ? colors.success : colors.error}
                  />
                )}
                description={cambio.refrigeranteNota || 'Sin notas'}
              />
              
              <List.Item
                title="Caja"
                left={() => (
                  <List.Icon
                    icon={cambio.caja ? "check-circle" : "close-circle"}
                    color={cambio.caja ? colors.success : colors.error}
                  />
                )}
                description={cambio.cajaNota || 'Sin notas'}
              />
              
              <List.Item
                title="Diferencial"
                left={() => (
                  <List.Icon
                    icon={cambio.diferencial ? "check-circle" : "close-circle"}
                    color={cambio.diferencial ? colors.success : colors.error}
                  />
                )}
                description={cambio.diferencialNota || 'Sin notas'}
              />
            </View>
            
            {cambio.observaciones && (
              <View style={styles.observacionesContainer}>
                <Text style={styles.observacionesTitle}>Observaciones:</Text>
                <Text style={styles.observacionesText}>{cambio.observaciones}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Información del próximo cambio */}
        <Card 
          style={[
            styles.card, 
            esProximoCambio && styles.cardWarning,
            esCambioVencido && styles.cardDanger
          ]}
        >
          <Card.Content>
            <Text style={styles.cardTitle}>Próximo Cambio</Text>
            
            <View style={styles.nextChangeContainer}>
              <View style={styles.nextChangeItem}>
                <Ionicons 
                  name="calendar" 
                  size={24} 
                  color={esCambioVencido ? colors.error : esProximoCambio ? colors.warning : colors.primary} 
                />
                <Text style={styles.nextChangeLabel}>Fecha:</Text>
                <Text 
                  style={[
                    styles.nextChangeValue,
                    esProximoCambio && styles.textWarning,
                    esCambioVencido && styles.textDanger
                  ]}
                >
                  {moment(cambio.fechaProximoCambio).format('DD/MM/YYYY')}
                </Text>
              </View>
              
              <View style={styles.nextChangeItem}>
                <Ionicons name="speedometer" size={24} color={colors.primary} />
                <Text style={styles.nextChangeLabel}>Kilómetros:</Text>
                <Text style={styles.nextChangeValue}>{cambio.kmProximo} km</Text>
              </View>
            </View>
            
            {esCambioVencido && (
              <View style={styles.alertContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.alertText}>
                  Cambio vencido hace {Math.abs(diasParaProximoCambio)} días
                </Text>
              </View>
            )}
            
            {esProximoCambio && (
              <View style={styles.alertContainer}>
                <Ionicons name="time" size={20} color={colors.warning} />
                <Text style={styles.alertText}>
                  Próximo cambio en {diasParaProximoCambio} días
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Información del operario */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Información Adicional</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Atendido por:</Text>
              <Text style={styles.infoValue}>{cambio.nombreOperario}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Lubricentro:</Text>
              <Text style={styles.infoValue}>{cambio.lubricentroNombre}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Registrado:</Text>
              <Text style={styles.infoValue}>
                {moment(cambio.createdAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => navigation.navigate('EditCambio', { cambio })}
          style={styles.actionButton}
        >
          Editar
        </Button>
        
        <Button
          mode="contained"
          icon="share-variant"
          onPress={generateAndSharePdf}
          style={styles.actionButton}
          loading={generatingPdf}
          disabled={generatingPdf}
        >
          Compartir
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Espacio para los botones de acción
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  numeroCambio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  fecha: {
    fontSize: 16,
    color: colors.textLight,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    width: 80,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoValue: {
    flex: 1,
    color: colors.text,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  chipDominio: {
    backgroundColor: colors.primaryLighter,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLabel: {
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 2,
  },
  serviceValue: {
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    marginBottom: 16,
  },
  servicesContainer: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  observacionesContainer: {
    marginTop: 8,
  },
  observacionesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  observacionesText: {
    color: colors.text,
  },
  nextChangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nextChangeItem: {
    flex: 1,
    alignItems: 'center',
  },
  nextChangeLabel: {
    fontWeight: 'bold',
    color: colors.textLight,
    marginTop: 8,
    marginBottom: 4,
  },
  nextChangeValue: {
    fontSize: 18,
    color: colors.text,
  },
  textWarning: {
    color: colors.warning,
  },
  textDanger: {
    color: colors.error,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  alertText: {
    marginLeft: 8,
    color: colors.text,
    fontWeight: 'bold',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    elevation: 4,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CambioDetailScreen;