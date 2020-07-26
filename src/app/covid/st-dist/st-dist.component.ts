import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/Services/api.service';
import { Router } from '@angular/router';
import { Districts } from 'src/app/Models/districts';
import { StateDailyCounts } from 'src/app/Models/state-daily-counts';
import { Chart } from 'node_modules/chart.js';
import { Rank } from 'src/app/Models/rank';

@Component({
  selector: 'app-st-dist',
  templateUrl: './st-dist.component.html',
  styleUrls: ['./st-dist.component.css']
})
export class StDistComponent implements OnInit {
  stateCode;
  st_population = 0;
  st_confirmed = 0;
  st_recovered = 0;
  st_deceased = 0;
  st_tested = 0;
  st_Active = 0;
  stateName: any;
  districtData: any;

  delta_confirmed = 0;
  delta_recovered = 0;
  delta_tested = 0;
  delta_deceased = 0;
  delta_active = 0;

  // sort elements
  SortDistricts: Array<Districts> = [];
  dt_SortBy: any = 'Confirmed';
  counter = 1; // even - Descending; odd - ascending
  data: any;

  // search
  SearchWord: any = '';
  SortStatesDup = this.SortDistricts;

  // placeholder
  PlaceholderDtName: any = '';
  placeholder = [];

  //stateTimeSeries
  ConfirmedSeriesFlag = false;
  RecoveredSeriesFlag = false;
  DeceasedSeriesFlag = false;
  TestsSeriesFlag = false;
  StateConfirmedTimeSeriesData: Array<StateDailyCounts> = [];
  StateRecoveredTimeSeriesData: Array<StateDailyCounts> = [];
  StateDeceasedTimeSeriesData: Array<StateDailyCounts> = [];
  StateTestsTimeSeriesData: Array<StateDailyCounts> = [];

  //stateRank
  stateRank: Rank;

  constructor(private _serv: APIService, private route: Router) { }

  ngOnInit(): void {
    this.data = this._serv.getCovidData();
    this.stateCode = this._serv.getStateCode();

    if (!this.data) {
      this.route.navigateByUrl('/Covid');
    }

    if (this.dt_SortBy) {
      this.dt_sort(this.dt_SortBy);
    }

    this.stateName = this._serv.getStateName();

    for (const e in this.data.districts) {
      let name, pop, con, dec, tes, rec, act;
      let d_con, d_dec, d_tes, d_rec, d_act;
      const _base = this.data.districts[e].delta;

      // delta data
      d_con = (_base && _base.confirmed) ? _base.confirmed : 'NA';
      d_rec = (_base && _base.recovered) ? _base.recovered : 'NA';
      d_dec = (_base && _base.deceased) ? _base.deceased : 'NA';
      d_tes = (_base && _base.tested) ? _base.tested : 'NA';
      d_act = (!_base || d_rec == 'NA' || d_con == 'NA' || d_dec == 'NA') ? 'NA' : (d_con - (d_rec + d_dec));

      // actual data
      if (this.data.districts[e].meta) {
        name = (e) ? e : 'NA';
        pop = (this.data.districts[e].meta.population) ? this.data.districts[e].meta.population : 'NA';
        con = (this.data.districts[e].total && this.data.districts[e].total.confirmed) ? this.data.districts[e].total.confirmed : 'NA';
        dec = (this.data.districts[e].total && this.data.districts[e].total.deceased) ? this.data.districts[e].total.deceased : 'NA';
        tes = (this.data.districts[e].total && this.data.districts[e].total.tested) ? this.data.districts[e].total.tested : 'NA';
        rec = (this.data.districts[e].total && this.data.districts[e].total.recovered) ? this.data.districts[e].total.recovered : 'NA';
        act = (con == 'NA' || rec == 'NA' || dec == 'NA') ? 'NA' : (con - (rec + dec));

        this.SortDistricts.push(new Districts(name, pop, con, dec, tes, rec, act, d_con, d_act, d_rec, d_dec, d_tes));
      }
    }

    // placeholder
    for (const d in this.data.districts) {
      if (this.data.districts[d].meta && this.data.districts[d].total) {
        this.placeholder.push(d);
      }
    }

    this.initialize();
    this.StateTimeSeries();
    this.placaholderFunc(this.placeholder);
  }

