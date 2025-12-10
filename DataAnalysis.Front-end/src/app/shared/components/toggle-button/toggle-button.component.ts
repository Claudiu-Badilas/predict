import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss',
})
export class ToggleButtonComponent {
  @Input({ required: true }) options: string[] = [];
  @Input() set selected(value: string | null) {
    this._selected.set(!!value ? value : this.options[0]);
  }

  @Output() selectionChange = new EventEmitter<string>();

  _selected = signal<string | null>(null);

  select(option: string) {
    this._selected.set(option);
    this.selectionChange.emit(option);
    console.log('🚀 ~ ToggleButtonComponent ~ select ~ option:', option);
  }
}
