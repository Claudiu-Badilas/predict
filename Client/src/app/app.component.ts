import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'HistoricalDataAnalysis';

  data;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    return this.http.get('https://localhost:8080/weatherForecast').subscribe(
      (response) => (this.data = response),
      (err) => console.log(err)
    );
  }
}
