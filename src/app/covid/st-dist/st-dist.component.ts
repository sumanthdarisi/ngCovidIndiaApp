import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/Services/api.service';
import { Router } from '@angular/router';
import { Chart } from 'node_modules/chart.js'

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


  data: any;
  constructor(private _serv: APIService, private route: Router) { }

  ngOnInit(): void {

    this.data = this._serv.getCovidData();
    if (!this.data) {
      this.route.navigateByUrl("/Covid");
    }

    this.initialize();
  }


  initialize(){
    for (let d in this.data.districts) {
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
  }

  

}
