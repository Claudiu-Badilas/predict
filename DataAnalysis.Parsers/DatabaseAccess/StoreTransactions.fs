namespace DataAnalysis.DatabaseAccess

open System
open DataAnalysis.Repository.Repositories
open DataAnalysis.Repository.Models
open DataAnalysis.Types.TransactionTypes
open DataAnalysis.DatabaseAccess.StorerUtils

module StoreTransactions =
    
    let filterDublicates (storedTransactionIds: string list) (transactions: Transaction list) =
        transactions
        |> List.filter(fun t -> not (storedTransactionIds |> List.exists(fun st -> t.Identifier = st)))
        

    let getTransactionTypeId transactionType =
        match transactionType with
        | Some transactionType ->
            match transactionType with
            | TransactionType.SPEND -> Nullable(1)
            | TransactionType.RECEIVED -> Nullable(2)
            | TransactionType.INTERNAL_TRANSFER -> Nullable(3)
            | TransactionType.TOP_UP -> Nullable(4)
            | TransactionType.TRANSFER -> Nullable(5)
            | TransactionType.FEE -> Nullable(6)
            | TransactionType.CARD_PAYMENT -> Nullable(7)
            | TransactionType.ATM -> Nullable(8)
            | TransactionType.EXCHANGE -> Nullable(9)
            | TransactionType.REWARD -> Nullable(10)
            | TransactionType.REFUND -> Nullable(11)
            | TransactionType.BILL_PAYMENT -> Nullable(12)
            | TransactionType.BALANCE_CHECK -> Nullable(13)
            | TransactionType.UNDEFINED -> Nullable(14)
        | _ -> Nullable()
    
    let storeTransaction dataOwnerId (parsedTransactions: ParsedTransaction list) =
        let transactionRepo = new TransactionRepo()
        let transactions = 
            parsedTransactions
            |> List.map(fun t ->
                new Transaction (
                    Identifier = t.Identifier.Value,
                    RegistrationDate = StorerUtils.getNullableDateTimeFromOption t.RegistrationDate,
                    CompletionDate = StorerUtils.getNullableDateTimeFromOption t.CompletionDate,
                    ReferenceId = StorerUtils.getNullableIntFromOption t.ReferenceId,
                    Amount = StorerUtils.getNullableFloatFromOption t.Amount,
                    Fee = StorerUtils.getNullableFloatFromOption t.Fee,
                    Description = t.Description.Value,
                    CurrencyId = StorerUtils.getCurrencyTypeId t.Currency,
                    TransactionTypeId = getTransactionTypeId t.TransactionType,
                    ProviderId = StorerUtils.getTransactionProviderId t.Provider,
                    DataOwnerId = dataOwnerId
                )
            )
        printfn "Total parsed transactions -> %i" transactions.Length
        if not transactions.IsEmpty then
            let providerId = transactions[0].ProviderId.Value
            let storedTransactionIds = 
                transactionRepo.GetTransactionIds(dataOwnerId, providerId)    
                |> Async.AwaitTask
                |> Async.RunSynchronously
                |> Seq.toList
            printfn "Total transactions from db -> %i for provider -> %i" storedTransactionIds.Length providerId

            let filteredTransactions = filterDublicates storedTransactionIds transactions
            printfn "Total transactions for storing -> %i" filteredTransactions.Length
            if not filteredTransactions.IsEmpty then
                transactionRepo.StoreTransactions(filteredTransactions)
                |> Async.AwaitTask
                |> Async.RunSynchronously
            else
                printfn "No transactions for storing"
                0
        else 
            printfn "No parsed transactions"
            0
        

