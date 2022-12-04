namespace DataAnalysis.Types

open System

module ParsersTypes =

    type TransactionType = Spend | Received | InternalTransfer
    
    type RawParsedTransaction = 
        {
            RegistrationDate: DateTime option
            TransactionDate: DateTime option
            DebitAmount: double option
            CreditAmount: double option
            Description: string option
            TransactionType: TransactionType option
        }

    type ParsedTransaction = 
        {
            Id: Guid option
            RegistrationDate: DateTime option
            TransactionDate: DateTime option
            DebitAmount: double option
            CreditAmount: double option
            Description: string option
            TransactionType: TransactionType option
        }
