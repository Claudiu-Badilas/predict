namespace Predict.Types

open System

module InvoiceTypes =    

    type Invoice = 
        {
            Type: string option
            Provider: string option
            Date: DateTime option
            Index: double option
            Amount: double option
        }

    type LocationInvoice = 
        {
            Address: string option
            Invoices: Invoice list
        }
