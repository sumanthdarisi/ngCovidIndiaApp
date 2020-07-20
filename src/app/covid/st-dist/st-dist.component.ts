import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/Services/api.service';
import { Router } from '@angular/router';
import { Districts } from 'src/app/Models/districts';
import { States } from 'src/app/Models/states';

@Component({
  selector: 'app-st-dist',
  templateUrl: './st-dist.component.html',
  styleUrls: ['./st-dist.component.css']
})
export class StDistComponent implements OnInit {
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
  dt_SortBy: any = 'Name';
  counter = 0; // even - Descending; odd - ascending
  data: any;

  // search
  SearchWord: any = '';
  SortStatesDup = this.SortDistricts;

  // placeholder
  PlaceholderDtName: any = '';
  placeholder = [];

  constructor(private _serv: APIService, private route: Router) { }

  ngOnInit(): void {
    this.data = this._serv.getCovidData();
    if (!this.data) {
      this.route.navigateByUrl('/Covid');
    }


    // this.PlaceholderDtName = this.
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
        act  = (con == 'NA' || rec == 'NA' || dec == 'NA') ? 'NA' :  (con - (rec + dec));

        this.SortDistricts.push(new Districts(name, pop, con, dec, tes, rec, act, d_con, d_act, d_rec, d_dec, d_tes));
      }
    }

    // placeholder
    for (const d in this.data.districts)
    {
      if (this.data.districts[d].meta && this.data.districts[d].total){
        this.placeholder.push(d);
      }
    }

    this.placaholderFunc(this.placeholder);


    this.initialize();
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

    this.districtData = [
      { Name: 'Confirmed Cases', number: this.st_confirmed, class: 'fill cl_con', del: this.delta_confirmed, del_style: 'delta_tot del_con', icon: 'fa fa-plus-square' },
      { Name: 'Active Cases', number: this.st_Active, class: 'fill cl_act', del: this.delta_active, del_style: 'delta_tot del_act', icon: 'fa fa-heartbeat'},
      { Name: 'Recovered Cases', number: this.st_recovered, class: 'fill cl_rec', del: this.delta_recovered, del_style: 'delta_tot del_rec', icon: 'fa fa-check-circle' },
      { Name: 'Deceased Cases', number: this.st_deceased, class: 'fill cl_dec', del: this.delta_deceased, del_style: 'delta_tot del_dec', icon: 'fa fa-minus-circle' },
      { Name: 'Total Tested', number: this.st_tested, class: 'fill cl_tes', del: this.delta_tested, del_style: 'delta_tot del_tes', icon: 'fa fa-flask'}
    ];

  }

  searchWord(e){
    let temp: Districts[] = [];
    if (e.length == 0){
      this.SortDistricts = this.SortStatesDup;
    }
    else{
      temp = [];
      this.SortStatesDup.forEach(element => {
        if (element.dt_name.toLowerCase().includes(e.toLowerCase()))
        {
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
        this.SortDistricts.sort(function(a, b) {
          if (a.dt_name  > b.dt_name) { return -1; }
          if (a.dt_name < b.dt_name) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function(a, b) {
          if (a.dt_name > b.dt_name) { return -1; }
          if (a.dt_name < b.dt_name) { return 1; }
          else { return 0; }
        }).reverse();
        this.counter++;
      }
    }

    if (sortBy == 'Population')
    {
      this.dt_SortBy = sortBy;
      if (this.counter % 2 != 0) {
        this.SortDistricts.sort(function(a, b) {
          a.dt_population = (a.dt_population.toString() == 'NA') ? -1.5 : a.dt_population;
          b.dt_population = (b.dt_population.toString() == 'NA') ? -1.5 : b.dt_population;
          if (a.dt_population > b.dt_population) { return -1; }
          if (a.dt_population < b.dt_population) { return 1; }
            else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function(a, b) {
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
        this.SortDistricts.sort(function(a, b) {
          a.dt_confirmed = (a.dt_confirmed.toString() == 'NA') ? -1.5 : a.dt_confirmed;
          b.dt_confirmed = (b.dt_confirmed.toString() == 'NA') ? -1.5 : b.dt_confirmed;
          if (a.dt_confirmed > b.dt_confirmed) { return -1; }
          if (a.dt_confirmed < b.dt_confirmed) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function(a, b) {
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
        this.SortDistricts.sort(function(a, b) {
          a.dt_active = (a.dt_active.toString() == 'NA') ? -1.5 : a.dt_active;
          b.dt_active = (b.dt_active.toString() == 'NA') ? -1.5 : b.dt_active;
          if (a.dt_active > b.dt_active) { return -1; }
          if (a.dt_active < b.dt_active) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function(a, b) {
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
        this.SortDistricts.sort(function(a, b) {
          a.dt_recoverd = (a.dt_recoverd.toString() == 'NA') ? -1.5 : a.dt_recoverd;
          b.dt_recoverd = (b.dt_recoverd.toString() == 'NA') ? -1.5 : b.dt_recoverd;
          if (a.dt_recoverd > b.dt_recoverd) { return -1; }
          if (a.dt_recoverd < b.dt_recoverd) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function(a, b) {
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
        this.SortDistricts.sort(function(a, b) {
          a.dt_deceased = (a.dt_deceased.toString() == 'NA') ? -1.5 : a.dt_deceased;
          b.dt_deceased = (b.dt_deceased.toString() == 'NA') ? -1.5 : b.dt_deceased;
          if (a.dt_deceased > b.dt_deceased) { return -1; }
          if (a.dt_deceased < b.dt_deceased) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function(a, b) {
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
        this.SortDistricts.sort(function(a, b) {
          a.dt_tested = (a.dt_tested.toString() == 'NA') ? -1.5 : a.dt_tested;
          b.dt_tested = (b.dt_tested.toString() == 'NA') ? -1.5 : b.dt_tested;
          if (a.dt_tested > b.dt_tested) { return -1; }
          if (a.dt_tested < b.dt_tested) { return 1; }
          else { return 0; }
        });
        this.counter++;
      }
      else {
        this.SortDistricts.sort(function(a, b) {
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



  placaholderFunc(d)
  {
    let i = 0;
    setInterval(() => {
      if (i < this.placeholder.length)
      {
        this.PlaceholderDtName = d[i];
        i++;
      }
      else {
        i = 0;
      }
    }, 1000);
  }
}
