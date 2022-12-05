namespace DataAnalysis.Types

open System

module ParsersTypes =

    type CurrencyType = EUR | USD | RON

    type TransactionType = Spend | Received | InternalTransfer | TopUp | Transfer | FEE | CardPayment | ATM | Exchange | Reward | Refund

    type TransactionStatus = Completed | Pending 
    
    type RawParsedTransaction = 
        {
            RegistrationDate: DateTime option
            CompletionDate: DateTime option
            Amount: double option
            Fee: double option
            Currency: CurrencyType option
            Description: string option
            TransactionType: TransactionType option
            Status: TransactionStatus option
        }

        
    type ParsedTransaction = 
        {
            Id: Guid option
            RegistrationDate: DateTime option
            CompletionDate: DateTime option
            Amount: double option
            Fee: double option
            Currency: CurrencyType option
            Description: string option
            TransactionType: TransactionType option
            Status: TransactionStatus option
        }
