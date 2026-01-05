using FluentMigrator;

namespace Predict.Configuration.Migrations;


[Migration(202304150002)]
public class InitialTransactionTables_202304150002 : Migration
{
    public override void Up()
    {
        Create.Table("provider")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("name").AsString(100).NotNullable().Unique();

        Insert.IntoTable("provider")
            .Row(new { name = "RAIFFEISEN" })
            .Row(new { name = "REVOLUT" })
            .Row(new { name = "ORANGE_MONEY" })
            .Row(new { name = "CARREFOUR" })
            .Row(new { name = "KAUFLAND" });

        Create.Table("currency")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("code").AsString(10).NotNullable().Unique();

        Insert.IntoTable("currency")
            .Row(new { code = "EUR" })
            .Row(new { code = "USD" })
            .Row(new { code = "RON" });

        Create.Table("transaction_type")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("type").AsString(50).NotNullable().Unique();

        Insert.IntoTable("transaction_type")
            .Row(new { type = "SPEND" })
            .Row(new { type = "RECEIVED" })
            .Row(new { type = "INTERNAL_TRANSFER" })
            .Row(new { type = "TOP_UP" })
            .Row(new { type = "TRANSFER" })
            .Row(new { type = "FEE" })
            .Row(new { type = "CARD_PAYMENT" })
            .Row(new { type = "ATM" })
            .Row(new { type = "EXCHANGE" })
            .Row(new { type = "REWARD" })
            .Row(new { type = "REFUND" })
            .Row(new { type = "BILL_PAYMENT" })
            .Row(new { type = "BALANCE_CHECK" })
            .Row(new { type = "UNDEFINED" });

        Create.Table("transactions")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("identifier").AsString(100).NotNullable().Unique()
            .WithColumn("registration_date").AsDateTime().Nullable()
            .WithColumn("completion_date").AsDateTime().Nullable()
            .WithColumn("amount").AsDecimal(18, 2).Nullable()
            .WithColumn("fee").AsDecimal(18, 2).Nullable()
            .WithColumn("description").AsString(500).Nullable()
            .WithColumn("reference_id").AsInt32().Nullable()
            .WithColumn("provider_id").AsInt32().NotNullable()
            .WithColumn("currency_id").AsInt32().NotNullable()
            .WithColumn("transaction_type_id").AsInt32().NotNullable()
            .WithColumn("data_owner_id").AsInt32().NotNullable();

        Create.ForeignKey("fk_transactions_provider")
            .FromTable("transactions").ForeignColumn("provider_id")
            .ToTable("provider").PrimaryColumn("id");

        Create.ForeignKey("fk_transactions_currency")
            .FromTable("transactions").ForeignColumn("currency_id")
            .ToTable("currency").PrimaryColumn("id");

        Create.ForeignKey("fk_transactions_transaction_type")
            .FromTable("transactions").ForeignColumn("transaction_type_id")
            .ToTable("transaction_type").PrimaryColumn("id");

        Create.ForeignKey("fk_transactions_data_owner")
            .FromTable("transactions").ForeignColumn("data_owner_id")
            .ToTable("data_owner").PrimaryColumn("id");
    }

    public override void Down()
    {
        Delete.Table("transactions");
        Delete.Table("transaction_type");
        Delete.Table("currency");
        Delete.Table("provider");
    }
}