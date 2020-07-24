import { Component, OnInit } from '@angular/core';
import { CovidStDt } from '../Models/covid-st-dt';
import { APIService } from '../Services/api.service';
import { Chart } from 'node_modules/chart.js';
import { Router } from '@angular/router';
import { States } from '../Models/states';
import { StatesDelta } from '../Models/states-delta';
import { Rank } from '../Models/rank';

@Component({
  selector: 'app-covid',
  templateUrl: './covid.component.html',
  styleUrls: ['./covid.component.css']
})

export class CovidComponent implements OnInit {
  //page variables
  dateMessage: any;
  IndianPopulation;
  Nt_TotalConfirmedCases = 0;
  Nt_TotalRecoverdCases = 0;
  Nt_TotalDeceasedCases = 0;
  Nt_TotalTests = 0;
  Nt_Active = 0;
  Nt_data: any;

  Nt_Del_Confirmed = 0;
  Nt_Del_Recovered = 0;
  Nt_Del_Deceased = 0;
  Nt_Del_Tested = 0;
  Nt_Del_Active = 0;

  nt_active_percent;
  nt_recovered_percent;
  nt_deceased_percent;
  nt_tests_percent; // percent of tests wrt population

  TopStates ;


  data: Array<CovidStDt>;
  timeSeriesData: any;

  //API error message handler 
  errorMessage = "NA";

  // sort states
  SortStates: Array<States> = [];
  SortStatesDup = this.SortStates;
  st_sortBy: any = 'name';
  counter = 0; // even - Descending; odd - ascending

  // search
  SearchWord: any = '';


  // top 5 bar chart
  sortedValues: Array<number> = [];
  sortedValuesStates: Array<number> = [];
  selectedRadio = 'confirmed';

  // placeholder
  placeHolderStateName: any;
  placeholder = [];
  statesLength = 35;

  // States Delta Data
  St_Delta: Array<StatesDelta> = [];

  constructor(private _serv: APIService, private _route: Router) { }

  ngOnInit(): void {

    this._serv.getCovid().subscribe(
      (response) => {
      this.data = response;

      // placeholder
      this.placeHolderStateName = this._serv.getPipeStateName(Object.keys(this.data)[0]);
      for (const d in this.data)
      {
        if (d != 'TT' && d != 'UN') {
          this.placeholder.push(d);
        }
      }
      this.placaholderFunc(this.placeholder);

      //total population
      this.IndianPopulation = this.data['TT']['meta']['population'];

      // actual states data & delta info
      for (const e in this.data)
      {
        let name, pop, con, dec, tes, rec, test_date, act;
        let d_con, d_rec, d_act, d_dec, d_tes;
        const _base = this.data[e]['delta'];

        if (e != 'TT' && e != 'UN')
        {
          d_con = (_base && _base.confirmed) ? _base.confirmed : 'NA';
          d_rec = (_base && _base.recovered) ? _base.recovered : 'NA';
          d_dec = (_base && _base.deceased) ? _base.deceased : 'NA';
          d_tes = (_base && _base.tested) ? _base.tested : 'NA';
          d_act = (!_base || d_rec == 'NA' || d_con == 'NA' || d_dec == 'NA') ? 'NA' : (d_con - (d_rec + d_dec));
        }

        if (this.data[e]['meta'] && this.data[e]['total'] && this._serv.getPipeStateName(e) && e != 'TT' && e != 'UN')
        {
          const _base = this.data[e];
          name = this._serv.getPipeStateName(e);
          pop = (_base['meta']['population']) ? _base['meta']['population'] : 'NA';
          con = (_base['total']['confirmed']) ? _base['total']['confirmed'] : 'NA';
          dec = (_base['total']['deceased']) ?  _base['total']['deceased'] : 'NA';
          tes = (_base['total']['tested']) ?    _base['total']['tested'] : 'NA';
          rec = (_base['total']['recovered']) ? _base['total']['recovered'] : 'NA';
          test_date = (_base['meta']['last_updated']) ? (_base['meta']['last_updated']) : 'NA';
          act = (con == 'NA' || dec == 'NA' || rec == 'NA') ? 'NA' : (con - (rec + dec));
          this.SortStates.push(new States(name, pop, con, dec, tes, rec, act, test_date, d_con, d_rec, d_dec, d_tes, d_act));
        }
      }

      // functions
      if (this.st_sortBy) {
        this.st_sortByClick(this.st_sortBy);
      }

      this.timeSeries();
      this.Initialdata(this.data);
      this.searchWord(this.SearchWord);
    },
    (error)=>{
      if(error.status="404")
        this.errorMessage = 'Looks like something is not good. Its 404 error';
      else
        this.errorMessage = "Hmmm... it shouldn't happen like this, try refreshing to see the magic";      
      throw error;
    });
  }

