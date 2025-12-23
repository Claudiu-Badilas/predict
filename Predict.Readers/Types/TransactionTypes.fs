namespace Predict.Types

open System
open CommonTypes

module TransactionTypes =

    type TransactionType = 
          SPEND 
        | RECEIVED 
        | INTERNAL_TRANSFER 
        | TOP_UP 
        | TRANSFER 
        | FEE 
        | CARD_PAYMENT 
        | ATM 
        | EXCHANGE 
        | REWARD 
        | REFUND 
        | BILL_PAYMENT
        | BALANCE_CHECK
        | UNDEFINED
    
            
    type ParsedTransaction = 
        {
            Identifier: string option
            RegistrationDate: DateTime option
            CompletionDate: DateTime option
            Amount: double option
            Fee: double option
            Description: string option
            Currency: CurrencyType option
            TransactionType: TransactionType option
            Provider: Provider option
            ReferenceId: int option
        }
