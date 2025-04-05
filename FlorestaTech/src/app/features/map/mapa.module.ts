import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapaComponent } from './mapa/mapa.component';
import { MapaRoutingModule } from './mapa-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MapaComponent],
  imports: [CommonModule, MapaRoutingModule, FormsModule],
})
export class MapaModule {}
