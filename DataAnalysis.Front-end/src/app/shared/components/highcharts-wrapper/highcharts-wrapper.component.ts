import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-highcharts-wrapper',
  templateUrl: `highcharts-wrapper.component.html`,
})
export class HighchartWrapperComponent implements AfterViewInit {
  @Input({ required: true }) chartOptions: Highcharts.Options;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    Highcharts.chart(
      this.el.nativeElement.querySelector('.chart-container'),
      this.chartOptions
    );
  }
}
