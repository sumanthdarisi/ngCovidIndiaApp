import { Component, OnInit } from '@angular/core';
import { CovidStDt } from '../Models/covid-st-dt';
import { APIService } from '../Services/api.service';
import { Chart } from 'node_modules/chart.js';
import { Router } from '@angular/router';
import { States } from '../Models/states';



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

  //sort states
  SortStates: Array<States> = [];
  st_sortBy: any = 'name';
  counter: number = 0; //even - Descending; odd - ascending


  //top 5 bar chart
  sortedValues: Array<number> = [];
  sortedValuesStates: Array<number> = [];
  selectedRadio ="confirmed";

  constructor(private _serv: APIService, private _route: Router) { }

  ngOnInit(): void {

    this._serv.getCovid().subscribe(async d => {
      this.data = d;     
         
      //functions      
      if(this.st_sortBy)
        this.st_sortByClick(this.st_sortBy);

      for(let e in this.data)
      {
        if(d[e]['meta'] && d[e]['total'] && this._serv.getPipeStateName(e))
        {
          let name = this._serv.getPipeStateName(e);
          let pop = (d[e]['meta']['population']) ? d[e]['meta']['population'] : 'NA';
          let con = (d[e]['total']['confirmed']) ? d[e]['total']['confirmed'] : 'NA';
          let dec = (d[e]['total']['deceased']) ? d[e]['total']['deceased'] : 'NA';
          let tes = (d[e]['total']['tested']) ? d[e]['total']['tested'] : 'NA';
          let rec = (d[e]['total']['recovered']) ? d[e]['total']['recovered'] : 'NA';
          let test_date = (d[e]['meta']['last_updated']) ? (d[e]['meta']['last_updated']) : 'NA';        
          let act = (con=="NA" || dec=="NA" || rec=="NA") ? "NA" : (con - (rec + dec));
          this.SortStates.push(new States(name,pop, con,dec,tes,rec,act,test_date));
        }    
      }

      this.Initialdata(this.data);
      await this.timeSeries();

    })    
  }

  //all the data initialization take place here
  Initialdata(d){
    
    if(this.selectedRadio)
      this.topChart(d, this.selectedRadio);
      
    //national total case counts
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

      //national delta totals
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
      {Name: "Confirmed Cases", number: this.Nt_TotalConfirmedCases, style: "con_cl",del: this.Nt_Del_Confirmed, del_style: "delta_tot",icon:"fa fa-plus-square" },
      {Name: "Active Cases", number: this.Nt_Active, style: "act_cl", del: this.Nt_Del_Active, del_style: "delta_tot", percent: this.nt_active_percent,icon:"fa fa-heartbeat"},
      {Name: "Recovered Cases", number: this.Nt_TotalRecoverdCases, style: "rec_cl", del: this.Nt_Del_Recovered, del_style: "delta_tot", percent: this.nt_recovered_percent,icon: "fa fa-check-circle" },
      {Name: "Deceased Cases", number: this.Nt_TotalDeceasedCases, style: "dec_cl", del: this.Nt_Del_Deceased, del_style: "delta_tot", percent: this.nt_deceased_percent,icon: "fa fa-minus-circle" },
      {Name: "Total Tests", number: this.Nt_TotalTests, style: "tot_cl", del: this.Nt_Del_Tested, del_style: "delta_tot",icon:"fa fa-flask"}
    ]

  }

  st_sortByClick(e){
      this.st_sortBy = e;    
      this.st_sortFunc(this.st_sortBy);
  }

  st_sortFunc(sortBy)
  {
    if (sortBy == 'Name') {
      this.st_sortBy = sortBy;

      if (this.counter % 2 != 0) {
        this.SortStates.sort(function (a, b) {
          if (a.st_name  > b.st_name) return -1;
          if (a.st_name < b.st_name) return 1;
          else return 0
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function (a, b) {
          if (a.st_name  > b.st_name) return -1;
          if (a.st_name < b.st_name) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'population') 
    {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function (a, b) {
          a.st_population = (a.st_population.toString() == 'NA') ? -1.5 : a.st_population;
          b.st_population = (b.st_population.toString() == 'NA') ? -1.5 : b.st_population;
            if (a.st_population > b.st_population) return -1;
            if (a.st_population < b.st_population) return 1;
            else return 0
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function (a, b) {
          a.st_population = (a.st_population.toString() == 'NA') ? -1.5 : a.st_population;
          b.st_population = (b.st_population.toString() == 'NA') ? -1.5 : b.st_population;
          if (a.st_population > b.st_population) return -1;
          if (a.st_population < b.st_population) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'confirmed') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function (a, b) {
          a.st_confirmed = (a.st_confirmed.toString() == 'NA') ? -1.5 : a.st_confirmed;
          b.st_confirmed = (b.st_confirmed.toString() == 'NA') ? -1.5 : b.st_confirmed;
          if (a.st_confirmed > b.st_confirmed) return -1;
          if (a.st_confirmed < b.st_confirmed) return 1;
          else return 0
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function (a, b) {
          a.st_confirmed = (a.st_confirmed.toString() == 'NA') ? -1.5 : a.st_confirmed;
          b.st_confirmed = (b.st_confirmed.toString() == 'NA') ? -1.5 : b.st_confirmed;
          if (a.st_confirmed > b.st_confirmed) return -1;
          if (a.st_confirmed < b.st_confirmed) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'active') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function (a, b) {
          a.st_active = (a.st_active.toString() == 'NA') ? -1.5 : a.st_active;
          b.st_active = (b.st_active.toString() == 'NA') ? -1.5 : b.st_active;
          if (a.st_active > b.st_active) return -1;
          if (a.st_active < b.st_active) return 1;
          else return 0
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function (a, b) {
          a.st_active = (a.st_active.toString() == 'NA') ? -1.5 : a.st_active;
          b.st_active = (b.st_active.toString() == 'NA') ? -1.5 : b.st_active;
          if (a.st_active > b.st_active) return -1;
          if (a.st_active < b.st_active) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }


    if (sortBy == 'recovered') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function (a, b) {
          a.st_recoverd = (a.st_recoverd.toString() == 'NA') ? -1.5 : a.st_recoverd;
          b.st_recoverd = (b.st_recoverd.toString() == 'NA') ? -1.5 : b.st_recoverd;
          if (a.st_recoverd > b.st_recoverd) return -1;
          if (a.st_recoverd < b.st_recoverd) return 1;
          else return 0
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function (a, b) {
          a.st_recoverd = (a.st_recoverd.toString() == 'NA') ? -1.5 : a.st_recoverd;
          b.st_recoverd = (b.st_recoverd.toString() == 'NA') ? -1.5 : b.st_recoverd;
          if (a.st_recoverd > b.st_recoverd) return -1;
          if (a.st_recoverd < b.st_recoverd) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'deceased') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function (a, b) {
          a.st_deceased = (a.st_deceased.toString() == 'NA') ? -1.5 : a.st_deceased;
          b.st_deceased = (b.st_deceased.toString() == 'NA') ? -1.5 : b.st_deceased;
          if (a.st_deceased > b.st_deceased) return -1;
          if (a.st_deceased < b.st_deceased) return 1;
          else return 0
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function (a, b) {
          a.st_deceased = (a.st_deceased.toString() == 'NA') ? -1.5 : a.st_deceased;
          b.st_deceased = (b.st_deceased.toString() == 'NA') ? -1.5 : b.st_deceased;
          if (a.st_deceased > b.st_deceased) return -1;
          if (a.st_deceased < b.st_deceased) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'tested') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function (a, b) {
          a.st_tested = (a.st_tested.toString() == 'NA') ? -1.5 : a.st_tested;
          b.st_tested = (b.st_tested.toString() == 'NA') ? -1.5 : b.st_tested;
          if (a.st_tested > b.st_tested) return -1;
          if (a.st_tested < b.st_tested) return 1;
          else return 0
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function (a, b) {
          a.st_tested = (a.st_tested.toString() == 'NA') ? -1.5 : a.st_tested;
          b.st_tested = (b.st_tested.toString() == 'NA') ? -1.5 : b.st_tested;
          if (a.st_tested > b.st_tested) return -1;
          if (a.st_tested < b.st_tested) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

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
                      maxTicksLimit: 10
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
