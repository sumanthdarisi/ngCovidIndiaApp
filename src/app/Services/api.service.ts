import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { CovidStDt } from '../Models/covid-st-dt';
import { retry, catchError } from 'rxjs/operators';
import { Rank } from '../Models/rank';


@Injectable({
  providedIn: 'root'
})
export class APIService {

  covidData: any;
  timeSeries: any;
  stateCode: any;
  statename: any;
  stateFullName: any;
  _jsonFile = 'assets/IndiaStates.json';
  stateRank: Rank;

  constructor(private _http: HttpClient) { }


  getCovid(): Observable<CovidStDt[]>{
    const _covidurl = 'https://api.covid19india.org/v3/data.json';
    this.covidData = this._http.get<CovidStDt[]>(_covidurl).pipe(
      retry(3),
      catchError(err=>{
        console.log('error',err);
        return throwError(err);
      })
    );
    this._http.get(this._jsonFile).subscribe(res => {
      this.statename = res;
    });
    return this.covidData;
  }

  setCovidData(data: any){
    this.covidData = data;
  }

  getCovidData(){
    if (this.covidData) {
      return this.covidData;
    }
  }

  getStateName(){
    if (this.stateFullName){
      return this.stateFullName;
    }
  }

  getStateCode(){
    if (this.stateCode){
      return this.stateCode;
    }
  }

  getPipeStateName(code: string)
  {
    if (code)
    {
      return this.statename[code];
    }
    else
    {
      return 'NA';
    }
  }


  getPipeStateCode(Name: string){
    if (Name)
    {
      this.stateFullName = Name;
      for (const d in this.statename){
        if (Name == this.statename[d]) {
          this.stateCode  = d;
        return d;
        }
      }
    }
    else{
      return 'NA';
    }


  }


  getTimeSeries(): Observable<any>{
    const _timeSeries = 'https://api.covid19india.org/data.json';
    this.timeSeries = this._http.get<any>(_timeSeries);
    return this.timeSeries;
  }


  getStateTimeSeries(){
    const _basetimeSeries = 'https://api.covid19india.org/v4/timeseries.json';
    return this._http.get(_basetimeSeries);
  }

  setStateRank(e: Rank)
  {
    if(e){
      this.stateRank = e;
    }
  }

  getStateRank()
  {
    return this.stateRank;
  }

}
