import { Component, OnInit } from '@angular/core';

// NGX-Bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { GeneratePdfService } from './../../../shared/services/generate-pdf.service';
import { DataServiceService } from 'src/app/shared/services/data-service.service';

// Models
import { equipmentListGoupModel } from 'src/app/shared/models/equipmentListGoup.model';
import { equipamentStateModel } from 'src/app/shared/models/equipmentState.model';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
})
export class RelatoriosComponent implements OnInit {
  /**
   * Propriedade da classe.
   */
  paginaAtual: number = 1;
  equipament!: equipmentListGoupModel;
  equipamentStates!: equipamentStateModel[];

  constructor(
    private bsModalRef: BsModalRef,
    private dataServiceService: DataServiceService,
    private generatePdfService: GeneratePdfService
  ) {}

  ngOnInit() {}

  // Fechando Modal
  closeModal() {
    this.bsModalRef.content.onClose.next();
    this.bsModalRef.hide();
  }

  // Pegando o Estado | Cor
  getStateEquipament(date: Date | string, param: string): string {
    let text!: string;

    const equipamant = this.equipament.stateHistory?.find(
      (item) => item.date === date
    );

    const state = this.equipamentStates?.find(
      (item) => item.id === equipamant?.equipmentStateId
    );
    if (state) {
      if (param === 'state') {
        text = state.name;
      } else {
        text = state.color;
      }
    } else {
      if (param === 'color') {
        text = '#6c757d';
      } else {
        text = 'Sem informação';
      }
    }

    return text;
  }

  // Tratamento de horas.
  getHours(data: string | Date): string {
    let hours!: string;
    hours = data.toString().substring(11, 16);
    return hours;
  }

  // Função para montar e chamar o serviço que gera o PDF.
  gerarPdf() {
    const dados: { horario: string | Date; latLong: string; estado: string }[] =
      [];

    this.equipament.positionHitory.forEach((el) => {
      // Ajustando Data
      let date = new Date(el.date);
      date.setHours(date.getHours() + 3);
      if (date.getHours() === 0) {
        date.setHours(date.getHours() - 24);
      }

      dados.push({
        horario: date,
        latLong: `[ ${el.lat} | ${el.lon} ]`,
        estado: this.getStateEquipament(el.date, 'state'),
      });
    });

    const columns = ['Horário', 'Latitude - Longitude', 'Estado'];

    const nameEquipament: { name: string; modelo: string } = {
      name: this.equipament.name,
      modelo: this.equipament.modelo.name,
    };
    this.generatePdfService.generateTablePDF(
      nameEquipament, // Nome/ Modelo do equipamento
      'FlorestaTech - Histórico de Posições e estados do equipamento', // Titulo
      columns, // Titulo das colunas
      dados, // Dados das Colunas
      `historico-${this.equipament.name}.pdf` // Nome do arquivo.
    );
  }
}
