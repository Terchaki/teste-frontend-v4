import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { equipamentDetailModel } from 'src/app/shared/models/equipamentDetail.model';
import { equipmentDataModel } from 'src/app/shared/models/equipmentDataModel.model';
import { equipmentListGoupModel } from 'src/app/shared/models/equipmentListGoup.model';
import { equipmentPositionHistoryModel } from 'src/app/shared/models/equipmentPositionHistory.model';
import { equipamentStateModel } from 'src/app/shared/models/equipmentState.model';
import { equipmentStateHistoryModel } from 'src/app/shared/models/equipmentStateHistory.model';
import { DataServiceService } from 'src/app/shared/services/data-service.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
})
export class MapaComponent implements OnInit {
  map!: L.Map;
  allDataEquipaments!: equipamentDetailModel;
  equipamentsGroup!: equipmentListGoupModel[];
  equipamentsRecents: equipmentPositionHistoryModel[] = [];
  markers: L.Marker[] = [];
  polylines: L.Polyline[] = [];

  constructor(private dataServiceService: DataServiceService) {}

  ngOnInit(): void {
    this.getEquipamentFullDetail();
  }

  getEquipamentFullDetail() {
    this.dataServiceService.getEquipamentFullDetail().subscribe({
      next: (data) => {
        this.allDataEquipaments = data; // Agora os dados estão disponíveis apenas após todas as requisições serem concluídas
        console.log(this.allDataEquipaments);
        this.group();
        this.initMap();
      },
    });
  }

  group() {
    this.equipamentsGroup = [];

    for (
      let index = 0;
      index < this.allDataEquipaments.equipments.length;
      index++
    ) {
      this.equipamentsGroup?.push({
        id: this.allDataEquipaments.equipments[index].id,
        equipmentModelId:
          this.allDataEquipaments.equipments[index].equipmentModelId,
        name: this.allDataEquipaments.equipments[index].name,
        modelo: {
          name: this.allDataEquipaments.equipmentModels.find(
            (el: equipmentDataModel) =>
              el.id ===
              this.allDataEquipaments.equipments[index].equipmentModelId
          )?.name,
          hourlyEarnings: this.getHourlyEarningsEquipaments(
            this.allDataEquipaments.equipments[index].equipmentModelId
          ),
        },
        positionHitory: this.getPosHistory(
          this.allDataEquipaments.equipments[index].id
        ),
        // state: this.getStateEquipament(this.allDataEquipaments.equipments[index].equipmentModelId),
        stateHistory: this.getStateHistory(
          this.allDataEquipaments.equipments[index].id
        ),
      });
    }
  }

  getHourlyEarningsEquipaments(
    equipmentModelId: string
  ): { state: string; value: number; color: string }[] {
    let earnings: { state: string; value: number; color: string }[] = [];

    this.allDataEquipaments.equipmentModels.forEach(
      (el: equipmentDataModel) => {
        if (el.id === equipmentModelId) {
          for (let index = 0; index < el.hourlyEarnings.length; index++) {
            earnings.push({
              state: this.getNameStateEquipament(
                'state',
                el.hourlyEarnings[index].equipmentStateId
              ),
              value: el.hourlyEarnings[index].value,
              color: this.getNameStateEquipament(
                'color',
                el.hourlyEarnings[index].equipmentStateId
              ),
            });
          }
        }
      }
    );
    return earnings;
  }

  getNameStateEquipament(param: string, equipmentStateId: string): string {
    let value!: string;

    this.allDataEquipaments.equipmentStates.forEach(
      (el: equipamentStateModel) => {
        if (el.id === equipmentStateId) {
          value = param === 'state' ? el.name : el.color;
        }
      }
    );

    return value;
  }

  getPosHistory(id: string): any {
    let positions: any[] = [];

    this.allDataEquipaments.equipmentPositionHistory?.forEach(
      (el: equipmentPositionHistoryModel) => {
        if (el.equipmentId === id) {
          el.positions.forEach((el) => {
            positions.push({
              date: el.date,
              lat: el.lat,
              lon: el.lon,
            });
          });
        }
      }
    );

    return positions;
  }

  getStateEquipament(equipmentModelId: string): {
    name: string;
    color: string;
  } {
    let state: {
      name: string;
      color: string;
    } = { name: '', color: '' };

    return state;
  }

  getStateHistory(id: string): any {
    let posHistory: any[] = [];

    this.allDataEquipaments.equipmentStateHistory?.forEach(
      (el: equipmentStateHistoryModel) => {
        if (el.equipmentId === id) {
          el.states.forEach((el) => {
            posHistory.push({
              date: el.date,
              equipmentStateId: el.equipmentStateId,
            });
          });
          // posHistory?.push(el.states);
        }
      }
    );

    return posHistory;
  }

  getIdStateHistory(id: string): any {
    let stateId: string = '';

    this.allDataEquipaments.equipmentStateHistory?.forEach(
      (el: equipmentStateHistoryModel) => {
        if (el.equipmentId === id) {
          el.states.forEach((el) => {
            stateId = el.equipmentStateId;
          });
        }
      }
    );

    return stateId;
  }