  initialize() {
    for (const d in this.data.districts) {
      if (this.data.districts[d].meta && this.data.districts[d].total) {
        if (this.data.districts[d].meta.population) {
          this.st_population += Number(this.data.districts[d].meta.population);
        }

        if (this.data.districts[d].total.confirmed) {
          this.st_confirmed += Number(this.data.districts[d].total.confirmed);
        }

        if (this.data.districts[d].total.recovered) {
          this.st_recovered += Number(this.data.districts[d].total.recovered);
        }

        if (this.data.districts[d].total.deceased) {
          this.st_deceased += Number(this.data.districts[d].total.deceased);
        }

        if (this.data.districts[d].total.tested) {
          this.st_tested += Number(this.data.districts[d].total.tested);
        }
      }
    }

    this.st_Active = this.st_confirmed - (this.st_recovered + this.st_deceased);

    if (this.data.delta) {
      if (this.data.delta.confirmed) {
        this.delta_confirmed = this.data.delta.confirmed;
      }

      if (this.data.delta.recovered) {
        this.delta_recovered = this.data.delta.recovered;
      }

      if (this.data.delta.deceased) {
        this.delta_deceased = this.data.delta.deceased;
      }

      if (this.data.delta.tested) {
        this.delta_tested = this.data.delta.tested;
      }

      this.delta_active = +this.delta_confirmed - (+this.delta_recovered + +this.delta_deceased);
    }
    this.stateRank = this._serv.getStateRank();  

    this.districtData = [
      { Name: 'Confirmed Cases', number: this.st_confirmed, class: 'fill cl_con', del: this.delta_confirmed, del_style: 'delta_tot del_con', icon: 'fa fa-plus-square', rank: this.stateRank.ConfirmedRank},
      { Name: 'Active Cases', number: this.st_Active, class: 'fill cl_act', del: this.delta_active, del_style: 'delta_tot del_act', icon: 'fa fa-heartbeat', rank: this.stateRank.ActiveRank },
      { Name: 'Recovered Cases', number: this.st_recovered, class: 'fill cl_rec', del: this.delta_recovered, del_style: 'delta_tot del_rec', icon: 'fa fa-check-circle', rank: this.stateRank.RecoveredRank },
      { Name: 'Deceased Cases', number: this.st_deceased, class: 'fill cl_dec', del: this.delta_deceased, del_style: 'delta_tot del_dec', icon: 'fa fa-minus-circle', rank: this.stateRank.DeceasedRank },
      { Name: 'Total Tested', number: this.st_tested, class: 'fill cl_tes', del: this.delta_tested, del_style: 'delta_tot del_tes', icon: 'fa fa-flask', rank: this.stateRank.TestsRank }
    ];    
  }

  searchWord(e) {
    let temp: Districts[] = [];
    if (e.length == 0) {
      this.SortDistricts = this.SortStatesDup;
    }
    else {
      temp = [];
      this.SortStatesDup.forEach(element => {
        if (element.dt_name.toLowerCase().includes(e.toLowerCase())) {
          temp.push(element);
        }
      });
    }

    if (temp.length > 0 && e != '') {
      this.SortDistricts = temp;
    }

    if (e.length != 0 && temp.length < 1) {
      this.SortDistricts = [];
    }
  }

