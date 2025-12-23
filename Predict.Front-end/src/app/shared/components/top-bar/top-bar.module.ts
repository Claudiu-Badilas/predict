import { NgModule } from '@angular/core';
import { TopBarComponent } from './top-bar.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TopBarComponent],
  imports: [CommonModule, NgbDropdownModule],
  exports: [TopBarComponent],
  providers: [],
})
export class TopBarModule {}
