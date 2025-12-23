namespace Predict.Types

open System
open CommonTypes

module ReceiptTypes =

    type QuantityType = BUC | KG

    type ParsedPurchasedProduct = 
        {
            Name: string option
            Price: double option
            Quantity: double option
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
            ParsedProducts: ParsedPurchasedProduct option list 
            Provider: Provider option
        }

