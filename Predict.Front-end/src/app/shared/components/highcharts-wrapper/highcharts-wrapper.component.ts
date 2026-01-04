import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-highcharts-wrapper',
  templateUrl: `highcharts-wrapper.component.html`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighchartWrapperComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) chartOptions: Highcharts.Options;

  constructor(private el: ElementRef) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.ngAfterViewInit();
  }

  ngAfterViewInit(): void {
    Highcharts.chart(this.el.nativeElement.querySelector('.chart-container'), {
      ...this.chartOptions,
      credits: { enabled: false },
    });
  }
}
