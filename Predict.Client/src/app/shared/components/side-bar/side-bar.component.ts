import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TripleClickDirective } from '../../directives/triple-click.directive';

@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss'],
  imports: [CommonModule, TripleClickDirective],
})
export class SideBarComponent {
  isFullSize = true;

  toggleSidebar() {
    this.isFullSize = !this.isFullSize;
  }
}