  // all the data initialization take place here
  Initialdata(d){

    if (this.selectedRadio) {
      this.topChart(d, this.selectedRadio);
    }

    // national total case counts
    for (const e in d) {
      if (d[e].total && e !== 'TT') {

        if (d[e].total.confirmed){
          this.Nt_TotalConfirmedCases = this.Nt_TotalConfirmedCases + Number(d[e].total.confirmed);
        }

        if (d[e].total.recovered){
          this.Nt_TotalRecoverdCases += Number(d[e].total.recovered);
        }

        if (d[e].total.deceased){
          this.Nt_TotalDeceasedCases += Number(d[e].total.deceased);
        }

        if (d[e].total.tested){
          this.Nt_TotalTests += Number(d[e].total.tested);
        }
      }

      // national delta totals
      if (d[e].delta && e !== 'TT'){

        if (d[e].delta.confirmed){
          this.Nt_Del_Confirmed += Number(d[e].delta.confirmed);
        }

        if (d[e].delta.recovered){
          this.Nt_Del_Recovered += Number(d[e].delta.recovered);
        }

        if (d[e].delta.deceased){
          this.Nt_Del_Deceased += Number(d[e].delta.deceased);
        }

        if (d[e].delta.tested){
          this.Nt_Del_Tested += Number(d[e].delta.tested);
        }
      }
    }

    this.Nt_Active = this.Nt_TotalConfirmedCases - (this.Nt_TotalDeceasedCases + this.Nt_TotalRecoverdCases);
    this.Nt_Del_Active = this.Nt_Del_Confirmed - (this.Nt_Del_Deceased + this.Nt_Del_Recovered);

    this.nt_recovered_percent = this.Nt_TotalRecoverdCases / this.Nt_TotalConfirmedCases;
    this.nt_active_percent = (this.Nt_Active / this.Nt_TotalConfirmedCases);
    this.nt_deceased_percent = (this.Nt_TotalDeceasedCases / this.Nt_TotalConfirmedCases);
    this.nt_tests_percent = (this.Nt_TotalTests / this.IndianPopulation);

    this.Nt_data = [
      {Name: 'Confirmed Cases', number: this.Nt_TotalConfirmedCases, style: 'con_cl', del: this.Nt_Del_Confirmed, del_style: 'delta_tot', icon: 'fa fa-plus-square' },
      {Name: 'Active Cases', number: this.Nt_Active, style: 'act_cl', del: this.Nt_Del_Active, del_style: 'delta_tot', percent: this.nt_active_percent, icon: 'fa fa-heartbeat',  percText: 'of Confirmed'},
      {Name: 'Recovered Cases', number: this.Nt_TotalRecoverdCases, style: 'rec_cl', del: this.Nt_Del_Recovered, del_style: 'delta_tot', percent: this.nt_recovered_percent, icon: 'fa fa-check-circle', percText: 'of Confirmed' },
      {Name: 'Deceased Cases', number: this.Nt_TotalDeceasedCases, style: 'dec_cl', del: this.Nt_Del_Deceased, del_style: 'delta_tot', percent: this.nt_deceased_percent, icon: 'fa fa-minus-circle', percText: 'of Confirmed' },
      {Name: 'Total Tests', number: this.Nt_TotalTests, style: 'tot_cl', del: this.Nt_Del_Tested, del_style: 'delta_tot', icon: 'fa fa-flask', percent: this.nt_tests_percent, percText: 'of Population'}
    ];

  }


  // filter states by input search keyword logic
  st_sortByClick(e){
      this.st_sortBy = e;
      this.st_sortFunc(this.st_sortBy);
  }


  // Actual filter function logic
  searchWord(e)
  {
    let temp: States[] = [];
    if (e.length == 0){
      this.SortStates = this.SortStatesDup;
    }
    else{
      temp = [];
      this.SortStatesDup.forEach(element => {
        if (element.st_name.toLowerCase().includes(e.toLowerCase()))
        {
          temp.push(element);
        }
      });
    }

    if (temp.length > 0 && e != '') {
      this.SortStates = temp;
    }

    if (e.length != 0 && temp.length < 1) {
      this.SortStates = [];
    }
  }


