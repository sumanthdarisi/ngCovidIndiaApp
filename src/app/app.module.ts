import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { CovidComponent } from './covid/covid.component';
import { StDistComponent } from './covid/st-dist/st-dist.component';
import { StateNamePipe } from './Pipes/state-name.pipe';

import { CountUpModule } from 'ngx-countup';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    CovidComponent,
    StDistComponent,
    StateNamePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CountUpModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
