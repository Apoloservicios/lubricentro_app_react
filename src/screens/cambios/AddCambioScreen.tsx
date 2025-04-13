// src/screens/cambios/AddCambioScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation';
import CambioForm from '../../components/forms/CambioForm';
import { CambioAceiteFormValues } from '../../interfaces';
import { createCambio, getLastCambioNumber } from '../../services/cambiosService';
import useAuth from '../../hooks/useAuth';
import { colors } from '../../styles/theme';

type AddCambioScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'AddCambio'>;
};

const AddCambioScreen: React.FC<AddCambioScreenProps> = ({ navigation }) => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nextCambioNumber, setNextCambioNumber] = useState<string>('');
  
  // Obtener el próximo número de cambio al cargar la pantalla
  useEffect(() => {
    const fetchNextCambioNumber = async () => {
      if (!authState.lubricentro) return;
      
      try {
        const number = await getLastCambioNumber(authState.lubricentro.id);
        setNextCambioNumber(number);
      } catch (error) {
        console.error('Error al obtener número de cambio:', error);
        Alert.alert('Error', 'No se pudo obtener el número de cambio');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNextCambioNumber();
  }, [authState.lubricentro]);
  
  const handleSubmit = async (values: CambioAceiteFormValues) => {
    if (!authState.user || !authState.lubricentro) {
      Alert.alert('Error', 'Usuario o lubricentro no disponible');
      return;
    }
    
    try {
      // Crear objeto de cambio con todos los campos necesarios
      // Nota cómo proporcionamos los campos que faltan tomándolos de authState
      const cambioData = {
        ...values,
        nroCambio: nextCambioNumber,
        // Agregar estos campos que son requeridos por createCambio
        lubricentroId: authState.lubricentro.id,
        lubricentroNombre: authState.lubricentro.fantasyName,
        operatorId: authState.user.id,
        nombreOperario: `${authState.user.nombre} ${authState.user.apellido}`
      };
      
      // Guardar en Firebase
      await createCambio(cambioData, authState.user, authState.lubricentro);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Éxito',
        'Cambio de aceite registrado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear cambio:', error);
      Alert.alert('Error', 'No se pudo registrar el cambio de aceite');
    }
  };
  
  // Mostrar indicador de carga mientras se obtiene el número de cambio
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <CambioForm
        initialValues={{}}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AddCambioScreen;