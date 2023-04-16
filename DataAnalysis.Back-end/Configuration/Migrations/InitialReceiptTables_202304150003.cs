using FluentMigrator;

namespace DataAnalysis.Configuration.Migrations {
    [Migration(202304150003)]
    public class InitialReceiptTables_202304150003 : Migration {
        public override void Down() {
            Delete.Table("purchased_product");
            Delete.Table("quantity_type");
            Delete.Table("receipt");
        }

        public override void Up() {
            Create.Table("quantity_type")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("type").AsString().NotNullable().Unique();

            Insert.IntoTable("quantity_type")
                .Row(new { id = 1, type = "BUC" })
                .Row(new { id = 2, type = "KG" });


            Create.Table("receipt")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("identifier").AsString().NotNullable().Unique()
                .WithColumn("date").AsDateTime().Nullable()
                .WithColumn("total_price").AsDouble().Nullable()
                .WithColumn("total_discount").AsDouble().Nullable()
                .WithColumn("description").AsString().Nullable()
                .WithColumn("provider_id").AsInt32().NotNullable().ForeignKey("provider", "id")
                .WithColumn("currency_id").AsInt32().NotNullable().ForeignKey("currency", "id")
                .WithColumn("data_owner_id").AsInt32().NotNullable().ForeignKey("data_owner", "id");


            Create.Table("purchased_product")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("name").AsString().Nullable()
                .WithColumn("price").AsDouble().Nullable()
                .WithColumn("quantity").AsInt32().Nullable()
                .WithColumn("vat").AsInt32().Nullable()
                .WithColumn("quantity_type_id").AsInt32().NotNullable().ForeignKey("quantity_type", "id")
                .WithColumn("receipt_id").AsInt32().NotNullable().ForeignKey("receipt", "id");

        }
    }
}
