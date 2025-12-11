import { DateUtils } from 'src/app/shared/utils/date.utils';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent } from '../date-picker/date-picker.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent],
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
})
export class RangeSelectorComponent {
  @Input({ required: true }) startDate: string | null = null;
  @Input({ required: true }) endDate: string | null = null;
  @Input() minDate: string = '2025-12-01';
  @Input() maxDate: string = '2055-12-01';

  @Output() valueChanged = new EventEmitter<{
    startDate: Date;
    endDate: Date;
  }>();

  onStartDateChange(date: string) {
    this.startDate = date;
    this.emitChanges();
  }

  onEndDateChange(date: string) {
    this.endDate = date;
    this.emitChanges();
  }

  emitChanges() {
    this.valueChanged.emit({
      startDate: DateUtils.fromStringToJsDate(this.startDate),
      endDate: DateUtils.fromStringToJsDate(this.endDate),
    });
  }
}
