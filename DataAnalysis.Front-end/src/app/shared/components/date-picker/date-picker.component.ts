import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  imports: [CommonModule, FormsModule, NgbModule],
})
export class DatePickerComponent {
  selectedDate: string | null = '2025-12-08'; // will hold the picked date
  minDate = '2025-12-01';
  maxDate = '2055-12-31';

  onDateChange(newDate: string) {
    // emit value
  }

  preventTyping(event: KeyboardEvent | ClipboardEvent) {
    event.preventDefault();
    return false;
  }
}
