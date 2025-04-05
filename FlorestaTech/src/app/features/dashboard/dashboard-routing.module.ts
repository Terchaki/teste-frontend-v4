import { ChartComponent } from './components/chart/chart.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'grafico-quantidade',
    pathMatch: 'full',
  },
  {
    path: 'grafico-quantidade',
    component: ChartComponent,
    title: 'grafico quant',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