  initMap(): void {
    /**
     * Corrigir caminho dos ícones globais
     * O angular não estava conseguindo puxar o ícones direto da pasta node_modules.
     * Foi necessário cria uma pastas com os ícones no 'aasets'.
     */
    const iconRetinaUrl = './../../../assets/leaflet/marker-icon-2x.png';
    const iconUrl = './../../../assets/leaflet/marker-icon.png';
    const shadowUrl = './../../../assets/leaflet/marker-shadow.png';

    // Ícones default.
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });

    let index = this.equipamentsGroup[0].positionHitory.length;
    let lat = this.equipamentsGroup[0].positionHitory[index - 1].lat;
    let lon = this.equipamentsGroup[0].positionHitory[index - 1].lon;

    /**
     * Implementando o mapa e defifindo a posição inicial
     * com base no primeiro equipamento da lista em sua pos mais recente.
     */
    this.map = L.map('map', {
      center: [lat, lon], // Coordenadas de Caldas Novas - GO, (Latitude e Longitude).
      zoom: 8, // Nível de zoom
    });

    // Adicionar um tile layer (Google Maps, OpenStreetMap, etc.)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerMaps();
  }

  // Adiciona os equipamentos no mapa.
  markerMaps() {
    this.equipamentsGroup?.forEach((equip: equipmentListGoupModel) => {
      let index = equip.positionHitory?.length;
      let latitude = equip.positionHitory[index - 1].lat;
      let longitude = equip.positionHitory[index - 1].lon;

      const hours = String(equip.positionHitory[index - 1].date).substring(
        11,
        16
      );

      const marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${this.getNameStateEquipament(
            'color',
            equip.stateHistory[index - 1].equipmentStateId
          )}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
          iconSize: [15, 15],
        }),
      }).addTo(this.map);

      // Adiciona à lista de marcadores
      this.markers.push(marker);

      marker.bindPopup(
        `<b>${equip.name}</b><br>
        <span>Última posição em: ${new Date(
          equip.positionHitory[index - 1].date
        ).toLocaleDateString()} às ${hours}h</span><br>
        <span>Modelo: ${equip.modelo.name}</span><br>
        Estado:<b>
        <span style="color: ${this.getNameStateEquipament(
          'color',
          equip.stateHistory[index - 1].equipmentStateId
        )};">
          ${this.getNameStateEquipament(
            'state',
            equip.stateHistory[index - 1].equipmentStateId
          )}
        </span></b><br>
        <button type="button" class="btn btn-primary mt-1 p-0 py-1 w-100 trajectory-btn" data-id="${
          equip.id
        }">Histórico de Trajeto</button>`
      );

      marker.on('popupopen', () => {
        const button = document.querySelector('.trajectory-btn');
        if (button) {
          button.addEventListener('click', () => {
            const equipId = button.getAttribute('data-id');
            this.trajectoryEquipament(equipId);
          });
        }
      });
    });
  }

  clearMapElements() {
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.polylines.forEach((p) => this.map.removeLayer(p));
    this.markers = [];
    this.polylines = [];
  }

  trajectoryEquipament(equipemantId: string | any) {
    // Limpando os marcadores e linhas anteriores
    this.clearMapElements();

    const equip = this.equipamentsGroup.find((e) => e.id === equipemantId);
    if (equip) {
      const latlngs: L.LatLngExpression[] = [];

      equip.positionHitory.forEach((pos, index) => {
        const latlng: L.LatLngExpression = [pos.lat, pos.lon];
        latlngs.push(latlng);

        // Pegando o estado correspondente da mesma data (se existir)
        const state = equip.stateHistory?.[index];
        const stateColor = this.getNameStateEquipament(
          'color',
          state?.equipmentStateId ?? 1 // valor default se não encontrar
        );

        const hours = String(pos.date).substring(11, 16);

        const marker = L.marker(latlng, {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${stateColor}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
            iconSize: [15, 15],
          }),
        }).addTo(this.map);
        marker.bindPopup(
          `<b>${equip.name}</b><br>
            <span>Posição em: ${new Date(
              pos.date
            ).toLocaleDateString()} às ${hours}h</span><br>
            <span>Modelo: ${equip.modelo.name}</span><br>
            Estado:<b>
            <span style="color: ${this.getNameStateEquipament(
              'color',
              // this.getStateHistory(equip.id)
              this.getIdStateHistory(equip.id)
              // equip. .equipmentStateId
            )};">
              ${this.getNameStateEquipament(
                'state',
                this.getIdStateHistory(equip.id)
              )}
            </span></b><br>
            <button type="button" class="btn btn-secondary mt-1 p-0 py-1 w-100 close-trajectory-btn" data-id="${
              equip.id
            }">Fechar trajeto</button>`
        );

        marker.on('popupopen', () => {
          const button = document.querySelector('.close-trajectory-btn');
          if (button) {
            button.addEventListener('click', () => {
              // Remove o mapa atual
              this.map.remove();
              // Gera o mapa novamente com os marcadores atuais
              this.initMap();
            });
          }
        });
        // this.markers.push(marker); // Armazena novos marcadores do trajeto
      });

      const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(this.map);
      this.polylines.push(polyline); // Armazena a linha do trajeto

      this.map.fitBounds(polyline.getBounds()); // Zoom no trajeto
    }
  }
}
