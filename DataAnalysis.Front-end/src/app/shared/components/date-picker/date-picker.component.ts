import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  HostListener,
  OnInit,
  OnChanges,
  SimpleChanges,
  Inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

class DatepickerService {
  private openDatepickers: Set<string> = new Set();
  private closeCallbacks: Map<string, () => void> = new Map();

  registerDatepicker(id: string, closeCallback: () => void) {
    this.closeCallbacks.set(id, closeCallback);
  }

  unregisterDatepicker(id: string) {
    this.closeCallbacks.delete(id);
    this.openDatepickers.delete(id);
  }

  openDatepicker(id: string) {
    // Close all other open datepickers
    this.openDatepickers.forEach((openId) => {
      if (openId !== id && this.closeCallbacks.has(openId)) {
        this.closeCallbacks.get(openId)!();
      }
    });

    this.openDatepickers.add(id);
  }

  closeDatepicker(id: string) {
    this.openDatepickers.delete(id);
  }

  isDatepickerOpen(id: string): boolean {
    return this.openDatepickers.has(id);
  }
}

// Global instance of the service
const datepickerService = new DatepickerService();

@Component({
  selector: 'date-picker',
  imports: [CommonModule, FormsModule],
  templateUrl: `./date-picker.component.html`,
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() initialDate: Date | null = null;
  @Input() datepickerId: string = `datepicker-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  @Input() openSide: 'left' | 'right' = 'left';

  @Output() dateChange = new EventEmitter<Date>();

  open = signal(false);
  selectedDate = signal<Date | null>(null);

  // Current view
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth();

  today = new Date();

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  monthShortNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.initializeDate();
    datepickerService.registerDatepicker(this.datepickerId, () => {
      this.closeCalendar();
    });
  }

  ngOnDestroy() {
    datepickerService.unregisterDatepicker(this.datepickerId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['minDate'] || changes['maxDate'] || changes['initialDate']) {
      this.initializeDate();
    }
  }

  private initializeDate() {
    let initial: Date;

    if (this.initialDate) {
      initial = new Date(this.initialDate);
    } else {
      initial = new Date();
    }

    if (this.minDate && initial < this.minDate) {
      initial = new Date(this.minDate);
    }
    if (this.maxDate && initial > this.maxDate) {
      initial = new Date(this.maxDate);
    }

    this.selectedDate.set(initial);
    this.selectedYear = initial.getFullYear();
    this.selectedMonth = initial.getMonth();
  }

  get selectedDateValue(): string {
    const d = this.selectedDate();
    if (!d) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Available years based on min/max
  availableYears(): number[] {
    const minYear = this.minDate
      ? this.minDate.getFullYear()
      : this.today.getFullYear() - 10;
    const maxYear = this.maxDate
      ? this.maxDate.getFullYear()
      : this.today.getFullYear() + 10;

    const years = [];
    for (let year = minYear; year <= maxYear; year++) {
      years.push(year);
    }
    return years;
  }

  // Available months for current year
  availableMonths(): number[] {
    const currentYear = this.selectedYear;
    const months = [];

    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);

      // Check if month is within min/max range
      if (
        this.minDate &&
        date < this.minDate &&
        (date.getFullYear() < this.minDate.getFullYear() ||
          date.getMonth() < this.minDate.getMonth())
      ) {
        continue;
      }

      if (
        this.maxDate &&
        date > this.maxDate &&
        (date.getFullYear() > this.maxDate.getFullYear() ||
          date.getMonth() > this.maxDate.getMonth())
      ) {
        continue;
      }

      months.push(month);
    }

    return months.length > 0 ? months : [this.selectedMonth];
  }

  onYearMonthChange() {
    // Ensure selected month is available for the year
    const availableMonths = this.availableMonths();
    if (!availableMonths.includes(this.selectedMonth)) {
      this.selectedMonth = availableMonths[0] || 0;
    }
  }

  getEmptyDays(): number[] {
    const firstDay = new Date(
      this.selectedYear,
      this.selectedMonth,
      1
    ).getDay();
    return Array(firstDay).fill(0);
  }

  daysInMonth(): number[] {
    const days = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }

  isSelected(day: number): boolean {
    const d = this.selectedDate();
    if (!d) return false;

    return (
      d.getDate() === day &&
      d.getMonth() === this.selectedMonth &&
      d.getFullYear() === this.selectedYear
    );
  }

  isToday(day: number): boolean {
    return (
      day === this.today.getDate() &&
      this.selectedMonth === this.today.getMonth() &&
      this.selectedYear === this.today.getFullYear()
    );
  }

  isDisabled(day: number): boolean {
    const date = new Date(this.selectedYear, this.selectedMonth, day);

    if (this.minDate && date < this.minDate) {
      return true;
    }

    if (this.maxDate && date > this.maxDate) {
      return true;
    }

    return false;
  }

  selectDate(day: number) {
    if (this.isDisabled(day)) {
      return;
    }

    const date = new Date(this.selectedYear, this.selectedMonth, day);
    date.setHours(0, 0, 0, 0);

    this.selectedDate.set(date);
    this.dateChange.emit(date);
    this.closeCalendar();
  }

  setToMinDate() {
    if (!this.minDate) return;

    const minDate = new Date(this.minDate);
    minDate.setHours(0, 0, 0, 0);

    this.selectedDate.set(minDate);
    this.selectedYear = minDate.getFullYear();
    this.selectedMonth = minDate.getMonth();

    this.dateChange.emit(minDate);
  }

  setToMaxDate() {
    if (!this.maxDate) return;

    const maxDate = new Date(this.maxDate);
    maxDate.setHours(0, 0, 0, 0);

    this.selectedDate.set(maxDate);
    this.selectedYear = maxDate.getFullYear();
    this.selectedMonth = maxDate.getMonth();

    this.dateChange.emit(maxDate);
  }

  canGoPrev(): boolean {
    const prevMonth = this.selectedMonth === 0 ? 11 : this.selectedMonth - 1;
    const prevYear =
      this.selectedMonth === 0 ? this.selectedYear - 1 : this.selectedYear;

    // Check if we can navigate to previous month based on min date
    if (this.minDate) {
      const prevDate = new Date(prevYear, prevMonth, 1);
      return prevDate >= this.minDate;
    }

    return true;
  }

  canGoNext(): boolean {
    const nextMonth = this.selectedMonth === 11 ? 0 : this.selectedMonth + 1;
    const nextYear =
      this.selectedMonth === 11 ? this.selectedYear + 1 : this.selectedYear;

    // Check if we can navigate to next month based on max date
    if (this.maxDate) {
      const nextDate = new Date(nextYear, nextMonth, 1);
      return nextDate <= this.maxDate;
    }

    return true;
  }

  prevMonth() {
    if (!this.canGoPrev()) return;

    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }

    // Ensure month is in available months
    this.onYearMonthChange();
  }

  nextMonth() {
    if (!this.canGoNext()) return;

    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }

    // Ensure month is in available months
    this.onYearMonthChange();
  }

  getDayTitle(day: number): string {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDate(date: Date): string {
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  }

  toggle() {
    if (this.open()) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  openCalendar() {
    // Notify service to close other datepickers
    datepickerService.openDatepicker(this.datepickerId);
    this.open.set(true);
  }

  closeCalendar() {
    this.open.set(false);
    datepickerService.closeDatepicker(this.datepickerId);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.datepicker') && this.open()) {
      this.closeCalendar();
    }
  }
}
