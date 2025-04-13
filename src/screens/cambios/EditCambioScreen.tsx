// src/screens/cambios/EditCambioScreen.tsx
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation';
import CambioForm from '../../components/forms/CambioForm';
import { CambioAceiteFormValues, CambioAceite } from '../../interfaces';
import { updateCambio } from '../../services/cambiosService';
import { colors } from '../../styles/theme';

type EditCambioScreenRouteProp = RouteProp<HomeStackParamList, 'EditCambio'>;
type EditCambioScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'EditCambio'>;

type Props = {
  route: EditCambioScreenRouteProp;
  navigation: EditCambioScreenNavigationProp;
};

const EditCambioScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cambio } = route.params;
  
  // Preparar valores iniciales para el formulario
  const initialValues: Partial<CambioAceiteFormValues> = {
    nombreCliente: cambio.nombreCliente,
    celular: cambio.celular,
    dominioVehiculo: cambio.dominioVehiculo,
    marcaVehiculo: cambio.marcaVehiculo,
    modeloVehiculo: cambio.modeloVehiculo,
    añoVehiculo: cambio.añoVehiculo,
    tipoVehiculo: cambio.tipoVehiculo,
    kmActuales: cambio.kmActuales,
    kmProximo: cambio.kmProximo,
    fecha: cambio.fecha,
    fechaServicio: cambio.fechaServicio,
    fechaProximoCambio: cambio.fechaProximoCambio,
    perioricidad_servicio: cambio.perioricidad_servicio,
    tipoAceite: cambio.tipoAceite,
    marcaAceite: cambio.marcaAceite,
    sae: cambio.sae,
    cantidadAceite: cambio.cantidadAceite,
    filtroAceite: cambio.filtroAceite,
    filtroAceiteNota: cambio.filtroAceiteNota,
    filtroAire: cambio.filtroAire,
    filtroAireNota: cambio.filtroAireNota,
    filtroCombustible: cambio.filtroCombustible,
    filtroCombustibleNota: cambio.filtroCombustibleNota,
    filtroHabitaculo: cambio.filtroHabitaculo,
    filtroHabitaculoNota: cambio.filtroHabitaculoNota,
    aditivo: cambio.aditivo,
    aditivoNota: cambio.aditivoNota,
    engrase: cambio.engrase,
    engraseNota: cambio.engraseNota,
    refrigerante: cambio.refrigerante,
    refrigeranteNota: cambio.refrigeranteNota,
    caja: cambio.caja,
    cajaNota: cambio.cajaNota,
    diferencial: cambio.diferencial,
    diferencialNota: cambio.diferencialNota,
    observaciones: cambio.observaciones,
  };
  
  // Manejar el envío del formulario
  const handleSubmit = async (values: CambioAceiteFormValues) => {
    try {
      // Actualizar el cambio en Firebase
      await updateCambio(cambio.id, values);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Éxito',
        'Cambio de aceite actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CambioDetail', { cambioId: cambio.id }),
          },
        ]
      );
    } catch (error) {
      console.error('Error al actualizar cambio:', error);
      Alert.alert('Error', 'No se pudo actualizar el cambio de aceite');
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

export default EditCambioScreen;