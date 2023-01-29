namespace DataAnalysis.DatabaseAccess.StorerUtils

open System
open DataAnalysis.Types.TransactionTypes
open DataAnalysis.Types.CommonTypes

module StorerUtils =

    let getStatusId status =
        match status with
        | Some status ->
            match status with
            | TransactionStatus.COMPLETED -> Nullable(1)
            | TransactionStatus.PENDING -> Nullable(2)
        | _ -> Nullable()


    let getCurrencyTypeId currency =
        match currency with
        | Some currency ->
            match currency with
            | CurrencyType.EUR -> Nullable(1)
            | CurrencyType.USD -> Nullable(2)
            | CurrencyType.RON -> Nullable(3)
        | _ -> Nullable()
       
       
    let getTransactionProviderId provider =
        match provider with
        | Some provider ->
            match provider with
            | TransactionProvider.RAIFFEISEN -> Nullable(1)
            | TransactionProvider.REVOLUT -> Nullable(2)
            | TransactionProvider.ORANGE_MONEY -> Nullable(3)
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


    let getNullableIntFromOption (value: int option) =
        match value.IsSome with
        | true -> Nullable value.Value
        | _ -> Nullable()


    let getNullableFloatFromOption (value: float option) =
        match value.IsSome with
        | true -> Nullable value.Value
        | _ -> Nullable()

    let getNullableDateTimeFromOption (value: DateTime option) =
        match value.IsSome with
        | true -> Nullable value.Value
        | _ -> Nullable()

