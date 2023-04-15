import { Component } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  constructor(private primengConfig: PrimeNGConfig) {}
  display = true;
  ngOnInit() {
    this.primengConfig.ripple = true;
  }
}
