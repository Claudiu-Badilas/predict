import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { TransactionService } from './modules/transaction-module/services/transaction.service';
import { TransactionModule } from './modules/transaction-module/transaction.module';
import { AppRouting } from './app.routing';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRouting,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    TransactionModule,
  ],
  bootstrap: [AppComponent],
  providers: [TransactionService],
})
export class AppModule {}
