import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../Models/movie';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MoviesAPIService {
  private tag;
  private readonly baseurl = "http://localhost:59057/api/Movies/";

  constructor(private _http: HttpClient) { }

  GetAllMovies(): Observable<Movie[]>{
    this.tag = 'GetMovies';
    return this._http.get<Movie[]>(this.baseurl+this.tag);
  }

  GetMovieByID(id: number): Observable<Movie>{
    this.tag = 'GetMovy?'+id;
    return this._http.get<Movie>(this.baseurl+this.tag);
  }

  NewMovie(m: Movie): Observable<Movie>{
    this.tag = 'PostMovy';
    let options = {headers: new HttpHeaders({'content-Type':'application/json'})};
    return this._http.post<Movie>(this.baseurl+this.tag,m,options);
  }

  UpdateMovie(m: Movie): Observable<Movie>{
    this.tag = 'PutMovy/'+m.MovieID;
    let options = {headers: new HttpHeaders({'content-Type':'application/json'})};
    return this._http.put<Movie>(this.baseurl+this.tag,m,options);
  }

  DeleteMovie(id: number){
    this.tag ='DeleteMovy?id='+id;
    console.log(this.baseurl+this.tag);
    return this._http.delete(this.baseurl+this.tag);
  }

}
