import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CovidComponent } from './covid/covid.component';
import { StDistComponent } from './covid/st-dist/st-dist.component';


const routes: Routes = [
  {path: '', redirectTo: 'Covid', pathMatch: 'full'},
  {path: 'Covid', component: CovidComponent},
  {path: 'Covid/:key', component: StDistComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
