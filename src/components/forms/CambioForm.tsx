// src/components/forms/CambioForm.tsx - ARCHIVO COMPLETO CORREGIDO
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Switch, 
  HelperText, 
  Divider, 
  Chip,
  Menu,
  IconButton,
  Card,
  Subheading
} from 'react-native-paper';
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { cambioAceiteSchema } from '../../utils/validations';
import { CambioAceite, CambioAceiteFormValues } from '../../interfaces';
import { colors } from '../../styles/theme';
import { 
  vehicleTypes, 
  oilTypes, 
  saeOptions, 
  oilBrands, 
  changeIntervals,
  formatDate,
  calculateNextChangeDate,
  calculateNextKm,
  normalizeDominio
} from '../../utils/helpers';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

interface CambioFormProps {
  initialValues: Partial<CambioAceiteFormValues>;
  onSubmit: (values: CambioAceiteFormValues) => Promise<void>;
  isEditing?: boolean;
}

const CambioForm: React.FC<CambioFormProps> = ({ 
  initialValues, 
  onSubmit,
  isEditing = false
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState<string>('');
  
  // Valores iniciales por defecto si no hay initialValues
  const defaultInitialValues: CambioAceiteFormValues = {
    nombreCliente: '',
    celular: '',
    dominioVehiculo: '',
    marcaVehiculo: '',
    modeloVehiculo: '',
    añoVehiculo: new Date().getFullYear().toString(),
    tipoVehiculo: 'Auto',
    kmActuales: 0,
    kmProximo: 10000, // Cambiado de 5000 a 10000
    fecha: new Date(),
    fechaServicio: new Date(),
    fechaProximoCambio: moment().add(3, 'months').toDate(),
    perioricidad_servicio: 3,
    tipoAceite: 'Mineral',
    marcaAceite: 'YPF',
    sae: 'SAE 15W-40',
    cantidadAceite: '4 Litros',
    filtroAceite: false,
    filtroAceiteNota: 'S/N', // Cambiado de 'Cambio S/N' a 'S/N'
    filtroAire: false,
    filtroAireNota: 'S/N',
    filtroCombustible: false,
    filtroCombustibleNota: 'S/N',
    filtroHabitaculo: false,
    filtroHabitaculoNota: 'S/N',
    aditivo: false,
    aditivoNota: 'S/N',
    engrase: false,
    engraseNota: 'S/N',
    refrigerante: false,
    refrigeranteNota: 'S/N',
    caja: false,
    cajaNota: 'S/N',
    diferencial: false,
    diferencialNota: 'S/N',
    observaciones: '',
    ...initialValues
  };

  // Mostrar el selector de fecha
  const showDatePickerModal = (fieldName: string) => {
    setDatePickerField(fieldName);
    if (fieldName === 'fechaServicio') {
      setShowDatePicker(true);
    } else if (fieldName === 'fechaProximoCambio') {
      setShowNextDatePicker(true);
    }
  };
  
  // Manejar cambio de fecha
  const handleDateChange = (setFieldValue: any, date: Date | undefined) => {
    if (date) {
      setFieldValue(datePickerField, date);
      
      // Si se cambió la fecha de servicio, actualizar la fecha del próximo cambio
      if (datePickerField === 'fechaServicio') {
        const formValues = formikRef.current?.values;
        if (formValues) {
          const nextDate = calculateNextChangeDate(date, formValues.perioricidad_servicio);
          setFieldValue('fechaProximoCambio', nextDate);
        }
      }
    }
    
    // Ocultar el selector de fecha
    if (datePickerField === 'fechaServicio') {
      setShowDatePicker(false);
    } else if (datePickerField === 'fechaProximoCambio') {
      setShowNextDatePicker(false);
    }
  };
  
  // Manejar cambio de periodicidad
  const handlePeriodicityChange = (
    setFieldValue: any, 
    value: number, 
    currentFechaServicio: Date
  ) => {
    setFieldValue('perioricidad_servicio', value);
    
    // Actualizar la fecha del próximo cambio
    const nextDate = calculateNextChangeDate(currentFechaServicio, value);
    setFieldValue('fechaProximoCambio', nextDate);
  };
  
  // Manejar cambio de kilometraje - Corregido para usar 10000 km por defecto
  const handleKmChange = (
    setFieldValue: any, 
    kmActuales: number
  ) => {
    setFieldValue('kmActuales', kmActuales);
    
    // Actualizar el kilometraje del próximo cambio (por defecto +10000 km en lugar de +5000)
    const kmProximo = calculateNextKm(kmActuales, 10000);
    setFieldValue('kmProximo', kmProximo);
  };
  
  // Normalizar dominio al perder foco
  const handleDominioBlur = (
    setFieldValue: any,
    dominioValue: string
  ) => {
    if (dominioValue) {
      const normalizedDominio = normalizeDominio(dominioValue);
      setFieldValue('dominioVehiculo', normalizedDominio);
    }
  };

  // Manejar cambio en switches de servicios - Nueva función
  const handleServiceSwitch = (
    setFieldValue: any,
    serviceName: string,
    value: boolean
  ) => {
    setFieldValue(serviceName, value);
    
    // Si se activa el servicio, limpiar la nota para permitir entrada
    // Si se desactiva, poner S/N
    const noteName = serviceName + 'Nota';
    if (value) {
      setFieldValue(noteName, '');
    } else {
      setFieldValue(noteName, 'S/N');
    }
  };
  
  // Referencia a Formik para acceder a sus métodos desde fuera
  const formikRef = React.useRef<any>(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <Formik
          innerRef={formikRef}
          initialValues={defaultInitialValues}
          validationSchema={cambioAceiteSchema}
          // CLAVE: Agregar estas propiedades para que la validación funcione correctamente
          validateOnChange={true}
          validateOnBlur={true}
          enableReinitialize={true}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
  console.log('Form submitted with values:', values);
  try {
    await onSubmit(values);
  } catch (error) {
    console.error('Error al guardar cambio:', error);
    Alert.alert('Error', 'No se pudo guardar el cambio de aceite');
    
    // CORREGIDO: Manejo correcto de errores tipados
    if (error && typeof error === 'object' && error !== null) {
      const typedError = error as any;
      if (typedError.fieldErrors && typeof typedError.fieldErrors === 'object') {
        Object.keys(typedError.fieldErrors).forEach((field: string) => {
          const errorMessage = typedError.fieldErrors[field];
          if (typeof errorMessage === 'string') {
            setFieldError(field, errorMessage);
          }
        });
      }
    }
  } finally {
    setSubmitting(false);
  }
}}
        >
          {({ 
            handleChange, 
            handleBlur, 
            handleSubmit, 
            setFieldValue, 
            values, 
            errors, 
            touched, 
            isSubmitting,
            isValid,
            dirty
          }) => {
            console.log('Form state:', { isValid, dirty, errors, values });
            return (
              <View style={styles.form}>
                {/* Sección de Información del Cliente */}
                <Card style={styles.card}>
                  <Card.Content>
                    <Subheading style={styles.sectionTitle}>Información del Cliente</Subheading>
                    
                    <TextInput
                      label="Nombre del Cliente *"
                      value={values.nombreCliente}
                      onChangeText={handleChange('nombreCliente')}
                      onBlur={handleBlur('nombreCliente')}
                      error={touched.nombreCliente && !!errors.nombreCliente}
                      style={styles.input}
                      mode="outlined"
                      left={<TextInput.Icon icon="account" color={colors.primary} />}
                    />
                    {touched.nombreCliente && errors.nombreCliente && (
                      <HelperText type="error">{errors.nombreCliente}</HelperText>
                    )}
                    
                    <TextInput
                      label="Teléfono *"
                      value={values.celular}
                      onChangeText={handleChange('celular')}
                      onBlur={handleBlur('celular')}
                      error={touched.celular && !!errors.celular}
                      style={styles.input}
                      mode="outlined"
                      keyboardType="phone-pad"
                      left={<TextInput.Icon icon="phone" color={colors.primary} />}
                    />
                    {touched.celular && errors.celular && (
                      <HelperText type="error">{errors.celular}</HelperText>
                    )}
                  </Card.Content>
                </Card>

                {/* Sección de Información del Vehículo */}
                <Card style={styles.card}>
                  <Card.Content>
                    <Subheading style={styles.sectionTitle}>Información del Vehículo</Subheading>
                    
                    <TextInput
                      label="Dominio *"
                      value={values.dominioVehiculo}
                      onChangeText={handleChange('dominioVehiculo')}
                      onBlur={(e) => {
                        handleBlur('dominioVehiculo')(e);
                        handleDominioBlur(setFieldValue, values.dominioVehiculo);
                      }}
                      error={touched.dominioVehiculo && !!errors.dominioVehiculo}
                      style={styles.input}
                      mode="outlined"
                      autoCapitalize="characters"
                      left={<TextInput.Icon icon="car" color={colors.primary} />}
                    />
                    {touched.dominioVehiculo && errors.dominioVehiculo && (
                      <HelperText type="error">{errors.dominioVehiculo}</HelperText>
                    )}
                    
                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        <TextInput
                          label="Marca *"
                          value={values.marcaVehiculo}
                          onChangeText={handleChange('marcaVehiculo')}
                          onBlur={handleBlur('marcaVehiculo')}
                          error={touched.marcaVehiculo && !!errors.marcaVehiculo}
                          style={styles.input}
                          mode="outlined"
                          left={<TextInput.Icon icon="car-side" color={colors.primary} />}
                        />
                        {touched.marcaVehiculo && errors.marcaVehiculo && (
                          <HelperText type="error">{errors.marcaVehiculo}</HelperText>
                        )}
                      </View>
                      
                      <View style={styles.halfInput}>
                        <TextInput
                          label="Modelo *"
                          value={values.modeloVehiculo}
                          onChangeText={handleChange('modeloVehiculo')}
                          onBlur={handleBlur('modeloVehiculo')}
                          error={touched.modeloVehiculo && !!errors.modeloVehiculo}
                          style={styles.input}
                          mode="outlined"
                        />
                        {touched.modeloVehiculo && errors.modeloVehiculo && (
                          <HelperText type="error">{errors.modeloVehiculo}</HelperText>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        <TextInput
                          label="Año *"
                          value={values.añoVehiculo}
                          onChangeText={handleChange('añoVehiculo')}
                          onBlur={handleBlur('añoVehiculo')}
                          error={touched.añoVehiculo && !!errors.añoVehiculo}
                          style={styles.input}
                          mode="outlined"
                          keyboardType="numeric"
                          left={<TextInput.Icon icon="calendar" color={colors.primary} />}
                        />
                        {touched.añoVehiculo && errors.añoVehiculo && (
                          <HelperText type="error">{errors.añoVehiculo}</HelperText>
                        )}
                      </View>
                      
                      <View style={styles.halfInput}>
                        <Text style={styles.pickerLabel}>Tipo de Vehículo *</Text>
                        <View style={[
                          styles.pickerContainer, 
                          touched.tipoVehiculo && errors.tipoVehiculo ? styles.inputError : {}
                        ]}>
                          <Picker
                            selectedValue={values.tipoVehiculo}
                            onValueChange={(itemValue) => setFieldValue('tipoVehiculo', itemValue)}
                            style={styles.picker}
                          >
                            {vehicleTypes.map((type) => (
                              <Picker.Item key={type.value} label={type.label} value={type.value} />
                            ))}
                          </Picker>
                        </View>
                        {touched.tipoVehiculo && errors.tipoVehiculo && (
                          <HelperText type="error">{errors.tipoVehiculo}</HelperText>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        <TextInput
                          label="Kilómetros Actuales *"
                          value={values.kmActuales.toString()}
                          onChangeText={(value) => {
                            const numValue = parseInt(value) || 0;
                            handleKmChange(setFieldValue, numValue);
                          }}
                          onBlur={handleBlur('kmActuales')}
                          error={touched.kmActuales && !!errors.kmActuales}
                          style={styles.input}
                          mode="outlined"
                          keyboardType="numeric"
                          left={<TextInput.Icon icon="speedometer" color={colors.primary} />}
                        />
                        {touched.kmActuales && errors.kmActuales && (
                          <HelperText type="error">{errors.kmActuales}</HelperText>
                        )}
                      </View>
                      
                      <View style={styles.halfInput}>
                        <TextInput
                          label="Kilómetros Próximo Cambio *"
                          value={values.kmProximo.toString()}
                          onChangeText={(value) => {
                            const numValue = parseInt(value) || 0;
                            setFieldValue('kmProximo', numValue);
                          }}
                          onBlur={handleBlur('kmProximo')}
                          error={touched.kmProximo && !!errors.kmProximo}
                          style={styles.input}
                          mode="outlined"
                          keyboardType="numeric"
                          left={<TextInput.Icon icon="map-marker-distance" color={colors.primary} />}
                        />
                        {touched.kmProximo && errors.kmProximo && (
                          <HelperText type="error">{errors.kmProximo}</HelperText>
                        )}
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Sección de Servicio */}
                <Card style={styles.card}>
                  <Card.Content>
                    <Subheading style={styles.sectionTitle}>Información del Servicio</Subheading>
                    
                    <View style={styles.dateInputContainer}>
                      <Text style={styles.dateLabel}>Fecha del Servicio *</Text>
                      <Button 
                        mode="outlined" 
                        onPress={() => showDatePickerModal('fechaServicio')}
                        style={styles.dateButton}
                        icon="calendar"
                      >
                        {formatDate(values.fechaServicio)}
                      </Button>
                      {touched.fechaServicio && errors.fechaServicio && (
                        <HelperText type="error">{String(errors.fechaServicio)}</HelperText>
                      )}
                    </View>
                    
                    {showDatePicker && (
                      <DateTimePicker
                        value={values.fechaServicio || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => handleDateChange(setFieldValue, date)}
                      />
                    )}
                    
                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        <Text style={styles.pickerLabel}>Periodicidad (meses) *</Text>
                        <View style={[
                          styles.pickerContainer, 
                          touched.perioricidad_servicio && errors.perioricidad_servicio ? styles.inputError : {}
                        ]}>
                          <Picker
                            selectedValue={values.perioricidad_servicio}
                            onValueChange={(itemValue) => 
                              handlePeriodicityChange(setFieldValue, itemValue, values.fechaServicio)
                            }
                            style={styles.picker}
                          >
                            {changeIntervals.map((interval) => (
                              <Picker.Item 
                                key={interval.value} 
                                label={interval.label} 
                                value={interval.value} 
                              />
                            ))}
                          </Picker>
                        </View>
                        {touched.perioricidad_servicio && errors.perioricidad_servicio && (
                          <HelperText type="error">{String(errors.perioricidad_servicio)}</HelperText>
                        )}
                      </View>
                      
                      <View style={styles.halfInput}>
                        <View style={styles.dateInputContainer}>
                          <Text style={styles.dateLabel}>Fecha Próximo Cambio *</Text>
                          <Button 
                            mode="outlined" 
                            onPress={() => showDatePickerModal('fechaProximoCambio')}
                            style={styles.dateButton}
                            icon="calendar"
                          >
                            {formatDate(values.fechaProximoCambio)}
                          </Button>
                          {touched.fechaProximoCambio && errors.fechaProximoCambio && (
                            <HelperText type="error">{String(errors.fechaProximoCambio)}</HelperText>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    {showNextDatePicker && (
                      <DateTimePicker
                        value={values.fechaProximoCambio || moment().add(3, 'months').toDate()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => handleDateChange(setFieldValue, date)}
                        minimumDate={values.fechaServicio}
                      />
                    )}
                  </Card.Content>
                </Card>

                {/* Sección de Aceite */}
                <Card style={styles.card}>
                  <Card.Content>
                    <Subheading style={styles.sectionTitle}>Información del Aceite</Subheading>
                    
                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        <Text style={styles.pickerLabel}>Tipo de Aceite *</Text>
                        <View style={[
                          styles.pickerContainer, 
                          touched.tipoAceite && errors.tipoAceite ? styles.inputError : {}
                        ]}>
                          <Picker
                            selectedValue={values.tipoAceite}
                            onValueChange={(itemValue) => setFieldValue('tipoAceite', itemValue)}
                            style={styles.picker}
                          >
                            {oilTypes.map((type) => (
                              <Picker.Item key={type.value} label={type.label} value={type.value} />
                            ))}
                          </Picker>
                        </View>
                        {touched.tipoAceite && errors.tipoAceite && (
                          <HelperText type="error">{errors.tipoAceite}</HelperText>
                        )}
                      </View>
                      
                      <View style={styles.halfInput}>
                        <Text style={styles.pickerLabel}>Marca de Aceite *</Text>
                        <View style={[
                          styles.pickerContainer, 
                          touched.marcaAceite && errors.marcaAceite ? styles.inputError : {}
                        ]}>
                          <Picker
                            selectedValue={values.marcaAceite}
                            onValueChange={(itemValue) => setFieldValue('marcaAceite', itemValue)}
                            style={styles.picker}
                          >
                            {oilBrands.map((brand) => (
                              <Picker.Item key={brand.value} label={brand.label} value={brand.value} />
                            ))}
                          </Picker>
                        </View>
                        {touched.marcaAceite && errors.marcaAceite && (
                          <HelperText type="error">{errors.marcaAceite}</HelperText>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.row}>
                      <View style={styles.halfInput}>
                        <Text style={styles.pickerLabel}>Viscosidad (SAE) *</Text>
                        <View style={[
                          styles.pickerContainer, 
                          touched.sae && errors.sae ? styles.inputError : {}
                        ]}>
                          <Picker
                            selectedValue={values.sae}
                            onValueChange={(itemValue) => setFieldValue('sae', itemValue)}
                            style={styles.picker}
                          >
                            {saeOptions.map((option) => (
                              <Picker.Item key={option.value} label={option.label} value={option.value} />
                            ))}
                          </Picker>
                        </View>
                        {touched.sae && errors.sae && (
                          <HelperText type="error">{errors.sae}</HelperText>
                        )}
                      </View>
                      
                      <View style={styles.halfInput}>
                        <TextInput
                          label="Cantidad de Aceite *"
                          value={values.cantidadAceite}
                          onChangeText={handleChange('cantidadAceite')}
                          onBlur={handleBlur('cantidadAceite')}
                          error={touched.cantidadAceite && !!errors.cantidadAceite}
                          style={styles.input}
                          mode="outlined"
                          left={<TextInput.Icon icon="water" color={colors.primary} />}
                        />
                        {touched.cantidadAceite && errors.cantidadAceite && (
                          <HelperText type="error">{errors.cantidadAceite}</HelperText>
                        )}
                      </View>
                    </View>
                  </Card.Content>
                </Card>

             {/* Sección de Servicios Realizados - Corregida */}
              <Card style={styles.card}>
                <Card.Content>
                  <Subheading style={styles.sectionTitle}>Servicios Realizados</Subheading>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Filtro de Aceite</Text>
                      <Switch
                        value={values.filtroAceite}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'filtroAceite', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.filtroAceiteNota}
                      onChangeText={handleChange('filtroAceiteNota')}
                      onBlur={handleBlur('filtroAceiteNota')}
                      error={touched.filtroAceiteNota && !!errors.filtroAceiteNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.filtroAceite}
                    />
                    {touched.filtroAceiteNota && errors.filtroAceiteNota && (
                      <HelperText type="error">{String(errors.filtroAceiteNota)}</HelperText>
                    )}
                  </View>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Filtro de Aire</Text>
                      <Switch
                        value={values.filtroAire}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'filtroAire', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.filtroAireNota}
                      onChangeText={handleChange('filtroAireNota')}
                      onBlur={handleBlur('filtroAireNota')}
                      error={touched.filtroAireNota && !!errors.filtroAireNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.filtroAire}
                    />
                    {touched.filtroAireNota && errors.filtroAireNota && (
                      <HelperText type="error">{String(errors.filtroAireNota)}</HelperText>
                    )}
                  </View>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Filtro de Combustible</Text>
                      <Switch
                        value={values.filtroCombustible}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'filtroCombustible', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.filtroCombustibleNota}
                      onChangeText={handleChange('filtroCombustibleNota')}
                      onBlur={handleBlur('filtroCombustibleNota')}
                      error={touched.filtroCombustibleNota && !!errors.filtroCombustibleNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.filtroCombustible}
                    />
                    {touched.filtroCombustibleNota && errors.filtroCombustibleNota && (
                      <HelperText type="error">{String(errors.filtroCombustibleNota)}</HelperText>
                    )}
                  </View>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Filtro de Habitáculo</Text>
                      <Switch
                        value={values.filtroHabitaculo}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'filtroHabitaculo', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.filtroHabitaculoNota}
                      onChangeText={handleChange('filtroHabitaculoNota')}
                      onBlur={handleBlur('filtroHabitaculoNota')}
                      error={touched.filtroHabitaculo && !!errors.filtroHabitaculoNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.filtroHabitaculo}
                    />
                    {touched.filtroHabitaculoNota && errors.filtroHabitaculoNota && (
                      <HelperText type="error">{String(errors.filtroHabitaculoNota)}</HelperText>
                    )}
                  </View>
                </Card.Content>
              </Card>

              {/* Sección de Servicios Adicionales - Corregida */}
              <Card style={styles.card}>
                <Card.Content>
                  <Subheading style={styles.sectionTitle}>Servicios Adicionales</Subheading>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Aditivo</Text>
                      <Switch
                        value={values.aditivo}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'aditivo', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.aditivoNota}
                      onChangeText={handleChange('aditivoNota')}
                      onBlur={handleBlur('aditivoNota')}
                      error={touched.aditivoNota && !!errors.aditivoNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.aditivo}
                    />
                    {touched.aditivoNota && errors.aditivoNota && (
                      <HelperText type="error">{String(errors.aditivoNota)}</HelperText>
                    )}
                  </View>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Engrase</Text>
                      <Switch
                        value={values.engrase}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'engrase', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.engraseNota}
                      onChangeText={handleChange('engraseNota')}
                      onBlur={handleBlur('engraseNota')}
                      error={touched.engraseNota && !!errors.engraseNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.engrase}
                    />
                    {touched.engraseNota && errors.engraseNota && (
                      <HelperText type="error">{String(errors.engraseNota)}</HelperText>
                    )}
                  </View>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Refrigerante</Text>
                      <Switch
                        value={values.refrigerante}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'refrigerante', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.refrigeranteNota}
                      onChangeText={handleChange('refrigeranteNota')}
                      onBlur={handleBlur('refrigeranteNota')}
                      error={touched.refrigeranteNota && !!errors.refrigeranteNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.refrigerante}
                    />
                    {touched.refrigeranteNota && errors.refrigeranteNota && (
                      <HelperText type="error">{String(errors.refrigeranteNota)}</HelperText>
                    )}
                  </View>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Caja</Text>
                      <Switch
                        value={values.caja}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'caja', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.cajaNota}
                      onChangeText={handleChange('cajaNota')}
                      onBlur={handleBlur('cajaNota')}
                      error={touched.cajaNota && !!errors.cajaNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.caja}
                    />
                    {touched.cajaNota && errors.cajaNota && (
                      <HelperText type="error">{String(errors.cajaNota)}</HelperText>
                    )}
                  </View>
                  
                  <View style={styles.serviceItem}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceTitle}>Diferencial</Text>
                      <Switch
                        value={values.diferencial}
                        onValueChange={(value) => {
                          handleServiceSwitch(setFieldValue, 'diferencial', value);
                        }}
                        color={colors.primary}
                      />
                    </View>
                    
                    <TextInput
                      label="Nota"
                      value={values.diferencialNota}
                      onChangeText={handleChange('diferencialNota')}
                      onBlur={handleBlur('diferencialNota')}
                      error={touched.diferencialNota && !!errors.diferencialNota}
                      style={styles.serviceInput}
                      mode="outlined"
                      disabled={!values.diferencial}
                    />
                    {touched.diferencialNota && errors.diferencialNota && (
                      <HelperText type="error">{String(errors.diferencialNota)}</HelperText>
                    )}
                  </View>
                </Card.Content>
              </Card>

               {/* Sección de Observaciones */}
               <Card style={styles.card}>
                 <Card.Content>
                   <Subheading style={styles.sectionTitle}>Observaciones</Subheading>
                   
                   <TextInput
                     label="Observaciones (opcional)"
                     value={values.observaciones}
                     onChangeText={handleChange('observaciones')}
                     onBlur={handleBlur('observaciones')}
                     error={touched.observaciones && !!errors.observaciones}
                     style={styles.input}
                     mode="outlined"
                     multiline
                     numberOfLines={4}
                   />
                   {touched.observaciones && errors.observaciones && (
                     <HelperText type="error">{errors.observaciones}</HelperText>
                   )}
                 </Card.Content>
               </Card>
               
               {/* Botones de acción */}
               <View style={styles.buttonContainer}>
                 <Button
                   mode="contained"
                   onPress={() => {
                     console.log('Submit button pressed');
                     handleSubmit();
                   }}
                   style={styles.submitButton}
                   loading={isSubmitting}
                   disabled={isSubmitting}
                   icon={isEditing ? "content-save" : "check"}
                 >
                   {isEditing ? 'Guardar Cambios' : 'Registrar Cambio'}
                 </Button>
               </View>
             </View>
           );
         }}
       </Formik>
     </ScrollView>
   </KeyboardAvoidingView>
 );
};

