// src/utils/pdfGenerator.ts
import { CambioAceite } from '../interfaces';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

// Función para generar el HTML del PDF de un cambio de aceite
export const generatePdfHtml = (cambio: CambioAceite): string => {
  // Formatear fechas
  const fechaServicio = moment(cambio.fechaServicio).format('DD/MM/YYYY');
  const fechaProximo = moment(cambio.fechaProximoCambio).format('DD/MM/YYYY');
  const fechaCreacion = moment(cambio.createdAt).format('DD/MM/YYYY HH:mm');
  
  // Estilo CSS para el PDF
  const styles = `
    <style>
      body {
        font-family: 'Helvetica', Arial, sans-serif;
        color: #333;
        line-height: 1.4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #2E7D32;
        padding-bottom: 20px;
      }
      .logo {
        max-width: 150px;
        margin-bottom: 10px;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        color: #2E7D32;
        margin: 5px 0;
      }
      .subtitle {
        font-size: 18px;
        color: #666;
        margin: 5px 0;
      }
      .cambio-number {
        font-size: 20px;
        font-weight: bold;
        color: #2E7D32;
        margin: 10px 0;
      }
      .section {
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      .section-title {
        font-size: 18px;
        font-weight: bold;
        color: #2E7D32;
        margin-bottom: 15px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
      }
      .info-row {
        display: flex;
        margin-bottom: 10px;
      }
      .info-label {
        width: 180px;
        font-weight: bold;
      }
      .info-value {
        flex: 1;
      }
      .services-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;
      }
      .service-item {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .service-title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .service-note {
        font-size: 13px;
        color: #666;
        font-style: italic;
      }
      .service-done {
        color: #4CAF50;
      }
      .service-not-done {
        color: #B71C1C;
      }
      .observations {
        margin-top: 15px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 4px;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .alert-box {
        background-color: #FFF9C4;
        border-left: 4px solid #FFC107;
        padding: 10px 15px;
        margin: 15px 0;
      }
      .danger-box {
        background-color: #FFEBEE;
        border-left: 4px solid #B71C1C;
        padding: 10px 15px;
        margin: 15px 0;
      }
    </style>
  `;
  
  // Calcular días para próximo cambio
  const diasParaProximoCambio = moment(cambio.fechaProximoCambio).diff(moment(), 'days');
  const esProximoCambio = diasParaProximoCambio <= 7 && diasParaProximoCambio > 0;
  const esCambioVencido = diasParaProximoCambio < 0;
  
  // Alerta de próximo cambio/vencido
  let alertaHtml = '';
  if (esCambioVencido) {
    alertaHtml = `
      <div class="danger-box">
        <strong>¡ALERTA!</strong> Cambio vencido hace ${Math.abs(diasParaProximoCambio)} días.
      </div>
    `;
  } else if (esProximoCambio) {
    alertaHtml = `
      <div class="alert-box">
        <strong>¡ATENCIÓN!</strong> Próximo cambio en ${diasParaProximoCambio} días.
      </div>
    `;
  }
  
  // Generar HTML para servicios realizados
  const serviciosHtml = `
    <div class="services-grid">
      <div class="service-item">
        <div class="service-title">
          Filtro de aceite: <span class="${cambio.filtroAceite ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroAceite ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroAceiteNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Filtro de aire: <span class="${cambio.filtroAire ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroAire ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroAireNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Filtro de combustible: <span class="${cambio.filtroCombustible ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroCombustible ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroCombustibleNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Filtro de habitáculo: <span class="${cambio.filtroHabitaculo ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroHabitaculo ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroHabitaculoNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Aditivo: <span class="${cambio.aditivo ? 'service-done' : 'service-not-done'}">
            ${cambio.aditivo ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.aditivoNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Engrase: <span class="${cambio.engrase ? 'service-done' : 'service-not-done'}">
            ${cambio.engrase ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.engraseNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Refrigerante: <span class="${cambio.refrigerante ? 'service-done' : 'service-not-done'}">
            ${cambio.refrigerante ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.refrigeranteNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Caja: <span class="${cambio.caja ? 'service-done' : 'service-not-done'}">
            ${cambio.caja ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.cajaNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Diferencial: <span class="${cambio.diferencial ? 'service-done' : 'service-not-done'}">
            ${cambio.diferencial ? 'Realizado' : 'No realizado'}
          </span>
        </div>
        <div class="service-note">${cambio.diferencialNota || 'Sin notas'}</div>
      </div>
    </div>
    
    ${cambio.observaciones ? `
      <div class="observations">
        <strong>Observaciones:</strong><br>
        ${cambio.observaciones}
      </div>
    ` : ''}
  `;
  
  // HTML completo para el PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Cambio de Aceite ${cambio.nroCambio}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">${cambio.lubricentroNombre}</div>
          <div class="subtitle">Comprobante de Cambio de Aceite</div>
          <div class="cambio-number">${cambio.nroCambio}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Información del Cliente</div>
          <div class="info-row">
            <div class="info-label">Cliente:</div>
            <div class="info-value">${cambio.nombreCliente}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Teléfono:</div>
            <div class="info-value">${cambio.celular}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Información del Vehículo</div>
          <div class="info-row">
            <div class="info-label">Vehículo:</div>
            <div class="info-value">${cambio.marcaVehiculo} ${cambio.modeloVehiculo} (${cambio.añoVehiculo})</div>
          </div>
          <div class="info-row">
            <div class="info-label">Dominio:</div>
            <div class="info-value">${cambio.dominioVehiculo}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Tipo:</div>
            <div class="info-value">${cambio.tipoVehiculo}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Kilometraje actual:</div>
            <div class="info-value">${cambio.kmActuales} km</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Aceite y Servicio</div>
          <div class="info-row">
            <div class="info-label">Tipo de aceite:</div>
            <div class="info-value">${cambio.tipoAceite}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Marca:</div>
            <div class="info-value">${cambio.marcaAceite}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Viscosidad (SAE):</div>
            <div class="info-value">${cambio.sae}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Cantidad:</div>
            <div class="info-value">${cambio.cantidadAceite}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Fecha del servicio:</div>
            <div class="info-value">${fechaServicio}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Próximo cambio:</div>
            <div class="info-value">${fechaProximo} o ${cambio.kmProximo} km</div>
          </div>
        </div>
        
        ${alertaHtml}
        
        <div class="section">
          <div class="section-title">Servicios Realizados</div>
          ${serviciosHtml}
        </div>
        
        <div class="section">
          <div class="section-title">Información Adicional</div>
          <div class="info-row">
            <div class="info-label">Atendido por:</div>
            <div class="info-value">${cambio.nombreOperario}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Fecha de emisión:</div>
            <div class="info-value">${fechaCreacion}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Este documento es un comprobante del servicio realizado.</p>
          <p>© ${new Date().getFullYear()} ${cambio.lubricentroNombre} - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
};