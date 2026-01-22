import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberFormat' })
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string, digits: number = 2): string {
    return numberFormat(value, digits);
  }
}

export function numberFormat(value: number | string, digits: number = 2) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = Number(value);
  if (isNaN(num)) return '-';

  const fixed = num.toFixed(digits);

  const [integerPart, decimalPart] = fixed.split('.');

  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt;
}
