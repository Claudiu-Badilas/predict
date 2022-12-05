namespace DataAnalysis.Types

open System

module ParsersTypes =

    type CurrencyType = EUR | USD | RON

    type TransactionType = Spend | Received | InternalTransfer | TopUp | Transfer | FEE | CardPayment | ATM | Exchange | Reward | Refund

    type TransactionStatus = Completed | Pending 
    
    type RawParsedTransaction = 
        {
            RegistrationDate: DateTime option
            TransactionDate: DateTime option
            DebitAmount: double option
            CreditAmount: double option
            Description: string option
            TransactionType: TransactionType option
        }
        
    type RawRevolutParsedTransaction = 
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
            TransactionDate: DateTime option
            DebitAmount: double option
            CreditAmount: double option
            Description: string option
            TransactionType: TransactionType option
            CurrencyType: CurrencyType option
        }
        
    type RevolutParsedTransaction = 
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
