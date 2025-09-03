import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

export interface ReclamacionCompleta {
  codigo: string;
  usuario: string;
  nivel: string;
  dni: string;
  correo: string;
  tipo: string;
  estado: string;
  prioridad: string;
  campus: string;
  fechaRegistro: string;
  responsable?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  // Campos adicionales para el modal
  telefono?: string;
  direccion?: string;
  padreApoderado?: string;
  detalleReclamo?: string;
  pedido?: string;
  monto?: number;
  bien?: string;
}

@Component({
  selector: 'app-detalle',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
  providers: [MessageService]
})
export class DetalleComponent {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionCompleta | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() correoEnviado = new EventEmitter<ReclamacionCompleta>();

  enviandoCorreo = false;

  // Opciones para los selects
  campusOptions = [
    { label: 'UCV CAMPUS TRUJILLO', value: 'UCV CAMPUS TRUJILLO' },
    { label: 'UCV CAMPUS LIMA', value: 'UCV CAMPUS LIMA' },
    { label: 'UCV CAMPUS CHICLAYO', value: 'UCV CAMPUS CHICLAYO' },
    { label: 'UCV CAMPUS PIURA', value: 'UCV CAMPUS PIURA' }
  ];

  clasificacionOptions = [
    { label: 'SIN CLASIFICACIÓN', value: 'SIN CLASIFICACIÓN' },
    { label: 'ACADÉMICO', value: 'ACADÉMICO' },
    { label: 'ADMINISTRATIVO', value: 'ADMINISTRATIVO' },
    { label: 'FINANCIERO', value: 'FINANCIERO' },
    { label: 'SERVICIOS', value: 'SERVICIOS' }
  ];

  unidadOptions = [
    { label: 'Asignar unidad :', value: '' },
    { label: 'Escuela de Idiomas', value: 'Escuela de Idiomas' },
    { label: 'Escuela de Psicología', value: 'Escuela de Psicología' },
    { label: 'Secretaría Académica', value: 'Secretaría Académica' },
    { label: 'Área Administrativa', value: 'Área Administrativa' },
    { label: 'Dirección de Carrera', value: 'Dirección de Carrera' }
  ];

  constructor(private messageService: MessageService) { }

  async enviarCorreo() {
    if (!this.reclamacion) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay información de reclamación para enviar'
      });
      return;
    }

    this.enviandoCorreo = true;

    try {
      // Simular envío de correo (aquí integrarías con tu servicio de email)
      await this.simularEnvioCorreo();

      this.messageService.add({
        severity: 'success',
        summary: 'Correo Enviado',
        detail: `Se ha enviado la notificación de la reclamación ${this.reclamacion.codigo} al correo ${this.reclamacion.correo}`
      });

      // Emitir evento para notificar al componente padre
      this.correoEnviado.emit(this.reclamacion);

    } catch (error) {
      console.error('Error al enviar correo:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo enviar el correo. Inténtalo nuevamente.'
      });
    } finally {
      this.enviandoCorreo = false;
    }
  }

  private simularEnvioCorreo(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular éxito/error aleatorio para demo
        const success = Math.random() > 0.1; // 90% de éxito
        if (success) {
          resolve();
        } else {
          reject(new Error('Error simulado'));
        }
      }, 2000);
    });
  }

  // Método para integrar con servicio real de correo
  private async enviarCorreoReal() {
    if (!this.reclamacion) return;

    const emailData = {
      to: this.reclamacion.correo,
      subject: `Reclamación ${this.reclamacion.codigo} - Notificación`,
      template: 'reclamacion-detalle',
      data: {
        codigo: this.reclamacion.codigo,
        usuario: this.reclamacion.usuario,
        tipo: this.reclamacion.tipo,
        estado: this.reclamacion.estado,
        fechaRegistro: this.reclamacion.fechaRegistro,
        detalleReclamo: this.reclamacion.detalleReclamo,
        campus: this.reclamacion.campus
      }
    };

    // Aquí harías la llamada a tu servicio de email
    // return this.emailService.enviarCorreo(emailData);
  }
}