import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';

@NgModule({
  declarations: [SideBarComponent],
  imports: [CommonModule],
  exports: [SideBarComponent],
})
export class SideBarModule {}
