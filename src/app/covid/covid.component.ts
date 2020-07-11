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

      //Main Dashboard - multiple dataset graph
      var NationalData = new Chart("NationalData", {
        type: 'line',
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
          responsive: false,
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
                      maxTicksLimit: 9
                  }
                }]
            }
        }
    });
      
    });
  }


  topStates(x, y)
  {
      //top 5 states bar graph

        //con - 'rgba(0, 123, 255, 0.6)'
        //rec - 'rgba(40, 167, 69, 0.6)'
        //dec - 'rgba(197, 155, 18, 0.6)'
        //tes - 'rgba(255, 7, 58, 0.6)'
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


  topGraph(e)
  {
    this.selectedRadio = e;
    this.topChart(this.data,e);
  }


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
