import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/Services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-st-dist',
  templateUrl: './st-dist.component.html',
  styleUrls: ['./st-dist.component.css']
})
export class StDistComponent implements OnInit {
  st_population: number = 0;
  st_confirmed: number = 0;
  st_recovered: number = 0;
  st_deceased: number = 0;
  st_tested: number = 0;
  st_Active: number = 0;
  stateName: any;
  districtData: any;

  delta_confirmed =0;
  delta_recovered =0;
  delta_tested =0;
  delta_deceased =0;
  delta_active = 0;

  delta =[];




  data: any;
  constructor(private _serv: APIService, private route: Router) { }

  ngOnInit(): void {

    this.data = this._serv.getCovidData();
    if (!this.data) {
      this.route.navigateByUrl("/Covid");
    }
    
    this.stateName = this._serv.getStateName();
      this.initialize();
  }
  


  initialize(){
    for (let d in this.data.districts) 
    {
      if (this.data.districts[d]['meta'] && this.data.districts[d]['total']) {
        if (this.data.districts[d]['meta']['population'])
          this.st_population += Number(this.data.districts[d]['meta']['population']);

        if (this.data.districts[d]['total']['confirmed'])
          this.st_confirmed += Number(this.data.districts[d]['total']['confirmed']);

        if (this.data.districts[d]['total']['recovered'])
          this.st_recovered += Number(this.data.districts[d]['total']['recovered']);

        if (this.data.districts[d]['total']['deceased'])
          this.st_deceased += Number(this.data.districts[d]['total']['deceased']);

        if (this.data.districts[d]['total']['tested'])
          this.st_tested += Number(this.data.districts[d]['total']['tested']);
      }
    }

    
    this.st_Active = this.st_confirmed -(this.st_recovered + this.st_deceased);

    if(this.data['delta']){
      if(this.data['delta']['confirmed'])
      this.delta_confirmed = this.data['delta']['confirmed'];

    if(this.data['delta']['recovered'] )
      this.delta_recovered = this.data['delta']['recovered'];
    
    if(this.data['delta']['deceased'] )
      this.delta_deceased = this.data['delta']['deceased']
    
    if(this.data['delta']['tested'])
      this.delta_tested = this.data['delta']['tested'];

    //if(this.data['delta']['confirmed'] && this.data['delta']['recovered'] && this.data['delta']['deceased'])
      this.delta_active = +this.delta_confirmed - (+this.delta_recovered + +this.delta_deceased);
    }


      this.districtData= [
        {Name: "Confirmed Cases", number: this.st_confirmed, class: "fill cl_con", del: this.delta_confirmed, del_style: "delta_tot del_con"},
        {Name: "Active Cases", number: this.st_Active, class: "fill cl_act", del: this.delta_active, del_style: "delta_tot del_act"},
        {Name: "Recovered Cases", number: this.st_recovered, class: "fill cl_rec", del: this.delta_recovered, del_style: "delta_tot del_rec"},
        {Name: "Deceased Cases", number: this.st_deceased, class: "fill cl_dec",del: this.delta_deceased, del_style: "delta_tot del_dec"},
        {Name: "Total Tested", number: this.st_tested, class: "fill cl_tes",  del: this.delta_tested,del_style:"delta_tot del_tes"}
      ]  
    
  }

  

}
