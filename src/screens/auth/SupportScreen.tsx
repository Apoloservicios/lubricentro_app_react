// src/screens/auth/SupportScreen.tsx
import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Divider, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation';
import { colors } from '../../styles/theme';

type SupportScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Support'>;
};

const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
  // Función para abrir email
  const openEmail = () => {
    Linking.openURL('mailto:soporte@lubricentroapp.com?subject=Soporte%20Lubricentro%20App');
  };

  // Función para abrir WhatsApp
  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/5491112345678?text=Necesito%20ayuda%20con%20Lubricentro%20App');
  };

  // Función para llamar
  const openPhone = () => {
    Linking.openURL('tel:+5491112345678');
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require('../../../assets/images/support.png')}
        style={styles.image}
        resizeMode="contain"
      />
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>¿Necesitas ayuda?</Text>
          <Text style={styles.subtitle}>
            Si estás teniendo problemas para acceder a la aplicación, puede deberse a alguna de las siguientes razones:
          </Text>
          
          <List.Section>
            <List.Item
              title="Usuario inactivo"
              description="Tu cuenta de usuario puede estar desactivada."
              left={props => <List.Icon {...props} icon="account-off" color={colors.error} />}
            />
            <List.Item
              title="Lubricentro inactivo"
              description="El lubricentro al que estás asociado puede estar desactivado."
              left={props => <List.Icon {...props} icon="store-off" color={colors.error} />}
            />
            <List.Item
              title="Período de prueba finalizado"
              description="El período de prueba del lubricentro puede haber expirado."
              left={props => <List.Icon {...props} icon="clock-outline" color={colors.warning} />}
            />
            <List.Item
              title="Credenciales incorrectas"
              description="Email o contraseña incorrectos."
              left={props => <List.Icon {...props} icon="lock-alert" color={colors.warning} />}
            />
          </List.Section>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.contactTitle}>Contáctanos</Text>
          <Text style={styles.contactText}>
            Nuestro equipo de soporte está disponible para ayudarte a resolver cualquier problema.
          </Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
              <Ionicons name="mail" size={28} color={colors.primary} />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={28} color={colors.primary} />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={openPhone}>
              <Ionicons name="call" size={28} color={colors.primary} />
              <Text style={styles.contactButtonText}>Llamar</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      
      <Button
        mode="outlined"
        icon="arrow-left"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        Volver al inicio de sesión
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: 180,
    marginVertical: 20,
  },
  card: {
    margin: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  divider: {
    marginVertical: 20,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  contactButton: {
    alignItems: 'center',
    padding: 10,
  },
  contactButtonText: {
    color: colors.primary,
    marginTop: 5,
  },
  backButton: {
    margin: 16,
    borderColor: colors.primary,
  },
});

export default SupportScreen;