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
        

    let getStatusId status =
        match status with
        | Some status ->
            match status with
            | TransactionStatus.COMPLETED -> Nullable(1)
            | TransactionStatus.PENDING -> Nullable(2)
        | _ -> Nullable()
        

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
    
    let storeTransaction userId (parsedTransactions: ParsedTransaction list) =
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
                    StatusId = getStatusId t.Status,
                    CurrencyId = StorerUtils.getCurrencyTypeId t.Currency,
                    TransactionTypeId = getTransactionTypeId t.TransactionType,
                    ProviderId = StorerUtils.getTransactionProviderId t.Provider,
                    UserId = Nullable userId
                )
            )

        let storedTransactionIds = 
            transactionRepo.GetTransactionIds(userId).Result
            |> Seq.toList

        let filteredTransactions = filterDublicates storedTransactionIds transactions
        let storingResp = transactionRepo.StoreTransactions(filteredTransactions)
        storingResp.Result

        

