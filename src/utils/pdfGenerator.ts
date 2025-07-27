// src/utils/pdfGenerator.ts - MODELO QUE FUNCIONABA + DATOS REALES DEL LUBRICENTRO
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
  
  // Estilo CSS EXACTO del modelo que funcionaba
  const styles = `
    <style>
      body {
        font-family: 'Helvetica', Arial, sans-serif;
        color: #333;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        font-size: 12px;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 10px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #2E7D32;
        padding-bottom: 10px;
        margin-bottom: 15px;
      }
      .header-left {
        flex: 2;
      }
      .header-right {
        flex: 1;
        text-align: right;
      }
      .logo {
        max-width: 150px;
        margin-bottom: 5px;
      }
      .company-name {
        font-size: 22px;
        font-weight: bold;
        color: #2E7D32;
        margin: 0;
      }
      .company-details {
        font-size: 11px;
        color: #666;
        margin: 2px 0;
      }
      .document-title {
        font-size: 14px;
        font-weight: bold;
        margin: 5px 0;
        text-transform: uppercase;
      }
      .document-number {
        font-size: 16px;
        font-weight: bold;
        color: #2E7D32;
        margin: 3px 0;
        padding: 5px;
        border: 1px solid #2E7D32;
        display: inline-block;
      }
      .document-date {
        margin: 5px 0;
      }
      .content-section {
        margin-bottom: 15px;
        display: flex;
        flex-wrap: wrap;
      }
      .section-title {
        font-size: 14px;
        font-weight: bold;
        color: #2E7D32;
        width: 100%;
        padding-bottom: 3px;
        border-bottom: 1px solid #ddd;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      .info-column {
        flex: 1;
        min-width: 250px;
        margin-right: 15px;
      }
      .info-row {
        display: flex;
        margin-bottom: 5px;
      }
      .info-label {
        width: 120px;
        font-weight: bold;
        font-size: 11px;
      }
      .info-value {
        flex: 1;
        font-size: 11px;
      }
      .services-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 8px;
        width: 100%;
      }
      .service-item {
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-size: 11px;
      }
      .service-title {
        font-weight: bold;
        margin-bottom: 3px;
        display: flex;
        justify-content: space-between;
      }
      .service-note {
        font-size: 10px;
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
        margin-top: 10px;
        padding: 8px;
        background-color: #f9f9f9;
        border-radius: 3px;
        font-size: 11px;
      }
      .footer {
        margin-top: 15px;
        text-align: center;
        font-size: 10px;
        color: #666;
        padding-top: 10px;
        border-top: 1px solid #ddd;
      }
      .alert-box {
        background-color: #FFF9C4;
        border-left: 4px solid #FFC107;
        padding: 8px;
        margin: 10px 0;
        font-size: 12px;
      }
      .danger-box {
        background-color: #FFEBEE;
        border-left: 4px solid #B71C1C;
        padding: 8px;
        margin: 10px 0;
        font-size: 12px;
      }
      .signature-area {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-top: 40px;
        margin-bottom: 20px;
      }
      .signature-box {
        width: 45%;
        text-align: center;
      }
      .signature-line {
        border-top: 1px solid #333;
        margin-top: 30px;
        padding-top: 5px;
      }
      @page {
        size: A4;
        margin: 10mm;
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
  
  // Generar HTML para servicios realizados - EXACTO como el modelo
  const serviciosHtml = `
    <div class="services-grid">
      <div class="service-item">
        <div class="service-title">
          Filtro de aceite 
          <span class="${cambio.filtroAceite ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroAceite ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroAceiteNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Filtro de aire
          <span class="${cambio.filtroAire ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroAire ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroAireNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Filtro de combustible
          <span class="${cambio.filtroCombustible ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroCombustible ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroCombustibleNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Filtro de habitáculo
          <span class="${cambio.filtroHabitaculo ? 'service-done' : 'service-not-done'}">
            ${cambio.filtroHabitaculo ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.filtroHabitaculoNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Aditivo
          <span class="${cambio.aditivo ? 'service-done' : 'service-not-done'}">
            ${cambio.aditivo ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.aditivoNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Engrase
          <span class="${cambio.engrase ? 'service-done' : 'service-not-done'}">
            ${cambio.engrase ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.engraseNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Refrigerante
          <span class="${cambio.refrigerante ? 'service-done' : 'service-not-done'}">
            ${cambio.refrigerante ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.refrigeranteNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Caja
          <span class="${cambio.caja ? 'service-done' : 'service-not-done'}">
            ${cambio.caja ? '✓' : '✗'}
          </span>
        </div>
        <div class="service-note">${cambio.cajaNota || 'Sin notas'}</div>
      </div>
      
      <div class="service-item">
        <div class="service-title">
          Diferencial
          <span class="${cambio.diferencial ? 'service-done' : 'service-not-done'}">
            ${cambio.diferencial ? '✓' : '✗'}
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
  
  // HTML completo - EXACTO como el modelo pero con DATOS REALES
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comprobante de Cambio de Aceite ${cambio.nroCambio}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <h1 class="company-name">${cambio.lubricentroNombre}</h1>
            <p class="company-details">Servicios de mantenimiento automotor</p>
            <p class="company-details">
              ${cambio.lubricentro?.phone ? `Tel: ${cambio.lubricentro.phone}` : 'Tel: Consultar'} | 
              ${cambio.lubricentro?.email ? `Email: ${cambio.lubricentro.email}` : 'Email: Consultar'}
            </p>
            ${cambio.lubricentro?.domicilio ? `<p class="company-details">📍 ${cambio.lubricentro.domicilio}</p>` : ''}
            ${cambio.lubricentro?.cuit ? `<p class="company-details">🏢 CUIT: ${cambio.lubricentro.cuit}</p>` : ''}
            <p class="document-title">Comprobante de Cambio de Aceite</p>
          </div>
          <div class="header-right">
            <div class="document-number">N° ${cambio.nroCambio}</div>
            <div class="document-date">
              <strong>Fecha:</strong> ${fechaServicio}
            </div>
            <div class="document-date">
              <strong>Emisión:</strong> ${fechaCreacion}
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <div class="section-title">Datos del Cliente</div>
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">Cliente:</div>
              <div class="info-value">${cambio.nombreCliente}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Teléfono:</div>
              <div class="info-value">${cambio.celular}</div>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <div class="section-title">Datos del Vehículo</div>
          <div class="info-column">
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
          </div>
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">Kilometraje actual:</div>
              <div class="info-value">${cambio.kmActuales.toLocaleString()} km</div>
            </div>
            <div class="info-row">
              <div class="info-label">Próximo cambio:</div>
              <div class="info-value">${cambio.kmProximo.toLocaleString()} km</div>
            </div>
            <div class="info-row">
              <div class="info-label">Próxima fecha:</div>
              <div class="info-value">${fechaProximo}</div>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <div class="section-title">Aceite Utilizado</div>
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">Tipo de aceite:</div>
              <div class="info-value">${cambio.tipoAceite}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Marca:</div>
              <div class="info-value">${cambio.marcaAceite}</div>
            </div>
          </div>
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">Viscosidad (SAE):</div>
              <div class="info-value">${cambio.sae}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Cantidad:</div>
              <div class="info-value">${cambio.cantidadAceite}</div>
            </div>
          </div>
        </div>
        
        ${alertaHtml}
        
        <div class="content-section">
          <div class="section-title">Servicios Realizados</div>
          ${serviciosHtml}
        </div>
        
        <div class="signature-area">
          <div class="signature-box">
            <div class="signature-line">Firma del Responsable</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Firma del Cliente</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Este documento es un comprobante del servicio realizado.</p>
          <p>© ${new Date().getFullYear()} ${cambio.lubricentroNombre} - Todos los derechos reservados</p>
          ${cambio.lubricentro?.phone ? `<p>Consultas: ${cambio.lubricentro.phone}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
};