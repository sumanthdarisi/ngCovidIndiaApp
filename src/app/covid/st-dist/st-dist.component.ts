import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/Services/api.service';
import { Router } from '@angular/router';
import { Districts } from 'src/app/Models/districts';

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

  //sort elements
  SortDistricts: Array<Districts> = [];
  dt_SortBy : any = 'Name';
  counter: number = 0; //even - Descending; odd - ascending
  data: any;

  constructor(private _serv: APIService, private route: Router) { }

  ngOnInit(): void {
    this.data = this._serv.getCovidData();
    if (!this.data) {
      this.route.navigateByUrl("/Covid"); 
    } 
  
    if(this.dt_SortBy)
      this.dt_sort(this.dt_SortBy)

    this.stateName = this._serv.getStateName();

    for(let e in this.data.districts) 
    {
      if(this.data.districts[e]['meta']){
        let name = (e) ? e : "NA";
        let pop = (this.data.districts[e]['meta']['population']) ? this.data.districts[e]['meta']['population'] : "NA";
        let con = (this.data.districts[e]['total'] && this.data.districts[e]['total']['confirmed']) ? this.data.districts[e]['total']['confirmed'] : "NA";
        let dec = (this.data.districts[e]['total'] && this.data.districts[e]['total']['deceased']) ? this.data.districts[e]['total']['deceased'] : "NA";
        let tes = (this.data.districts[e]['total'] && this.data.districts[e]['total']['tested']) ? this.data.districts[e]['total']['tested'] : "NA";
        let rec = (this.data.districts[e]['total'] && this.data.districts[e]['total']['recovered']) ? this.data.districts[e]['total']['recovered'] : "NA";

      this.SortDistricts.push(new Districts(name, pop, con, dec, tes, rec));
      }
    }
    
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

    if(this.data['delta'])
    {
      if(this.data['delta']['confirmed'])
        this.delta_confirmed = this.data['delta']['confirmed'];

      if(this.data['delta']['recovered'] )
        this.delta_recovered = this.data['delta']['recovered'];
    
      if(this.data['delta']['deceased'] )
        this.delta_deceased = this.data['delta']['deceased']
    
      if(this.data['delta']['tested'])
        this.delta_tested = this.data['delta']['tested'];

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

  dt_sort(sortBy)
  {
    console.log(sortBy);
    
    //console.log(this.counter);
    
    if(sortBy == 'Name')
    {
      console.log('success');
      this.dt_SortBy = sortBy;
      
      if(this.counter%2!=0){
        this.SortDistricts.sort(function(a,b){
          if (a.dt_name > b.dt_name) return -1;
          if (a.dt_name < b.dt_name) return 1;
          else return 0
        });
        this.counter++;
      }
      else{
        this.SortDistricts.sort(function(a,b){
          if (a.dt_name > b.dt_name) return -1;
          if (a.dt_name < b.dt_name) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if(sortBy == 'Population')
    {
      this.dt_SortBy = sortBy;
      if(this.counter%2!=0){
      this.SortDistricts.sort(function(a,b){
        if (a.dt_population > b.dt_population) return -1;
        if (a.dt_population < b.dt_population) return 1;
        else return 0
      });
      this.counter++;
      }
      else{
        this.SortDistricts.sort(function(a,b){
          if (a.dt_population > b.dt_population) return -1;
          if (a.dt_population < b.dt_population) return 1;
          else return 0
        }).reverse();
        this.counter++;
        }
      }

    if(sortBy == 'Confirmed')
    {
      this.dt_SortBy = sortBy;
      if(this.counter%2!=0){
      this.SortDistricts.sort(function(a,b){
        if (a.dt_confirmed > b.dt_confirmed) return -1;
        if (a.dt_confirmed < b.dt_confirmed) return 1;
        else return 0
      });
      this.counter++;
      }
      else{
        this.SortDistricts.sort(function(a,b){
          if (a.dt_confirmed > b.dt_confirmed) return -1;
          if (a.dt_confirmed < b.dt_confirmed) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if(sortBy == 'Recovered')
    {
      this.dt_SortBy = sortBy;
      if(this.counter%2!=0){
      this.SortDistricts.sort(function(a,b){
        if (a.dt_recoverd > b.dt_recoverd) return -1;
        if (a.dt_recoverd < b.dt_recoverd) return 1;
        else return 0
      });
      this.counter++;
      }
      else{
        this.SortDistricts.sort(function(a,b){
          if (a.dt_recoverd > b.dt_recoverd) return -1;
          if (a.dt_recoverd < b.dt_recoverd) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if(sortBy == 'Deceased')
    {
      this.dt_SortBy = sortBy;
      if(this.counter%2!=0){
      this.SortDistricts.sort(function(a,b){
        if (a.dt_deceased > b.dt_deceased) return -1;
        if (a.dt_deceased < b.dt_deceased) return 1;
        else return 0
      });
      this.counter++;
      }
      else{
        this.SortDistricts.sort(function(a,b){
          if (a.dt_deceased > b.dt_deceased) return -1;
          if (a.dt_deceased < b.dt_deceased) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }

    if(sortBy == 'Tested')
    {
      this.dt_SortBy = sortBy;
      if(this.counter%2!=0){
      this.SortDistricts.sort(function(a,b){
        if (a.dt_tested > b.dt_tested) return -1;
        if (a.dt_tested < b.dt_tested) return 1;
        else return 0
      });
      this.counter++;
      }
      else{
        this.SortDistricts.sort(function(a,b){
          if (a.dt_tested > b.dt_tested) return -1;
          if (a.dt_tested < b.dt_tested) return 1;
          else return 0
        }).reverse();
        this.counter++;
      }
    }
  }
}
