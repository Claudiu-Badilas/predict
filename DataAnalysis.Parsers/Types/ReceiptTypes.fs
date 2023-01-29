namespace DataAnalysis.Types

open System
open CommonTypes

module ReceiptTypes =

    type QuantityType = BUC | KG

    type ParsedProduct = 
        {
            Name: string option
            Price: double option
            Quanty: double option
            QuantityType: QuantityType option
            VAT: double option
        }

    type ParsedReceipt = 
        {
            Identifier: string option
            Date: DateTime option
            TotalPrice: double option
            TotalDiscount: double option
            Currency: CurrencyType option
            ParsedProducts: ParsedProduct option list 
            Provider: Provider option
        }

