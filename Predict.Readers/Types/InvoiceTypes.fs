namespace Predict.Types

open System

module InvoiceTypes =    

    type Invoice = 
        {
            InvoiceType: string option
            Provider: string option
            Date: DateTime option
            Index: double option
            Amount: double option
            Type: string option
            Action: string option
        }

    type LocationInvoice = 
        {
            Address: string option
            Invoices: Invoice list
        }
