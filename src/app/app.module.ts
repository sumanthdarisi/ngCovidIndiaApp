import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { EventbyIDComponent } from './Components/eventby-id/eventby-id.component';
import { HomeComponent } from './Components/home/home.component';
import { MoviesComponent } from './Components/movies/movies.component';
import { CovidComponent } from './covid/covid.component';
import { StDistComponent } from './covid/st-dist/st-dist.component';

@NgModule({
  declarations: [
    AppComponent,
    EventbyIDComponent,
    HomeComponent,
    MoviesComponent,
    CovidComponent,
    StDistComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