  // Actual sort columns logic
  st_sortFunc(sortBy)
  {
    if (sortBy == 'name') {
      this.st_sortBy = sortBy;

      if (this.counter % 2 != 0) {
        this.SortStates.sort(function(a, b) {
          if (a.st_name  > b.st_name) { return -1; }
          if (a.st_name < b.st_name) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function(a, b) {
          if (a.st_name  > b.st_name) { return -1; }
          if (a.st_name < b.st_name) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'population')
    {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function(a, b) {
          a.st_population = (a.st_population.toString() == 'NA') ? -1.5 : a.st_population;
          b.st_population = (b.st_population.toString() == 'NA') ? -1.5 : b.st_population;
          if (a.st_population > b.st_population) { return -1; }
          if (a.st_population < b.st_population) { return 1; }
            else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function(a, b) {
          a.st_population = (a.st_population.toString() == 'NA') ? -1.5 : a.st_population;
          b.st_population = (b.st_population.toString() == 'NA') ? -1.5 : b.st_population;
          if (a.st_population > b.st_population) { return -1; }
          if (a.st_population < b.st_population) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'confirmed') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function(a, b) {
          a.st_confirmed = (a.st_confirmed.toString() == 'NA') ? -1.5 : a.st_confirmed;
          b.st_confirmed = (b.st_confirmed.toString() == 'NA') ? -1.5 : b.st_confirmed;
          if (a.st_confirmed > b.st_confirmed) { return -1; }
          if (a.st_confirmed < b.st_confirmed) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function(a, b) {
          a.st_confirmed = (a.st_confirmed.toString() == 'NA') ? -1.5 : a.st_confirmed;
          b.st_confirmed = (b.st_confirmed.toString() == 'NA') ? -1.5 : b.st_confirmed;
          if (a.st_confirmed > b.st_confirmed) { return -1; }
          if (a.st_confirmed < b.st_confirmed) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      } 
    }

    if (sortBy == 'active') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function(a, b) {
          a.st_active = (a.st_active.toString() == 'NA') ? -1.5 : a.st_active;
          b.st_active = (b.st_active.toString() == 'NA') ? -1.5 : b.st_active;
          if (a.st_active > b.st_active) { return -1; }
          if (a.st_active < b.st_active) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function(a, b) {
          a.st_active = (a.st_active.toString() == 'NA') ? -1.5 : a.st_active;
          b.st_active = (b.st_active.toString() == 'NA') ? -1.5 : b.st_active;
          if (a.st_active > b.st_active) { return -1; }
          if (a.st_active < b.st_active) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }


    if (sortBy == 'recovered') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function(a, b) {
          a.st_recoverd = (a.st_recoverd.toString() == 'NA') ? -1.5 : a.st_recoverd;
          b.st_recoverd = (b.st_recoverd.toString() == 'NA') ? -1.5 : b.st_recoverd;
          if (a.st_recoverd > b.st_recoverd) { return -1; }
          if (a.st_recoverd < b.st_recoverd) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function(a, b) {
          a.st_recoverd = (a.st_recoverd.toString() == 'NA') ? -1.5 : a.st_recoverd;
          b.st_recoverd = (b.st_recoverd.toString() == 'NA') ? -1.5 : b.st_recoverd;
          if (a.st_recoverd > b.st_recoverd) { return -1; }
          if (a.st_recoverd < b.st_recoverd) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'deceased') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function(a, b) {
          a.st_deceased = (a.st_deceased.toString() == 'NA') ? -1.5 : a.st_deceased;
          b.st_deceased = (b.st_deceased.toString() == 'NA') ? -1.5 : b.st_deceased;
          if (a.st_deceased > b.st_deceased) { return -1; }
          if (a.st_deceased < b.st_deceased) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function(a, b) {
          a.st_deceased = (a.st_deceased.toString() == 'NA') ? -1.5 : a.st_deceased;
          b.st_deceased = (b.st_deceased.toString() == 'NA') ? -1.5 : b.st_deceased;
          if (a.st_deceased > b.st_deceased) { return -1; }
          if (a.st_deceased < b.st_deceased) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'tested') {
      this.st_sortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortStates.sort(function(a, b) {
          a.st_tested = (a.st_tested.toString() == 'NA') ? -1.5 : a.st_tested;
          b.st_tested = (b.st_tested.toString() == 'NA') ? -1.5 : b.st_tested;
          if (a.st_tested > b.st_tested) { return -1; }
          if (a.st_tested < b.st_tested) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortStates.sort(function(a, b) {
          a.st_tested = (a.st_tested.toString() == 'NA') ? -1.5 : a.st_tested;
          b.st_tested = (b.st_tested.toString() == 'NA') ? -1.5 : b.st_tested;
          if (a.st_tested > b.st_tested) { return -1; }
          if (a.st_tested < b.st_tested) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

  }

  //ranks sort funct
  sortDataRank(Name,e, key){
    let term;    
    switch (key) {
      case 'confirmed':
        term= 'st_confirmed';
        e.sort(function(a, b) {
          a.st_confirmed = (a.st_confirmed == 'NA') ? -1.5 : a.st_confirmed;
          b.st_confirmed = (b.st_confirmed== 'NA') ? -1.5 : b.st_confirmed;
          if (a.st_confirmed > b.st_confirmed) { return -1; }
          if (a.st_confirmed < b.st_confirmed) { return 1; }
          else { return 0; }
        });
        break;
      case 'recovered':
        term= 'st_recoverd';
        e.sort(function(a, b) {
            a.st_recoverd = (a.st_recoverd.toString() == 'NA') ? -1.5 : a.st_recoverd;
            b.st_recoverd = (b.st_recoverd.toString() == 'NA') ? -1.5 : b.st_recoverd;
            if (a.st_recoverd > b.st_recoverd) { return -1; }
            if (a.st_recoverd < b.st_recoverd) { return 1; }
            else { return 0; }
          });
        break;
      case 'deceased':
        term= 'st_deceased';
        e.sort(function(a, b) {
          a.st_deceased = (a.st_deceased.toString() == 'NA') ? -1.5 : a.st_deceased;
          b.st_deceased = (b.st_deceased.toString() == 'NA') ? -1.5 : b.st_deceased;
          if (a.st_deceased > b.st_deceased) { return -1; }
          if (a.st_deceased < b.st_deceased) { return 1; }
          else { return 0; }
        });
        break;
      case 'active':
         term= 'st_active';
         e.sort(function(a, b) {
            a.st_active = (a.st_active.toString() == 'NA') ? -1.5 : a.st_active;
            b.st_active = (b.st_active.toString() == 'NA') ? -1.5 : b.st_active;
            if (a.st_active > b.st_active) { return -1; }
            if (a.st_active < b.st_active) { return 1; }
            else { return 0; }
        });
        break;
      case 'tested':
        term= 'st_tested';
        e.sort(function(a, b) {
          a.st_tested = (a.st_tested.toString() == 'NA') ? -1.5 : a.st_tested;
          b.st_tested = (b.st_tested.toString() == 'NA') ? -1.5 : b.st_tested;
          if (a.st_tested > b.st_tested) { return -1; }
          if (a.st_tested < b.st_tested) { return 1; }
          else { return 0; }
        });
        break;
      default:
        term= 'st_confirmed';
        break;
    }
    return e.findIndex(f=>f.st_name==Name) + 1;
  }


  // send state name and respective data to service before routing to a state page
  stateCode(e)
  {
    const Name = e.target.innerText;
    const code = this._serv.getPipeStateCode(Name);
    
    //send the selcted state data to service before routing
    this._serv.setCovidData(this.data[code]);

    //call the functions to get the state ranks for each category
    let temp_data= this.SortStates;   
    const con = this.sortDataRank(Name,temp_data,'confirmed');    
    const rec = this.sortDataRank(Name,temp_data,'recovered');
    const dec = this.sortDataRank(Name,temp_data,'deceased');
    const act = this.sortDataRank(Name,temp_data,'active');
    const tes = this.sortDataRank(Name,temp_data,'tested');
    const ranks: Rank = new Rank(con,act,rec,dec,tes);
    this._serv.setStateRank(ranks);
    
    //navigate to the state page
    this._route.navigate(['Covid/', code]);
  }


  // main graph
  timeSeries()
  {
      const Xlabels = [];

      const confirmYlabels = [];
      const recoverYlabels = [];
      const deceasedYlabels = [];
      const activeYlabels = [];


      this._serv.getTimeSeries().subscribe(res => {
      this.timeSeriesData = res.cases_time_series;

      for (const d in this.timeSeriesData) {
        Xlabels.push(this.timeSeriesData[d].date);
        confirmYlabels.push(parseInt(this.timeSeriesData[d].totalconfirmed));
        recoverYlabels.push(parseInt(this.timeSeriesData[d].totalrecovered));
        deceasedYlabels.push(parseInt(this.timeSeriesData[d].totaldeceased));
        activeYlabels.push(parseInt(this.timeSeriesData[d].totalconfirmed) - (parseInt(this.timeSeriesData[d].totalrecovered) + parseInt(this.timeSeriesData[d].totaldeceased)));
      }

      // X & Y axis data on graph
      const xlablesLen = Xlabels.length / 1.5;
      Xlabels.splice(0, xlablesLen);
      confirmYlabels.splice(0, xlablesLen);
      recoverYlabels.splice(0, xlablesLen);
      deceasedYlabels.splice(0, xlablesLen);
      activeYlabels.splice(0, xlablesLen);

      // Main Dashboard - multiple dataset graph
      Chart.Legend.prototype.afterFit = function() {
        this.height = this.height + 25;
      };

      Chart.defaults.LineWithLine = Chart.defaults.line;
      Chart.controllers.LineWithLine = Chart.controllers.line.extend({
        draw(ease) {
          Chart.controllers.line.prototype.draw.call(this, ease);

          if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
            const activePoint = this.chart.tooltip._active[0],
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


      const NationalData = new Chart('NationalData', {
        type: 'LineWithLine',
        data: {
          labels: Xlabels,
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
          tooltips: {
            enabled: true,
            mode: 'index',
            intersect: false
          },
            scales: {
                yAxes: [{
                  position: 'right',
                  gridLines: {
                    drawOnChartArea: true
                  },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 6
                    }
                }],
                xAxes: [{
                  gridLines: {
                    drawOnChartArea: false
                  },
                  ticks: {
                      autoSkip: true,
                      maxTicksLimit: 10
                  }
                }]
            }
        }
    });


    });
  }


  // top 10 states graph
  topStates(x, y)
  {
      // top 5 states bar graph
        let color, hcolor;

        if (this.selectedRadio == 'confirmed'){
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


        const ds = {
          labels: x,
            datasets: [
              {
                label: ['Top 10 ' + this.selectedRadio.substring(0, 1).toUpperCase() + this.selectedRadio.substring(1) + ' States'],
                data: y,
                backgroundColor: color,
                hoverBackgroundColor : hcolor
            }
        ]
        };

        if (this.TopStates){
          this.TopStates.destroy();
        }

        Chart.Legend.prototype.afterFit = function() {
          this.height = this.height + 25;
        };
        this.TopStates = new Chart('tpStates', {
        type: 'bar',
        data: ds,
        options: {
          tooltips: {
            enabled: true,
          },
            scales: {
                yAxes: [{
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 5
                },
                  gridLines: {
                    drawOnChartArea: true
                  },
                }],
                xAxes: [{
                  ticks:{
                    fontSize: 10
                  },
                  gridLines: {
                    drawOnChartArea: false
                  },
                }]
            }
        }
    });

  }



  // get radio selected value
  topGraph(e)
  {
    this.selectedRadio = e;
    this.topChart(this.data, e);
  }


  // get the top 10 data w.r.t radio button
  topChart(d, radio)
  {
    const sortData: Map<String, number> = new Map<String, number>();
    const values: Array<number> = [];

    for (const e in d)
    {
      if (d[e].total && d[e].total[radio] && e != 'TT')
      {
        sortData.set(e, parseInt(d[e].total[radio]));
      }
    }

    sortData.forEach((value) => {
      values.push(value);
    });

    this.sortedValues = [];
    this.sortedValues = values.sort(function(a, b)
                  {
                      if (a > b) { return 1; }
                      if (a < b) { return -1; }
                      return 0;
                  }).reverse().slice(0, 10);

    const sortArray: Map<String, number> = new Map<String, number>();

    this.sortedValuesStates = [];

    this.sortedValues.forEach(e => {
      let temp;
      temp = getKeybyValue(e);
      this.sortedValuesStates.push(temp);
      sortArray.set(temp, e);
    });

    // console.log(this.sortedValues);  // y-axis dataset
    // console.log(this.sortedValuesStates); // x-axis

    function getKeybyValue(e)
    {
      let temp;
      sortData.forEach((value: number, key: string) => {
        if ( value == e) {
          temp = key;
        }
      });
      return temp;
    }

    this.topStates(this.sortedValuesStates, this.sortedValues);
  }


  // placeholder state name setinterval call func
  placaholderFunc(d)
  {
    let i = 0;
    setInterval(() => {
      if (i < this.placeholder.length)
      {
        this.placeHolderStateName = this._serv.getPipeStateName(d[i]);
        i++;
      }
      else {
        i = 0;
      }
    }, 1200);
  }


}
