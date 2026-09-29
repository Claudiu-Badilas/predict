using Dapper;
using Microsoft.FSharp.Collections;
using Npgsql;
using Predict.Common.Configuration;
using static Predict.Reader.MortgageLoan.BCR.Types.BCRLoanTypes;

namespace Predict.Repository.LoanRepo;

public sealed class BcrLoanRepository(IEnvironmentConfiguration configuration) : IBcrLoanRepository
{
    private readonly string _connectionString = configuration.GetNpsqlConnectionString();

    public async Task<IReadOnlyList<string>> GetFileNamesAsync()
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        return (await connection.QueryAsync<string>("SELECT file_name FROM loan_document;")).ToList();
    }

    public async Task StoreAsync(IEnumerable<GraficRambursare> loans)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        foreach (var loan in loans)
        {
            var paymentType = loan.IsBasePayment ? "BASE" : loan.IsNormalPayment ? "NORMAL" : "EXTRA";
            var documentId = await connection.ExecuteScalarAsync<int?>(
                "INSERT INTO loan_document (file_name, payment_type, document_date) VALUES (@FileName, @PaymentType, @DocumentDate) ON CONFLICT (file_name) DO NOTHING RETURNING id;",
                new { FileName = loan.Name, PaymentType = paymentType, DocumentDate = loan.Date }, transaction);
            if (documentId is null) continue;

            foreach (var item in loan.MonthlyInstalments)
            {
                await connection.ExecuteAsync("""
                    INSERT INTO loan_instalment
                    (document_id, instalment_id, payment_date, principal_amount, interest_amount, administration_fee,
                     insurance_cost, management_fee, recalculated_interest, total_instalment, remaining_balance)
                    VALUES (@DocumentId, @InstalmentId, @PaymentDate, @PrincipalAmount, @InterestAmount, @AdministrationFee,
                     @InsuranceCost, @ManagementFee, @RecalculatedInterest, @TotalInstalment, @RemainingBalance);
                    """, new
                {
                    DocumentId = documentId.Value,
                    InstalmentId = GetValue(item.InstalmentId),
                    PaymentDate = GetValue(item.PaymentDate),
                    PrincipalAmount = GetValue(item.PrincipalAmount),
                    InterestAmount = GetValue(item.InterestAmount),
                    AdministrationFee = GetValue(item.AdministrationFee),
                    InsuranceCost = GetValue(item.InsuranceCost),
                    ManagementFee = GetValue(item.ManagementFee),
                    RecalculatedInterest = GetValue(item.RecalculatedInterest),
                    TotalInstalment = GetValue(item.TotalInstalment),
                    RemainingBalance = GetValue(item.RemainingBalance)
                }, transaction);
            }
        }
        await transaction.CommitAsync();
    }

    public async Task<List<GraficRambursare>> GetAllAsync()
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        var documents = (await connection.QueryAsync<DocumentRow>("""
            SELECT
                id AS "Id",
                file_name AS "FileName",
                payment_type AS "PaymentType",
                document_date AS "DocumentDate"
            FROM loan_document
            ORDER BY document_date DESC;
            """)).ToList();
        var items = (await connection.QueryAsync<InstalmentRow>("""
            SELECT
                document_id AS "DocumentId",
                instalment_id AS "InstalmentId",
                payment_date AS "PaymentDate",
                principal_amount AS "PrincipalAmount",
                interest_amount AS "InterestAmount",
                administration_fee AS "AdministrationFee",
                insurance_cost AS "InsuranceCost",
                management_fee AS "ManagementFee",
                recalculated_interest AS "RecalculatedInterest",
                total_instalment AS "TotalInstalment",
                remaining_balance AS "RemainingBalance"
            FROM loan_instalment
            ORDER BY id;
            """)).ToLookup(x => x.DocumentId);
        return documents.Select(x => new GraficRambursare(x.FileName, ListModule.OfSeq(items[x.Id].Select(ToInstalment)), x.DocumentDate, x.PaymentType == "BASE", x.PaymentType == "NORMAL", x.PaymentType == "EXTRA")).ToList();
    }

    private static Instalment ToInstalment(InstalmentRow x) => new(x.InstalmentId, x.PaymentDate, x.PrincipalAmount, x.InterestAmount, x.AdministrationFee, x.InsuranceCost, x.ManagementFee, x.RecalculatedInterest, x.TotalInstalment, x.RemainingBalance);
    private static T? GetValue<T>(Microsoft.FSharp.Core.FSharpOption<T> option) where T : struct => option is null ? null : option.Value;
    private sealed record DocumentRow(int Id, string FileName, string PaymentType, DateTime DocumentDate);
    private sealed record InstalmentRow(int DocumentId, int? InstalmentId, DateTime? PaymentDate, double? PrincipalAmount, double? InterestAmount, double? AdministrationFee, double? InsuranceCost, double? ManagementFee, double? RecalculatedInterest, double? TotalInstalment, double? RemainingBalance);
}
