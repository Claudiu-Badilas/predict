import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { NumberFormatPipe } from '../../pipes/number-format.pipe';
import { HeaderCardInput } from './models/header-card-input.model';

@Component({
  selector: 'app-header-card',
  imports: [NgClass, NumberFormatPipe],
  templateUrl: './header-card.component.html',
  styleUrl: './header-card.component.scss',
})
export class HeaderCardComponent {
  headerCardInputs = input.required<HeaderCardInput[]>();

  isNumber(value: string | number): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
  }
}
