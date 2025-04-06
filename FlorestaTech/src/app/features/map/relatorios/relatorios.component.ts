import { DataServiceService } from 'src/app/shared/services/data-service.service';
import { Component, OnInit } from '@angular/core';

// NGX-Bootstrap
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

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
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private dataServiceService: DataServiceService
  ) {}

  ngOnInit() {
    this.statesEquipamants();
    console.log(this.equipament);
  }

  // Fechando Modal
  closeModal() {
    this.bsModalRef.content.onClose.next();
    this.bsModalRef.hide();
  }

  getStateEquipament(date: Date | string, param: string): string {
    let text!: string;

    const equipamant = this.equipament.stateHistory.find(
      (item) => item.date === date
    );

    const state = this.equipamentStates.find(
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

  getHours(data: string | Date): string {
    let hours!: string;
    hours = data.toString().substring(11, 16);
    return hours;
  }

  statesEquipamants() {
    this.equipamentStates = [];

    this.dataServiceService.getDadosEquipamentState().subscribe({
      next: (res) => {
        res.forEach((el) => {
          this.equipamentStates.push(el);
        });
      },
    });
  }

  gePerformance(state: string, data: string | Date): number {
    let dat: any[] = [];

    for (let index = 0; index < this.equipament.stateHistory.length; index++) {
      if (this.equipament.stateHistory[index].date === data) {
        dat.push(this.equipament.stateHistory[index]);
      }
    }

    let total = 0;

    dat.forEach((item) => {
      for (
        let index = 0;
        index < this.equipament.modelo.hourlyEarnings.length;
        index++
      ) {
        if (
          this.getNameStateEquipament(item.equipmentStateId) ===
          this.equipament.modelo.hourlyEarnings[index].state
        ) {
          total += this.equipament.modelo.hourlyEarnings[index].value;
        }
      }
    });

    return total;
  }

  getProductivity(state: string, data: string | Date): any {
    let productivity: any = '';
    if (state === 'Sem informação') {
      productivity = 0;
    }
    console.log(state);

    return productivity;
  }

  getNameStateEquipament(id: string): string {
    let states: string = '';

    switch (id) {
      case '0808344c-454b-4c36-89e8-d7687e692d57':
        states = 'Operando';
        break;
      case 'baff9783-84e8-4e01-874b-6fd743b875ad':
        states = 'Parado';
        break;
      case '03b2d446-e3ba-4c82-8dc2-a5611fea6e1f':
        states = 'Manutenção';
        break;

      default:
        break;
    }

    return states;
  }

  test(data: string | Date) {
    this.equipament.stateHistory.forEach((el) => {
      if (data.toString().substring(0, 10) === el.date) {
      }
    });
  }
}
