using FluentMigrator;

namespace Predict.Configuration.Migrations {
    [Migration(202304150002)]
    public class InitialTransactionTables_202304150002 : Migration {
        public override void Down() {
            Delete.Table("provider");
            Delete.Table("transaction");
            Delete.Table("currency");
            Delete.Table("transaction_type");
        }

        public override void Up() {
            Create.Table("provider")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("name").AsString().NotNullable().Unique();

            Insert.IntoTable("provider")
                .Row(new { id = 1, name = "RAIFFEISEN" })
                .Row(new { id = 2, name = "REVOLUT" })
                .Row(new { id = 3, name = "ORANGE_MONEY" })
                .Row(new { id = 4, name = "CARREFOUR" })
                .Row(new { id = 5, name = "KAUFLAND" });


            Create.Table("currency")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("type").AsString().NotNullable().Unique();
            Insert.IntoTable("currency")

                .Row(new { id = 1, type = "EUR" })
                .Row(new { id = 2, type = "USD" })
                .Row(new { id = 3, type = "RON" });

            Create.Table("transaction_type")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("type").AsString().NotNullable().Unique();

            Insert.IntoTable("transaction_type")
                .Row(new { id = 1, type = "SPEND" })
                .Row(new { id = 2, type = "RECEIVED" })
                .Row(new { id = 3, type = "INTERNAL_TRANSFER" })
                .Row(new { id = 4, type = "TOP_UP" })
                .Row(new { id = 5, type = "TRANSFER" })
                .Row(new { id = 6, type = "FEE" })
                .Row(new { id = 7, type = "CARD_PAYMENT" })
                .Row(new { id = 8, type = "ATM" })
                .Row(new { id = 9, type = "EXCHANGE" })
                .Row(new { id = 10, type = "REWARD" })
                .Row(new { id = 11, type = "REFUND" })
                .Row(new { id = 12, type = "BILL_PAYMENT" })
                .Row(new { id = 13, type = "BALANCE_CHECK" })
                .Row(new { id = 14, type = "UNDEFINED" });


            Create.Table("transaction")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("identifier").AsString().NotNullable().Unique()
                .WithColumn("registration_date").AsDateTime().Nullable()
                .WithColumn("completition_date").AsDateTime().Nullable()
                .WithColumn("amount").AsDouble().Nullable()
                .WithColumn("fee").AsDouble().Nullable()
                .WithColumn("description").AsString().Nullable()
                .WithColumn("reference_id").AsInt32().Nullable()
                .WithColumn("provider_id").AsInt32().NotNullable().ForeignKey("provider", "id")
                .WithColumn("currency_id").AsInt32().NotNullable().ForeignKey("currency", "id")
                .WithColumn("transaction_type_id").AsInt32().NotNullable().ForeignKey("transaction_type", "id")
                .WithColumn("data_owner_id").AsInt32().NotNullable().ForeignKey("data_owner", "id");

        }
    }
}
