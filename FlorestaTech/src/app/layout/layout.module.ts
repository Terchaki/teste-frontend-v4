import { MapaComponent } from './../features/mapa/mapa.component';
// Bibliotecas Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Rotas
import { RouterModule } from '@angular/router';

// Componentes
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MapaComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
})
export class LayoutModule { }
