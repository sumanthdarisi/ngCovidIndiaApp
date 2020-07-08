import { Component, OnInit } from '@angular/core';
import { CovidStDt } from '../Models/covid-st-dt';
import { APIService } from '../Services/api.service';
import { Chart } from 'node_modules/chart.js';
import { Router } from '@angular/router';


@Component({
  selector: 'app-covid',
  templateUrl: './covid.component.html',
  styleUrls: ['./covid.component.css']
})
export class CovidComponent implements OnInit {
  IndianPopulation: number = 1380159707;
  Nt_TotalConfirmedCases: number = 0;
  Nt_TotalRecoverdCases: number = 0;
  Nt_TotalDeceasedCases: number = 0;
  Nt_TotalTests: number = 0;
  Nt_Active: number =0;


  data: Array<CovidStDt>;
  zone: any;
  constructor(private _serv: APIService, private _route: Router) { }

  ngOnInit(): void {

    this._serv.getCovid().subscribe(d => {
      this.data = d;

      //functions
      this.Initialdata(this.data);
      this.chart();

    })    
  }


  Initialdata(d){
    for (let e in d) {
      if (d[e]['total'] && e!=="TT") {
        
        if(d[e]['total']['confirmed']){
          this.Nt_TotalConfirmedCases = this.Nt_TotalConfirmedCases + Number(d[e]['total']['confirmed']);
        }

        if (d[e]['total']['recovered']){
          this.Nt_TotalRecoverdCases += Number(d[e]['total']['recovered']);
        }

        if (d[e]['total']['deceased']){
          this.Nt_TotalDeceasedCases += Number(d[e]['total']['deceased']);
        }

        if (d[e]['total']['tested']){
          this.Nt_TotalTests += Number(d[e]['total']['tested']);
        }
      }
    }

    this.Nt_Active = this.Nt_TotalConfirmedCases - (this.Nt_TotalDeceasedCases + this.Nt_TotalRecoverdCases);
  }


  chart()
  {
    var NationalData = new Chart("NationalData", {
      type: 'line',
      data: {
        labels:['Confirmed','Active','Recovered','Tested','Deceased'],
          datasets: [{
              label: ['Covid Stats'],
              data: [this.Nt_TotalConfirmedCases, this.Nt_Active,this.Nt_TotalRecoverdCases,this.Nt_TotalTests,this.Nt_TotalDeceasedCases],
              
              borderColor: [
                  'rgba(55,151,158)'
              ],
              borderWidth: 3,
              hoverBackgroundColor: [
                'rgba(255, 99, 132, 1.0)',
                'rgba(54, 162, 235, 1.0)',
                'rgba(255, 206, 86, 1.0)',
                'rgba(75, 192, 192, 1.0)'
            ]
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: false,
                      min: 5000
                  }
              }]
          }
      }
  });

  }

  stateCode(e)
  {
    let code = e.target.innerText;
    this._serv.setCovidData(this.data[code], code);
    this._route.navigate(["Covid/",code]);
  }

}
