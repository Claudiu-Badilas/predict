import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastNotificationComponent } from './toast/toast-notification.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@NgModule({
  imports: [CommonModule, ToastModule],
  declarations: [ToastNotificationComponent],
  exports: [ToastNotificationComponent],
  providers: [MessageService],
})
export class ToastNotificationModule {}
