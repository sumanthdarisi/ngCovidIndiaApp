import { Component, OnInit } from '@angular/core';
import { MoviesAPIService } from 'src/app/Services/movies-api.service';
import { Movie } from 'src/app/Models/movie';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {
  movies: Movie[];
  constructor(private _serv: MoviesAPIService, private route: Router) { }

  ngOnInit(): void {
    this._serv.GetAllMovies().subscribe(d =>
      (
        this.movies = d
      )
    )
  }

  DeleteMovie(m: Movie)
  {
    this._serv.DeleteMovie(m.MovieID);
    this.route.navigateByUrl("Movies");
  }
}
