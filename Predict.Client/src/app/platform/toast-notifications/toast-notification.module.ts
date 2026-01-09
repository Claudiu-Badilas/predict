import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastNotificationComponent } from './toast/toast-notification.component';
 
@NgModule({
  imports: [CommonModule, ],
  declarations: [ToastNotificationComponent],
  exports: [ToastNotificationComponent],
  providers: [ ],
})
export class ToastNotificationModule {}
