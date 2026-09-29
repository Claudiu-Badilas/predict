using FluentMigrator;

namespace Predict.Configuration.Migrations;

[Migration(202609290001)]
public class AddLoanTables_202609290001 : Migration
{
    public override void Up() => Execute.Sql(@"
        CREATE TABLE IF NOT EXISTS loan_document (
            id SERIAL PRIMARY KEY,
            file_name TEXT NOT NULL UNIQUE,
            payment_type TEXT NOT NULL,
            document_date TIMESTAMP NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS loan_instalment (
            id SERIAL PRIMARY KEY,
            document_id INT NOT NULL REFERENCES loan_document(id) ON DELETE CASCADE,
            instalment_id INT NULL,
            payment_date TIMESTAMP NULL,
            principal_amount DOUBLE PRECISION NULL,
            interest_amount DOUBLE PRECISION NULL,
            administration_fee DOUBLE PRECISION NULL,
            insurance_cost DOUBLE PRECISION NULL,
            management_fee DOUBLE PRECISION NULL,
            recalculated_interest DOUBLE PRECISION NULL,
            total_instalment DOUBLE PRECISION NULL,
            remaining_balance DOUBLE PRECISION NULL
        );
        CREATE INDEX IF NOT EXISTS ix_loan_instalment_document_id ON loan_instalment(document_id);");

    public override void Down()
    {
        Execute.Sql("DROP TABLE IF EXISTS loan_instalment;");
        Execute.Sql("DROP TABLE IF EXISTS loan_document;");
    }
}
