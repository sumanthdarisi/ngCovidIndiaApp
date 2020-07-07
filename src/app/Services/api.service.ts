import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventsModel } from '../events-model';
import { CovidStDt } from '../Models/covid-st-dt';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  private readonly baseurl = "http://localhost:59057/api/Values/";
  data: Array<EventsModel>;
  constructor(private _http: HttpClient) {     }

  getData(): Observable<EventsModel[]>{
    return this._http.get<EventsModel[]>(this.baseurl+"/GetAll");
  }

  getByName(name: string): Observable<EventsModel>{
    return this._http.get<EventsModel>(this.baseurl+"/GetbyName/"+name);
  }

  getAttendees(val: string): Observable<EventsModel[]>{
    return this._http.get<EventsModel[]>(this.baseurl+"/Attendees/"+val); 
  }


  getCovid(): Observable<CovidStDt[]>{
    let _covidurl = "https://api.covid19india.org/v3/data.json";
    this.covidData = this._http.get<CovidStDt[]>(_covidurl);
    return this.covidData;
  }

  covidData: any;
  
  setCovidData(data: any){
    this.covidData = data;
  }

  getCovidData(){
    if(this.covidData)
      return this.covidData;
  }

}