  dt_sort(sortBy) {
    if (sortBy == 'Name') {
      this.dt_SortBy = sortBy;

      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function (a, b) {
          if (a.dt_name > b.dt_name) { return -1; }
          if (a.dt_name < b.dt_name) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function (a, b) {
          if (a.dt_name > b.dt_name) { return -1; }
          if (a.dt_name < b.dt_name) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'Population') {
      this.dt_SortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function (a, b) {
          a.dt_population = (a.dt_population.toString() == 'NA') ? -1.5 : a.dt_population;
          b.dt_population = (b.dt_population.toString() == 'NA') ? -1.5 : b.dt_population;
          if (a.dt_population > b.dt_population) { return -1; }
          if (a.dt_population < b.dt_population) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function (a, b) {
          a.dt_population = (a.dt_population.toString() == 'NA') ? -1.5 : a.dt_population;
          b.dt_population = (b.dt_population.toString() == 'NA') ? -1.5 : b.dt_population;
          if (a.dt_population > b.dt_population) { return -1; }
          if (a.dt_population < b.dt_population) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'Confirmed') {
      this.dt_SortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function (a, b) {
          a.dt_confirmed = (a.dt_confirmed.toString() == 'NA') ? -1.5 : a.dt_confirmed;
          b.dt_confirmed = (b.dt_confirmed.toString() == 'NA') ? -1.5 : b.dt_confirmed;
          if (a.dt_confirmed > b.dt_confirmed) { return -1; }
          if (a.dt_confirmed < b.dt_confirmed) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function (a, b) {
          a.dt_confirmed = (a.dt_confirmed.toString() == 'NA') ? -1.5 : a.dt_confirmed;
          b.dt_confirmed = (b.dt_confirmed.toString() == 'NA') ? -1.5 : b.dt_confirmed;
          if (a.dt_confirmed > b.dt_confirmed) { return -1; }
          if (a.dt_confirmed < b.dt_confirmed) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'Active') {
      this.dt_SortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function (a, b) {
          a.dt_active = (a.dt_active.toString() == 'NA') ? -1.5 : a.dt_active;
          b.dt_active = (b.dt_active.toString() == 'NA') ? -1.5 : b.dt_active;
          if (a.dt_active > b.dt_active) { return -1; }
          if (a.dt_active < b.dt_active) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function (a, b) {
          a.dt_active = (a.dt_active.toString() == 'NA') ? -1.5 : a.dt_active;
          b.dt_active = (b.dt_active.toString() == 'NA') ? -1.5 : b.dt_active;
          if (a.dt_active > b.dt_active) { return -1; }
          if (a.dt_active < b.dt_active) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }


    if (sortBy == 'Recovered') {
      this.dt_SortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function (a, b) {
          a.dt_recoverd = (a.dt_recoverd.toString() == 'NA') ? -1.5 : a.dt_recoverd;
          b.dt_recoverd = (b.dt_recoverd.toString() == 'NA') ? -1.5 : b.dt_recoverd;
          if (a.dt_recoverd > b.dt_recoverd) { return -1; }
          if (a.dt_recoverd < b.dt_recoverd) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function (a, b) {
          a.dt_recoverd = (a.dt_recoverd.toString() == 'NA') ? -1.5 : a.dt_recoverd;
          b.dt_recoverd = (b.dt_recoverd.toString() == 'NA') ? -1.5 : b.dt_recoverd;
          if (a.dt_recoverd > b.dt_recoverd) { return -1; }
          if (a.dt_recoverd < b.dt_recoverd) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'Deceased') {
      this.dt_SortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function (a, b) {
          a.dt_deceased = (a.dt_deceased.toString() == 'NA') ? -1.5 : a.dt_deceased;
          b.dt_deceased = (b.dt_deceased.toString() == 'NA') ? -1.5 : b.dt_deceased;
          if (a.dt_deceased > b.dt_deceased) { return -1; }
          if (a.dt_deceased < b.dt_deceased) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function (a, b) {
          a.dt_deceased = (a.dt_deceased.toString() == 'NA') ? -1.5 : a.dt_deceased;
          b.dt_deceased = (b.dt_deceased.toString() == 'NA') ? -1.5 : b.dt_deceased;
          if (a.dt_deceased > b.dt_deceased) { return -1; }
          if (a.dt_deceased < b.dt_deceased) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'Tested') {
      this.dt_SortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function (a, b) {
          a.dt_tested = (a.dt_tested.toString() == 'NA') ? -1.5 : a.dt_tested;
          b.dt_tested = (b.dt_tested.toString() == 'NA') ? -1.5 : b.dt_tested;
          if (a.dt_tested > b.dt_tested) { return -1; }
          if (a.dt_tested < b.dt_tested) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function (a, b) {
          a.dt_tested = (a.dt_tested.toString() == 'NA') ? -1.5 : a.dt_tested;
          b.dt_tested = (b.dt_tested.toString() == 'NA') ? -1.5 : b.dt_tested;
          if (a.dt_tested > b.dt_tested) { return -1; }
          if (a.dt_tested < b.dt_tested) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }
  }


  placaholderFunc(d) {
    let i = 0;
    setInterval(() => {
      if (i < this.placeholder.length) {
        this.PlaceholderDtName = d[i];
        i++;
      }
      else {
        i = 0;
      }
    }, 1000);
  }


  StateTimeSeries() {
    this._serv.getStateTimeSeries().subscribe(d => {      
      for (let val in d[this.stateCode]['dates']) {
        if (d[this.stateCode]['dates'][val]['delta']) {
          let date_len = new Date(val).toLocaleDateString().length;
          let date = new Date(val).toLocaleDateString().substring(0,date_len-5);
          let con = d[this.stateCode]['dates'][val]['delta']['confirmed'] ? d[this.stateCode]['dates'][val]['delta']['confirmed'] : 'NA';
          let rec = d[this.stateCode]['dates'][val]['delta']['recovered'] ? d[this.stateCode]['dates'][val]['delta']['recovered'] : 'NA';
          let dec = d[this.stateCode]['dates'][val]['delta']['deceased'] ? d[this.stateCode]['dates'][val]['delta']['deceased'] : 'NA';
          let tes = d[this.stateCode]['dates'][val]['delta']['tested'] ? d[this.stateCode]['dates'][val]['delta']['tested'] : 'NA';
          let act = (con != 'NA' && rec != 'NA' && dec != 'NA') ? (con - (dec + rec)) : 'NA';
          if (con != 'NA')
            this.StateConfirmedTimeSeriesData.push(new StateDailyCounts(date, con));
          if (rec != 'NA')
            this.StateRecoveredTimeSeriesData.push(new StateDailyCounts(date, rec));
          if (dec != 'NA')
            this.StateDeceasedTimeSeriesData.push(new StateDailyCounts(date, dec));
          if (tes != 'NA')
            this.StateTestsTimeSeriesData.push(new StateDailyCounts(date, tes));
        }
      }
      
      if (this.StateConfirmedTimeSeriesData.length > 9) {
        this.ConfirmedSeriesFlag = true;
      }

      if (this.StateRecoveredTimeSeriesData.length > 9) {
        this.RecoveredSeriesFlag = true;
      }

      if (this.StateDeceasedTimeSeriesData.length > 9) {
        this.DeceasedSeriesFlag = true;
      }

      if (this.StateTestsTimeSeriesData.length > 9) {
        this.TestsSeriesFlag = true;
      }


      // Main Dashboard - multiple dataset graph
      Chart.Legend.prototype.afterFit = function () {
        this.height = this.height + 25;
      };      

      //confirm X-Y axis data
      const conXlabels = [];
      const conYlabels = [];
      var conChartColors = {
        color1: '#5499c7', //lightest
        color2: '#2980b9',
        color3: '#2471a3',
        color4: '#1f618d',
        color5: '#1a5276', //darkest
      }

      this.StateConfirmedTimeSeriesData.reverse().splice(0, 10).forEach(element => {       
        conXlabels.push(element.date);
        conYlabels.push(element.number);
      });

      if(this.ConfirmedSeriesFlag){
      const stConfirmData = new Chart('stConfirmData', {
        type: 'bar',
        data: {
          labels: conXlabels.reverse(),
          datasets: [
            {
              label: ['Confirmed'],
              data: conYlabels.reverse(),
              backgroundColor : [
                conChartColors.color1,conChartColors.color1,conChartColors.color1,conChartColors.color1,conChartColors.color1,conChartColors.color1,conChartColors.color1,conChartColors.color1,conChartColors.color1,conChartColors.color1
              ]
            }]
        },
        options: {
          animation:{
            onComplete: function () {
              var chartInstance = this.chart;
              var ctx = chartInstance.ctx;              
              ctx.textAlign = "center";
              ctx.font = "bold 9px 'Helvetica Neue', Helvetica, Arial, sans-serif";
              
              Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) 
                {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    Chart.helpers.each(meta.data.forEach(function (bar, index) 
                    {
                      if(index >=0){
                        let cal = ((dataset.data[index] - dataset.data[0])/dataset.data[0])*100;
                        ctx.fillText((Math.round(cal)).toString()+"%", bar._model.x, bar._model.y - 10);
                      }
                    }), this)
               }), this);
            }
          },
          responsive: true,
          tooltips: {
            enabled: true,
          },
          scales: {
            maintainAspectRatio:false,
            xAxes:[{
              ticks:{
                fontSize: 10,
                autoSkip: false
              }
            }],
            yAxes: [{
              gridLines: {
                drawOnChartArea: true
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 6,
                min: 0
            }
            }]
          }
        }
      });

      let intialvalue = stConfirmData.data.datasets[0];
      for(let i=0; i<intialvalue.data.length;i++)
      {
        let val = Math.round(((intialvalue.data[i] - intialvalue.data[0])/intialvalue.data[0])*100);
        if(val<=0)
          intialvalue.backgroundColor[i]=conChartColors.color1; //console.log(val,'lightest');
        else if(val > 0 && val <=25)
          intialvalue.backgroundColor[i]=conChartColors.color2; //console.log(val, 'level 2');
        else if(val > 26 && val <=50)
          intialvalue.backgroundColor[i]=conChartColors.color3; //console.log(val, 'level 3');
        else if(val > 51 && val <=75)
          intialvalue.backgroundColor[i]=conChartColors.color4; //console.log(val, 'level 4');
        else
          intialvalue.backgroundColor[i]=conChartColors.color5; //console.log(val, 'darkest');
      }
      stConfirmData.update();
    }


      //recovered graph
      const recXlabels = [];
      const recYlabels = [];
      var recChartColors = {
        color1: '#52be80', //lightest
        color2: '#27ae60',
        color3: '#229954',
        color4: '#1e8449',
        color5: '#196f3d', //darkest
      }

      this.StateRecoveredTimeSeriesData.reverse().splice(0, 10).forEach(element => {
        recXlabels.push(element.date);
        recYlabels.push(element.number);
      });

      if(this.RecoveredSeriesFlag){
      const stRecoveredmData = new Chart('stRecoveredmData', {
        type: 'bar',
        data: {
          labels: recXlabels.reverse(),
          datasets: [
            {
              label: ['Recovered'],
              data: recYlabels.reverse(),
              backgroundColor : [
                recChartColors.color1,recChartColors.color1,recChartColors.color1,recChartColors.color1,recChartColors.color1,recChartColors.color1,recChartColors.color1,recChartColors.color1,recChartColors.color1,recChartColors.color1
              ]
            }]
        },
        options: {
          animation:{
            onComplete: function () {
              var chartInstance = this.chart;
              var ctx = chartInstance.ctx;              
              ctx.textAlign = "center";
              ctx.font = "bold 9px 'Helvetica Neue', Helvetica, Arial, sans-serif";
              
              Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) 
                {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    Chart.helpers.each(meta.data.forEach(function (bar, index) 
                    {
                      if(index >=0){
                        let cal = ((dataset.data[index] - dataset.data[0])/dataset.data[0])*100;
                        ctx.fillText((Math.round(cal)).toString()+"%", bar._model.x, bar._model.y - 10);
                      }
                      
                    }), this)
               }), this);
            }
          },
          responsive: true,
          tooltips: {
            enabled: true,
          },
          scales: {
            xAxes:[{
              ticks:{
                fontSize: 10,
                autoSkip: false
              }
            }],
            yAxes: [{
              gridLines: {
                drawOnChartArea: true
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 6,
                min: 0
            }
            }]
          }
        }
      });

      let intialvalue = stRecoveredmData.data.datasets[0];
      for(let i=0; i<intialvalue.data.length;i++)
      {
        let val = Math.round(((intialvalue.data[i] - intialvalue.data[0])/intialvalue.data[0])*100);
        if(val<=0)
          intialvalue.backgroundColor[i]=recChartColors.color1; //console.log(val,'lightest');
        else if(val > 0 && val <=25)
        intialvalue.backgroundColor[i]=recChartColors.color2; //console.log(val, 'level 2');
        else if(val > 26 && val <=50)
        intialvalue.backgroundColor[i]=recChartColors.color3; //console.log(val, 'level 3');
        else if(val > 51 && val <=75)
        intialvalue.backgroundColor[i]=recChartColors.color4; //console.log(val, 'level 4');
        else
        intialvalue.backgroundColor[i]=recChartColors.color5; //console.log(val, 'darkest');
      }
      stRecoveredmData.update();
    }


      //Deceased X-Y axis data
      const decXlabels = [];
      const decYlabels = [];
      var decChartColors = {
        color1: '#d98880', //lightest
        color2: '#cd6155',
        color3: '#a93226',
        color4: '#922b21',
        color5: '#641e16', //darkest
      }

      this.StateDeceasedTimeSeriesData.reverse().splice(0, 10).forEach(element => {
        decXlabels.push(element.date);
        decYlabels.push(element.number);
      });

      if(this.DeceasedSeriesFlag){
      const stDeceasedData = new Chart('stDeceasedData', {
        type: 'bar',
        data: {
          labels: decXlabels.reverse(),
          datasets: [
            {
              label: ['Deceased'],
              data: decYlabels.reverse(),
              backgroundColor : [
                decChartColors.color1,decChartColors.color1,decChartColors.color1,decChartColors.color1,decChartColors.color1,decChartColors.color1,decChartColors.color1,decChartColors.color1,decChartColors.color1,decChartColors.color1
              ]
            }]
        },
        options: {
          animation:{
            onComplete: function () {
              var chartInstance = this.chart;
              var ctx = chartInstance.ctx;              
              ctx.textAlign = "center";
              ctx.font = "bold 9px 'Helvetica Neue', Helvetica, Arial, sans-serif";
              
              Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) 
                {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    Chart.helpers.each(meta.data.forEach(function (bar, index) 
                    {
                      if(index >=0){
                        let cal = ((dataset.data[index] - dataset.data[0])/dataset.data[0])*100;
                        ctx.fillText((Math.round(cal)).toString()+"%", bar._model.x, bar._model.y - 10);
                      }
                    }), this)
               }), this);
            }
          },
          responsive: true,
          tooltips: {
            enabled: true,
          },
          scales: {
            xAxes:[{
              ticks:{
                fontSize: 10,
                autoSkip: false
              }
            }],
            yAxes: [{
              gridLines: {
                drawOnChartArea: true
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 6,
                min: 0
            }
            }]
          }
        }
      });

      let intialvalue = stDeceasedData.data.datasets[0];
      for(let i=0; i<intialvalue.data.length;i++)
      {
        let val = Math.round(((intialvalue.data[i] - intialvalue.data[0])/intialvalue.data[0])*100);
        if(val<=0)
          intialvalue.backgroundColor[i]=decChartColors.color1; //console.log(val,'lightest');
        else if(val > 0 && val <=25)
        intialvalue.backgroundColor[i]=decChartColors.color2; //console.log(val, 'level 2');
        else if(val > 26 && val <=50)
        intialvalue.backgroundColor[i]=decChartColors.color3; //console.log(val, 'level 3');
        else if(val > 51 && val <=75)
        intialvalue.backgroundColor[i]=decChartColors.color4; //console.log(val, 'level 4');
        else
        intialvalue.backgroundColor[i]=decChartColors.color5; //console.log(val, 'darkest');
      }
      stDeceasedData.update();
    }

      //Tests X-Y axis data
      const tesXlabels = [];
      const tesYlabels = [];
      var tesChartColors = {
        color1: '#f8c471', //lightest
        color2: '#f5b041',
        color3: '#f39c12',
        color4: '#d68910',
        color5: '#b9770e', //darkest
      }

      this.StateTestsTimeSeriesData.reverse().splice(0, 10).forEach(element => {
        tesXlabels.push(element.date);
        tesYlabels.push(element.number);
      });

      if(this.TestsSeriesFlag){
      const stTestsData = new Chart('stTestsData', {
        type: 'bar',
        data: {
          labels: tesXlabels.reverse(),
          datasets: [
            {
              label: ['Tests'],
              data: tesYlabels.reverse(),
              backgroundColor : [
                tesChartColors.color1,tesChartColors.color1,tesChartColors.color1,tesChartColors.color1,tesChartColors.color1,tesChartColors.color1,tesChartColors.color1,tesChartColors.color1,tesChartColors.color1,tesChartColors.color1
              ]
            }]
        },
        options: {
          animation:{
            onComplete: function () {
              var chartInstance = this.chart;
              var ctx = chartInstance.ctx;              
              ctx.textAlign = "center";
              ctx.font = "bold 9px 'Helvetica Neue', Helvetica, Arial, sans-serif";
              
              Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) 
                {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    Chart.helpers.each(meta.data.forEach(function (bar, index) 
                    {
                      if(index >=0){
                        let cal = ((dataset.data[index] - dataset.data[0])/dataset.data[0])*100;
                        ctx.fillText((Math.round(cal)).toString()+"%", bar._model.x, bar._model.y - 10);
                      }
                    }), this)
               }), this);
            }
          },
          responsive: true,
          tooltips: {
            enabled: true,
          },
          scales: {
            xAxes:[{
              ticks:{
                fontSize: 10,
                autoSkip: false
              }
            }],
            yAxes: [{
              gridLines: {
                drawOnChartArea: true
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 6,
                min: 0
            }
            }]
          }
        }
      });
      let intialvalue = stTestsData.data.datasets[0];
      for(let i=0; i<intialvalue.data.length;i++)
      {
        let val = Math.round(((intialvalue.data[i] - intialvalue.data[0])/intialvalue.data[0])*100);
        if(val<=0)
          intialvalue.backgroundColor[i]=tesChartColors.color1; //console.log(val,'lightest');
        else if(val > 0 && val <=25)
        intialvalue.backgroundColor[i]=tesChartColors.color2; //console.log(val, 'level 2');
        else if(val > 26 && val <=50)
        intialvalue.backgroundColor[i]=tesChartColors.color3; //console.log(val, 'level 3');
        else if(val > 51 && val <=75)
        intialvalue.backgroundColor[i]=tesChartColors.color4; //console.log(val, 'level 4');
        else
        intialvalue.backgroundColor[i]=tesChartColors.color5; //console.log(val, 'darkest');
      }
      stTestsData.update();
    }

    }
    )
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior:"smooth"});
  }
}


