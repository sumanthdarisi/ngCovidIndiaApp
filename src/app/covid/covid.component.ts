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

  nt_active_percent;
  nt_recovered_percent;
  nt_deceased_percent;
  
  TopStates ;


  data: Array<CovidStDt>;
  timeSeriesData: any;

  //top 5 bar chart
  sortedValues: Array<number> = [];
  sortedValuesStates: Array<number> = [];
  selectedRadio ="confirmed";

  constructor(private _serv: APIService, private _route: Router) { }

  ngOnInit(): void {

    this._serv.getCovid().subscribe(d => {
      this.data = d;     

      //functions      
      this.Initialdata(this.data);
      this.timeSeries();
    })    
  }

  //all the data initialization take place here
  Initialdata(d){
    
    if(this.selectedRadio)
      this.topChart(d, this.selectedRadio);
      
    
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

    this.nt_recovered_percent = this.Nt_TotalRecoverdCases/this.Nt_TotalConfirmedCases;
    this.nt_active_percent = (this.Nt_Active/this.Nt_TotalConfirmedCases);
    this.nt_deceased_percent = (this.Nt_TotalDeceasedCases/this.Nt_TotalConfirmedCases);

    this.Nt_data= [
      {Name: "Confirmed Cases", number: this.Nt_TotalConfirmedCases, style: "con_cl",del: this.Nt_Del_Confirmed, del_style: "delta_tot"},
      {Name: "Active Cases", number: this.Nt_Active, style: "act_cl", del: this.Nt_Del_Active, del_style: "delta_tot", percent: this.nt_active_percent},
      {Name: "Recovered Cases", number: this.Nt_TotalRecoverdCases, style: "rec_cl", del: this.Nt_Del_Recovered, del_style: "delta_tot", percent: this.nt_recovered_percent},
      {Name: "Deceased Cases", number: this.Nt_TotalDeceasedCases, style: "dec_cl", del: this.Nt_Del_Deceased, del_style: "delta_tot", percent: this.nt_deceased_percent},
      {Name: "Total Tests", number: this.Nt_TotalTests, style: "tot_cl", del: this.Nt_Del_Tested, del_style: "delta_tot"}
    ]

  }


  
  //send state name and respective data to service before routing to a state page
  stateCode(e)
  {
    let Name = e.target.innerText;
    let code = this._serv.getPipeStateCode(Name);
    this._serv.setCovidData(this.data[code]);
    this._route.navigate(["Covid/",code]);
  }

  //main graph 
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

      //Main Dashboard - multiple dataset graph
      Chart.Legend.prototype.afterFit = function() {
        this.height = this.height + 25;
      };

      Chart.defaults.LineWithLine = Chart.defaults.line;
      Chart.controllers.LineWithLine = Chart.controllers.line.extend({
        draw: function(ease) {
          Chart.controllers.line.prototype.draw.call(this, ease);

          if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
            var activePoint = this.chart.tooltip._active[0],
                ctx = this.chart.ctx,
                x = activePoint.tooltipPosition().x,
                topY = this.chart.legend.bottom,
                bottomY = this.chart.chartArea.bottom;

            // draw line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(167, 168, 167,0.3)';
            ctx.stroke();
            ctx.restore();
          }
        }
      });



      var NationalData = new Chart("NationalData", {
        type: 'LineWithLine',
        data: {
          labels:Xlabels,
            datasets: [
              {
                label: ['Confirmed'],
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
              label: ['Recovered'],
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
            label: ['Active'],
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
            label: ['Deceased'],
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
          responsive: true,
          events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
          tooltips:{
            enabled: true,
            mode: 'index',
            intersect: false
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
                      maxTicksLimit: 4
                  }
                }]
            }
        }
    });

      
    });
  }


  //top 10 states graph 
  topStates(x, y)
  {
      //top 5 states bar graph
        let color,hcolor;

        if(this.selectedRadio == 'confirmed'){
          color = 'rgba(0, 123, 255, 0.6)';
          hcolor = 'rgba(0, 123, 255, 1)';
        }          
        else if (this.selectedRadio == 'recovered'){
          color = 'rgba(40, 167, 69, 0.6)';
          hcolor = 'rgba(40, 167, 69, 1)';
        }
        else if (this.selectedRadio == 'tested'){
          color = 'rgba(108, 117, 125, 0.6)';
          hcolor = 'rgba(108, 117, 125, 1)';
        }
        else{
          color = 'rgba(255, 7, 58, 0.6)';
          hcolor = 'rgba(255, 7, 58, 1)';
        } 


        var ds = {
          labels:x,
            datasets: [
              {
                label: ['Top 10 ' + this.selectedRadio.substring(0,1).toUpperCase()+this.selectedRadio.substring(1) +' States'],
                data: y,
                backgroundColor: color,
                hoverBackgroundColor : hcolor
            }
        ]
        };
        
        if(this.TopStates){
          this.TopStates.destroy();
        }

        Chart.Legend.prototype.afterFit = function() {
          this.height = this.height + 25;
        };
        this.TopStates = new Chart("tpStates", {
        type: 'bar',
        data: ds,
        options: {
          tooltips:{
            enabled: true,
          },
            scales: {
                yAxes: [{
                  gridLines:{
                    drawOnChartArea: true
                  },
                }],
                xAxes:[{
                  gridLines:{
                    drawOnChartArea: false
                  },
                }]
            }
        }
    });

  }

  //get radio selected value
  topGraph(e)
  {
    this.selectedRadio = e;
    this.topChart(this.data,e);
  }

  //get the top 10 data w.r.t radio button
  topChart(d, radio)
  {
    let sortData : Map<String,number> = new Map<String,number>();
    let values: Array<number> = [];

    for(let e in d)
    {
      if(d[e]['total'] && d[e]['total'][radio] && e !="TT")
      {
        sortData.set(e,parseInt(d[e]['total'][radio]));
      }
    }
    
    sortData.forEach((value) => {
      values.push(value);
    });
    
    this.sortedValues = [];
    this.sortedValues = values.sort(function (a,b)
                  {
                      if(a>b) return 1
                      if(a<b) return -1
                      return 0;
                  }).reverse().slice(0,10);
    
    let sortArray : Map<String,number> = new Map<String,number>();    

    this.sortedValuesStates = [];

    this.sortedValues.forEach(e=>{
      let temp;
      temp = getKeybyValue(e);
      this.sortedValuesStates.push(temp);
      sortArray.set(temp,e);
    });

    // console.log(this.sortedValues);  // y-axis dataset
    // console.log(this.sortedValuesStates); // x-axis

    function getKeybyValue(e)
    {
      let temp;
      sortData.forEach((value: number,key: string) => {
        if( value == e) {
          temp = key;
        }
      });
      return temp;
    }

    this.topStates(this.sortedValuesStates, this.sortedValues);
  }

}