const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: colors.background,
   },
   scrollView: {
     flex: 1,
   },
   form: {
     padding: 16,
     paddingBottom: 40,
   },
   card: {
     marginBottom: 16,
     borderRadius: 8,
     elevation: 2,
   },
   sectionTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: colors.primary,
     marginBottom: 16,
   },
   input: {
     marginBottom: 12,
     backgroundColor: colors.surface,
   },
   row: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginBottom: 4,
   },
   halfInput: {
     width: '48%',
   },
   pickerLabel: {
     fontSize: 12,
     color: colors.text,
     marginBottom: 4,
     marginLeft: 4,
   },
   pickerContainer: {
     borderWidth: 1,
     borderColor: colors.disabled,
     borderRadius: 4,
     marginBottom: 12,
     backgroundColor: colors.surface,
   },
   picker: {
     height: 50,
   },
   inputError: {
     borderColor: colors.error,
   },
   dateInputContainer: {
     marginBottom: 12,
   },
   dateLabel: {
     fontSize: 12,
     color: colors.text,
     marginBottom: 4,
     marginLeft: 4,
   },
   dateButton: {
     borderColor: colors.primary,
   },
   serviceItem: {
     marginBottom: 16,
     borderBottomWidth: 1,
     borderBottomColor: colors.divider,
     paddingBottom: 16,
   },
   serviceHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 8,
   },
   serviceTitle: {
     fontSize: 16,
     fontWeight: 'bold',
     color: colors.text,
   },
   serviceInput: {
     backgroundColor: colors.surface,
   },
   buttonContainer: {
     marginTop: 16,
     marginBottom: 32,
   },
   submitButton: {
     padding: 8,
     backgroundColor: colors.primary,
   },
 });
 
 export default CambioForm;