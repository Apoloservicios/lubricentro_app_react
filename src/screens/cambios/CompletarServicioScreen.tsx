// src/screens/cambios/CompletarServicioScreen.tsx
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation';
import CambioForm from '../../components/forms/CambioForm';
import { CambioAceiteFormValues } from '../../interfaces';
import { completarServicio } from '../../services/cambiosService';
import useAuth from '../../hooks/useAuth';
import { colors } from '../../styles/theme';

type CompletarServicioScreenRouteProp = RouteProp<HomeStackParamList, 'CompletarServicio'>;
type CompletarServicioScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'CompletarServicio'>;

type Props = {
  route: CompletarServicioScreenRouteProp;
  navigation: CompletarServicioScreenNavigationProp;
};

const CompletarServicioScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cambio } = route.params;
  const { authState } = useAuth();
  
  // Preparar valores iniciales del cambio pendiente
  const initialValues: Partial<CambioAceiteFormValues> = {
    nombreCliente: cambio.nombreCliente,
    celular: cambio.celular,
    dominioVehiculo: cambio.dominioVehiculo,
    marcaVehiculo: cambio.marcaVehiculo,
    modeloVehiculo: cambio.modeloVehiculo,
    añoVehiculo: cambio.añoVehiculo,
    tipoVehiculo: cambio.tipoVehiculo,
    // Los campos faltantes se llenarán en el formulario
  };
  
  const handleSubmit = async (values: CambioAceiteFormValues) => {
    if (!authState.user) {
      Alert.alert('Error', 'Usuario no disponible');
      return;
    }
    
    try {
      await completarServicio(cambio.id, values, authState.user);
      
      Alert.alert(
        'Éxito',
        'Servicio completado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CambioDetail', { cambioId: cambio.id }),
          },
        ]
      );
    } catch (error) {
      console.error('Error al completar servicio:', error);
      Alert.alert('Error', 'No se pudo completar el servicio');
    }
  };
  
  return (
    <View style={styles.container}>
      <CambioForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default CompletarServicioScreen;