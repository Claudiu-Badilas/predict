import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  input,
  Output,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
})
export class DatePickerComponent {
  @Input({ required: true }) selectedDate: string;
  @Input({ required: true }) minDate: string;
  @Input({ required: true }) maxDate: string;
  @Input() label: string;
  @Input() disabled: boolean = false;

  @Output() selectedDateChange = new EventEmitter<string>();

  onDateChange(date: string) {
    this.selectedDateChange.emit(date);
  }

  preventTyping(event: KeyboardEvent | ClipboardEvent) {
    event.preventDefault();
    return false;
  }
}
