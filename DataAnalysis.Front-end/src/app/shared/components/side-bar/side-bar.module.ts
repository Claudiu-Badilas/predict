import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BrowserModule } from '@angular/platform-browser';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ButtonModule } from 'primeng/button';
import * as PrimeNG from 'primeng/sidebar';
import { AccordionModule } from 'primeng/accordion';
@NgModule({
  declarations: [SideBarComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    PrimeNG.SidebarModule,
    ButtonModule,
    AccordionModule,
  ],
  exports: [SideBarComponent],
})
export class SideBarModule {}
