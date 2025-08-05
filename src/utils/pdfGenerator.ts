// src/utils/pdfGenerator.ts - DISEÑO EXACTO DEL SISTEMA WEB
import { CambioAceite } from '../interfaces';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

/**
 * Genera el HTML para el PDF con el MISMO diseño exacto que el sistema web
 * Recreando el diseño profesional con borde verde y layout de dos columnas
 */
export const generatePdfHtml = (cambio: CambioAceite): string => {
  
  // === FORMATEO DE FECHAS ===
  const fechaServicio = moment(cambio.fechaServicio).format('DD/MM/YYYY');
  const fechaProximo = moment(cambio.fechaProximoCambio).format('DD/MM/YYYY');
  
  // === GENERAR GRID DE SERVICIOS COMO EN EL PDF ORIGINAL ===
  const servicios = [
    { nombre: 'Filtro de Aceite', realizado: cambio.filtroAceite },
    { nombre: 'Filtro de Aire', realizado: cambio.filtroAire },
    { nombre: 'Filtro de Habitáculo', realizado: cambio.filtroHabitaculo },
    { nombre: 'Filtro de Combustible', realizado: cambio.filtroCombustible },
    { nombre: 'Aditivo', realizado: cambio.aditivo },
    { nombre: 'Refrigerante', realizado: cambio.refrigerante },
    { nombre: 'Diferencial', realizado: cambio.diferencial },
    { nombre: 'Caja', realizado: cambio.caja },
    { nombre: 'Engrase', realizado: cambio.engrase }
  ];

  // Generar HTML para servicios en grid de 3 columnas
  const serviciosHtml = servicios.map(servicio => `
    <div class="service-box ${servicio.realizado ? 'service-done' : 'service-not-done'}">
      <span class="service-check">${servicio.realizado ? '✓' : '✗'}</span>
      <span class="service-name">${servicio.nombre}</span>
    </div>
  `).join('');

  // === ESTILOS CSS EXACTOS DEL PDF ORIGINAL ===
  const styles = `
    <style>
      /* === CONFIGURACIÓN GENERAL === */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        background: white;
      }
      
      .container {
        width: 210mm;        /* Ancho A4 */
        min-height: 297mm;   /* Alto A4 */
        margin: 0 auto;
        background: white;
        position: relative;
      }
      
      /* === BORDE VERDE SUPERIOR === */
      .top-border {
        height: 30px;
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      
      /* === BORDE VERDE INFERIOR === */
      .bottom-border {
        height: 30px;
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
      }
      
      /* === CONTENIDO PRINCIPAL === */
      .content {
        padding: 40px 30px 80px 30px; /* Espacio para bordes verdes */
        min-height: 297mm;
        position: relative;
      }
      
      /* === ENCABEZADO EXACTO COMO EL ORIGINAL === */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 3px solid #4CAF50;
        min-height: 90px;
      }
      
      .header-left {
        display: flex;
        align-items: flex-start;
        flex: 1;
        gap: 15px;
      }
      
      .logo {
        width: 90px;
        height: 90px;
        border-radius: 6px;
        object-fit: contain;
        flex-shrink: 0;
      }
      
      .company-info {
        flex: 1;
      }
      
      .company-info h1 {
        font-size: 26px;
        font-weight: bold;
        color: #4CAF50;
        margin-bottom: 6px;
        line-height: 1.1;
      }
      
      .company-details {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
      
      .header-right {
        text-align: right;
        flex-shrink: 0;
        align-self: flex-start;
      }
      
      /* === TÍTULO Y NÚMERO DEL DOCUMENTO === */
      .header-title-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .document-title {
        font-size: 17px;
        font-weight: bold;
        color: #333;
        flex: 1;
      }
      
      .document-number {
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 16px;
        font-weight: bold;
        min-width: 140px;
        text-align: center;
      }
      
      /* === DOMINIO DESTACADO === */
      .dominio-header {
        background: #E8F5E9;
        color: #2E7D32;
        text-align: center;
        padding: 12px;
        font-size: 18px;
        font-weight: bold;
        margin: 18px 0;
        border-radius: 6px;
        border: 2px solid #4CAF50;
      }
      
      /* === SECCIONES DE DATOS === */
      .data-section {
        margin-bottom: 20px;
      }
      
      .section-header {
        background: #4CAF50;
        color: white;
        padding: 8px 15px;
        font-size: 13px;
        font-weight: bold;
        margin-bottom: 10px;
        border-radius: 4px;
      }
      
      .section-content {
        background: #F9F9F9;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #E0E0E0;
      }
      
      /* === LAYOUT DE DOS COLUMNAS === */
      .two-columns {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
      }
      
      .column {
        flex: 1;
      }
      
      .data-row {
        display: flex;
        margin-bottom: 8px;
        align-items: center;
      }
      
      .data-label {
        font-weight: bold;
        color: #333;
        min-width: 120px;
        margin-right: 10px;
      }
      
      .data-value {
        color: #555;
        flex: 1;
      }
      
      /* === SECCIÓN ESPECIAL PARA DETALLES DEL SERVICIO === */
      .service-details {
        background: #FFF8E1;
        border: 2px solid #FFC107;
        border-radius: 6px;
        padding: 15px;
        margin: 15px 0;
      }
      
      .service-details .section-header {
        background: #FFC107;
        color: #333;
        margin: -15px -15px 15px -15px;
      }
      
      /* === GRID DE SERVICIOS ADICIONALES === */
      .services-section {
        margin: 20px 0;
      }
      
      .services-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 15px;
      }
      
      .service-box {
        border: 2px solid;
        padding: 10px 8px;
        text-align: center;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-height: 45px;
        font-size: 11px;
      }
      
      .service-done {
        border-color: #4CAF50;
        background: #E8F5E9;
        color: #2E7D32;
      }
      
      .service-not-done {
        border-color: #F44336;
        background: #FFEBEE;
        color: #C62828;
      }
      
      .service-check {
        font-size: 16px;
        font-weight: bold;
        margin-right: 8px;
      }
      
      .service-name {
        font-weight: 500;
      }
      
      /* === ÁREA DE FIRMAS === */
      .signatures {
        margin-top: 40px;
        display: flex;
        justify-content: space-between;
        gap: 70px;
      }
      
      .signature-box {
        text-align: center;
        flex: 1;
      }
      
      .signature-line {
        border-top: 2px solid #333;
        margin-bottom: 8px;
        height: 50px;
        display: flex;
        align-items: end;
        justify-content: center;
      }
      
      .signature-label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
      }
      
      /* === PIE DE PÁGINA === */
      .footer {
        position: absolute;
        bottom: 50px;
        left: 30px;
        right: 30px;
        text-align: center;
        font-size: 10px;
        color: #666;
        line-height: 1.4;
      }
      
      .footer-line {
        height: 1px;
        background: #4CAF50;
        margin: 15px 0 10px 0;
      }
      
      /* === CONFIGURACIÓN PARA IMPRESIÓN === */
      @page {
        size: A4;
        margin: 0;
      }
      
      @media print {
        .container {
          width: 100%;
          min-height: 100vh;
        }
      }
    </style>
  `;

  // === HTML COMPLETO DEL DOCUMENTO ===
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
        <!-- Borde verde superior -->
        <div class="top-border"></div>
        
        <div class="content">
          <!-- === ENCABEZADO EXACTO === -->
          <div class="header">
            <div class="header-left">
              <!-- Logo del lubricentro -->
              ${cambio.lubricentro?.logoUrl ? `
                <img src="${cambio.lubricentro.logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'">
              ` : `
                <div class="logo" style="background: #4CAF50; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold;">
                  🛢️
                </div>
              `}
              
          
            
            <div class="header-right">
              <div class="company-info">
                <h1 style="margin: 0; text-align: right;">${cambio.lubricentroNombre}</h1>
                <div class="company-details" style="text-align: right; margin-top: 4px;">
                  ${cambio.lubricentro?.domicilio || ''}<br>
                  Tel: ${cambio.lubricentro?.phone || ''}<br>
                  ${cambio.lubricentro?.email || ''}
                </div>
              </div>
            </div>
          </div>
          
          <!-- === TÍTULO Y NÚMERO === -->
          <div class="header-title-section">
            <div class="document-title">COMPROBANTE DE CAMBIO DE ACEITE</div>
            <div class="document-number">N° ${cambio.nroCambio}</div>
          </div>
          
          <!-- === DOMINIO DESTACADO === -->
          <div class="dominio-header">DOMINIO: ${cambio.dominioVehiculo}</div>
          
          <!-- === DATOS EN DOS COLUMNAS === -->
          <div class="two-columns">
            <!-- Columna izquierda - Datos del cliente -->
            <div class="column">
              <div class="data-section">
                <div class="section-header">DATOS DEL CLIENTE</div>
                <div class="section-content">
                  <div class="data-row">
                    <span class="data-label">Cliente:</span>
                    <span class="data-value">${cambio.nombreCliente}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Teléfono:</span>
                    <span class="data-value">${cambio.celular}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Fecha servicio:</span>
                    <span class="data-value">${fechaServicio}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Operario:</span>
                    <span class="data-value">${cambio.nombreOperario}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Columna derecha - Datos del vehículo -->
            <div class="column">
              <div class="data-section">
                <div class="section-header">DATOS DEL VEHÍCULO</div>
                <div class="section-content">
                  <div class="data-row">
                    <span class="data-label">Marca:</span>
                    <span class="data-value">${cambio.marcaVehiculo}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Modelo:</span>
                    <span class="data-value">${cambio.modeloVehiculo}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Tipo:</span>
                    <span class="data-value">${cambio.tipoVehiculo}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Año:</span>
                    <span class="data-value">${cambio.añoVehiculo || 'No especificado'}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">Kilometraje:</span>
                    <span class="data-value">${cambio.kmActuales.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- === DETALLES DEL SERVICIO === -->
          <div class="service-details">
            <div class="section-header">DETALLES DEL SERVICIO</div>
            <div class="two-columns">
              <div class="column">
                <div class="data-row">
                  <span class="data-label">Aceite:</span>
                  <span class="data-value">${cambio.marcaAceite} ${cambio.tipoAceite} ${cambio.sae}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Cantidad:</span>
                  <span class="data-value">${cambio.cantidadAceite}</span>
                </div>
              </div>
              <div class="column">
                <div class="data-row">
                  <span class="data-label">Próx. cambio km:</span>
                  <span class="data-value">${cambio.kmProximo.toLocaleString()} km</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Próx. cambio fecha:</span>
                  <span class="data-value">${fechaProximo}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- === FILTROS Y SERVICIOS ADICIONALES === -->
          <div class="services-section">
            <div class="section-header">FILTROS Y SERVICIOS ADICIONALES</div>
            <div class="services-grid">
              ${serviciosHtml}
            </div>
          </div>
          
          <!-- === OBSERVACIONES (si existen) === -->
          ${cambio.observaciones ? `
            <div class="data-section">
              <div class="section-header">OBSERVACIONES</div>
              <div class="section-content">
                ${cambio.observaciones}
              </div>
            </div>
          ` : ''}
          
          <!-- === ÁREA DE FIRMAS === -->
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Firma del Operario</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Firma del Cliente</div>
            </div>
          </div>
        </div>
        
        <!-- === PIE DE PÁGINA === -->
        <div class="footer">
          <div class="footer-line"></div>
          <p>Este documento es un comprobante del servicio realizado y no tiene validez como factura.</p>
          <p>Próximo cambio: a los ${cambio.kmProximo.toLocaleString()} km o el ${fechaProximo}, lo que ocurra primero.</p>
          <p>© ${new Date().getFullYear()} ${cambio.lubricentroNombre} - Todos los derechos reservados</p>
        </div>
        
        <!-- Borde verde inferior -->
        <div class="bottom-border"></div>
      </div>
    </body>
    </html>
  `;
  
  return html;
};

// Función de compatibilidad
export const generateAndSharePDF = async (cambio: CambioAceite): Promise<void> => {
  throw new Error('Esta función debe ser usada desde el componente CambioDetailScreen');
};