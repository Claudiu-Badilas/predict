import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-search-input',
  imports: [CommonModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent {
  @Output() search = new EventEmitter<string>();

  query = signal('');
  private debounceTimer: any;

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.search.emit(this.query());
    }, 500);
  }

  clear() {
    this.query.set('');
    this.search.emit('');
  }
}
