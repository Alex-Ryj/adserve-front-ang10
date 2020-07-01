import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ItemFormComponent } from './item-form/item-form.component';
import { LoginComponent } from './login/login.component';
import { ItemsTableComponent } from './items-table/items-table.component';
import { DashboardComponent } from './dashboard/dashboard.component';


const routes: Routes = [
  { path: 'nav', component: LayoutComponent, pathMatch: 'full' },
  { path: 'item', component: ItemFormComponent, pathMatch: 'full'},
  { path: 'table-items', component: ItemsTableComponent, pathMatch: 'full'},
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full'},
  { path: 'login', component: LoginComponent, pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
