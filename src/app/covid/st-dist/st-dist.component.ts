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

  data: any;
  constructor(private _serv: APIService, private route: Router) { }

  ngOnInit(): void {

    this.data = this._serv.getCovidData();
    if (!this.data) {
      this.route.navigateByUrl("/Covid");
    }

    this.initialize();
    this.chart();
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
  }

  chart() {
    var StateData = new Chart("StateData", {
      type: 'bar',
      data: {
        labels: ['Confirmed', 'Recovered', 'Deceased', 'Tested'],
        datasets: [{
          label: ['#Counts'],
          data: [this.st_confirmed, this.st_recovered, this.st_deceased, this.st_tested],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1,
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
              beginAtZero: true,
            },
            type: 'logarithmic'
          }]
        }
      }
    });

  }


}
