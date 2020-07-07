import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/Services/api.service';
import { EventsModel } from 'src/app/events-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{
  title = 'efi';
  data: Array<EventsModel>;

  constructor(private _serv: APIService){ }

  ngOnInit(){
    this._serv.getData().subscribe(d=>{
      this.data = d;
    })
  }
}

