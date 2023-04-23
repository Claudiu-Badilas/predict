import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  isFullSize = true;

  toggleSidebar() {
    this.isFullSize = !this.isFullSize;
  }
}
