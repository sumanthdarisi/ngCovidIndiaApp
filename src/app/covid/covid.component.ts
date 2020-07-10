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
  Nt_data: any;

  Nt_Del_Confirmed =0;
  Nt_Del_Recovered =0;
  Nt_Del_Deceased =0;
  Nt_Del_Tested =0;
  Nt_Del_Active =0;
  


  data: Array<CovidStDt>;
  timeSeriesData: any;
  zone: any;
  constructor(private _serv: APIService, private _route: Router) { }

  ngOnInit(): void {

    this._serv.getCovid().subscribe(d => {
      this.data = d;

      //functions      
      this.Initialdata(this.data);
      this.timeSeries();
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

      if(d[e]['delta'] && e!=="TT"){
        
        if(d[e]['delta']['confirmed']){
          this.Nt_Del_Confirmed += Number(d[e]['delta']['confirmed']);
        }

        if (d[e]['delta']['recovered']){
          this.Nt_Del_Recovered += Number(d[e]['delta']['recovered']);
        }

        if (d[e]['delta']['deceased']){
          this.Nt_Del_Deceased += Number(d[e]['delta']['deceased']);
        }

        if (d[e]['delta']['tested']){
          this.Nt_Del_Tested += Number(d[e]['delta']['tested']);
        }
      }
    }

    this.Nt_Active = this.Nt_TotalConfirmedCases - (this.Nt_TotalDeceasedCases + this.Nt_TotalRecoverdCases);
    this.Nt_Del_Active = this.Nt_Del_Confirmed - (this.Nt_Del_Deceased + this.Nt_Del_Recovered);

    this.Nt_data= [
      {Name: "Confirmed Cases", number: this.Nt_TotalConfirmedCases, style: "con_cl",del: this.Nt_Del_Confirmed, del_style: "delta_tot"},
      {Name: "Active Cases", number: this.Nt_Active, style: "act_cl", del: this.Nt_Del_Active, del_style: "delta_tot"},
      {Name: "Recovered Cases", number: this.Nt_TotalRecoverdCases, style: "rec_cl", del: this.Nt_Del_Recovered, del_style: "delta_tot"},
      {Name: "Deceased Cases", number: this.Nt_TotalDeceasedCases, style: "dec_cl", del: this.Nt_Del_Deceased, del_style: "delta_tot"},
      {Name: "Total Tests", number: this.Nt_TotalTests, style: "tot_cl", del: this.Nt_Del_Tested, del_style: "delta_tot"}
    ]
  }


  

  stateCode(e)
  {
    let Name = e.target.innerText;
    let code = this._serv.getPipeStateCode(Name);
    this._serv.setCovidData(this.data[code]);
    this._route.navigate(["Covid/",code]);
  }


  timeSeries()
  {   
      const Xlabels = [];

      const confirmYlabels = [];
      const recoverYlabels = [];
      const deceasedYlabels = [];
      const activeYlabels = [];


      this._serv.getTimeSeries().subscribe(res => {
      this.timeSeriesData = res['cases_time_series'];
      
      for (let d in this.timeSeriesData) {
        Xlabels.push(this.timeSeriesData[d]['date']);
        confirmYlabels.push(parseInt(this.timeSeriesData[d]['totalconfirmed']));
        recoverYlabels.push(parseInt(this.timeSeriesData[d]['totalrecovered']))
        deceasedYlabels.push(parseInt(this.timeSeriesData[d]['totaldeceased']));
        activeYlabels.push(parseInt(this.timeSeriesData[d]['totalconfirmed'])-(parseInt(this.timeSeriesData[d]['totalrecovered'])+parseInt(this.timeSeriesData[d]['totaldeceased'])));
      }

      //X & Y axis data on graph
      let xlablesLen = Xlabels.length/1.5;
      Xlabels.splice(0,xlablesLen);
      confirmYlabels.splice(0,xlablesLen);
      recoverYlabels.splice(0,xlablesLen);
      deceasedYlabels.splice(0,xlablesLen);
      activeYlabels.splice(0,xlablesLen);


      var NationalData = new Chart("NationalData", {
        type: 'line',
        data: {
          labels:Xlabels,
            datasets: [
              {
                label: ['Confirmed Cases'],
                data: confirmYlabels,
                fill: false,
                
                borderColor: [
                  'rgba(0, 123, 255, 0.6)'
                ],
                radius: 0.7,
                pointBorderColor: 'black',
                pointHoverRadius: 10
            },
            {
              label: ['Recovered Cases'],
              data: recoverYlabels,
              fill: false,
              borderColor: [
                'rgba(40, 167, 69, 0.6)'
              ],
              radius: 0.7,  
              pointBorderColor: 'black',
              
              pointHoverRadius: 10
          },
          {
            label: ['Active Cases'],
            data: activeYlabels,
            fill: false,
            
            borderColor: [
              'rgba(255, 7, 58, 0.6)'
            ],
            radius: 0.7,
            pointBorderColor: 'black',
            pointHoverRadius: 10
          },
          {
            label: ['Deceased Cases'],
            data: deceasedYlabels,
            fill: false,
            
            borderColor: [
              'rgba(197, 155, 18, 0.6)'
            ],
            radius: 0.7,
            pointBorderColor: 'black',
            pointHoverRadius: 10
          }
        ]
        },
        options: {
          tooltips:{
            enabled: true,
            mode: 'single'
          },
            scales: {
                yAxes: [{
                  position: 'right',
                  gridLines:{
                    drawOnChartArea: true
                  },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 6
                    }
                }],
                xAxes:[{
                  gridLines:{
                    drawOnChartArea: false
                  },
                  ticks:{
                      autoSkip: true,
                      maxTicksLimit: 7
                  }
                }]
            }
        }
    });
  
      
    });
  }
}
