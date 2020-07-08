import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CovidStDt } from '../Models/covid-st-dt';


@Injectable({
  providedIn: 'root'
})
export class APIService {
  
  covidData: any;
  stateCode: any;
  statename: any;
  _jsonFile = "assets/IndiaStates.json";

  
  
  constructor(private _http: HttpClient) {  

  }


  getCovid(): Observable<CovidStDt[]>{
    let _covidurl = "https://api.covid19india.org/v3/data.json";
    this.covidData = this._http.get<CovidStDt[]>(_covidurl);
    this._http.get(this._jsonFile).subscribe(res=>{
      this.statename = res;
    });
    return this.covidData;
  }
  
  setCovidData(data: any, code: any){
    this.covidData = data;
    this.stateCode = code;
  }

  getCovidData(){
    if(this.covidData)
      return this.covidData;
  }

  getStateName(){
    if(this.statename){
      return this.statename[this.stateCode];
    }

  }




}
