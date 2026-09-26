import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'p-toggle-button',
  imports: [NgClass],
  templateUrl: './toggle-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './toggle-button.component.scss',
})
export class ToggleButtonComponent {
  private readonly themeService = inject(ThemeService);

  @Input({ required: true }) options: { label: string; iconPath?: string }[] =
    [];
  @Input() set selected(value: string | null) {
    this._selected.set(!!value ? value : this.options[0].label);
  }
  @Input() gradient: { primaryColor: string; secondaryColor: string };
  @Output() selectionChange = new EventEmitter<string>();

  _selected = signal<string | null>(null);

  select(option: string) {
    this._selected.set(option);
    this.selectionChange.emit(option);
  }

  getThemeIconPath(iconPath: string): string {
    const theme = this.themeService.theme();
    return iconPath.replace(/\/icons\//i, `/icons/${theme}/`);
  }

  get gradientStyle(): string {
    return `linear-gradient(135deg, ${this.gradient?.primaryColor ?? '#c61a54'}, ${this.gradient?.secondaryColor ?? '#d5a326'})`;
  }
}
