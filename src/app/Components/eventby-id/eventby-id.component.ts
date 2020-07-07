import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from 'src/app/Services/api.service';
import { EventsModel } from 'src/app/events-model';

@Component({
  selector: 'app-eventby-id',
  templateUrl: './eventby-id.component.html',
  styleUrls: ['./eventby-id.component.css']
})
export class EventbyIDComponent implements OnInit {
  name: string;
  sub: any;
  eventDetail = new EventsModel;
  eventName:string;
  data: Array<EventsModel>;
  

  constructor(private route: Router, private taskid: ActivatedRoute, private _serv: APIService) {   }

  ngOnInit(): void {
    this.sub = this.taskid.params.subscribe(params=>{
      this.name = params['id'];

    this._serv.getByName(this.name).subscribe(e=>{
      this.eventDetail = e;
      this.eventName = e.Createdby;


      this._serv.getAttendees(this.eventName).subscribe(e=>{
        this.data = e;
      })

    })
  })
  }

}
