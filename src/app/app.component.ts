import { Component, OnInit } from '@angular/core';
import { APIService } from './Services/api.service'
import { EventsModel } from './events-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  onActivate(event) {
    window.scroll(0,0);
}
  
}
