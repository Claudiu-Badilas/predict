import { AuthenticationService } from './platform/services/authentication.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { TransactionService } from './modules/transaction-module/services/transaction.service';
import { TransactionModule } from './modules/transaction-module/transaction.module';
import { AppRouting } from './app.routing';
import { AuthenticationModule } from './platform/authentication/authentication.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRouting,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    TransactionModule,
    AuthenticationModule,
  ],
  bootstrap: [AppComponent],
  providers: [TransactionService, AuthenticationService],
})
export class AppModule {}
