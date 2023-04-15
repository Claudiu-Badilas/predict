using FluentMigrator;

namespace DataAnalysis.Configuration.Migrations {
    [Migration(202304150003)]
    public class InitialReceiptTables_202304150003 : Migration {
        public override void Down() {
            Delete.Table("purchased_product2");
            Delete.Table("quantity_type2");
            Delete.Table("receipt2");
        }

        public override void Up() {
            Create.Table("quantity_type2")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("type").AsString().NotNullable().Unique();
            Insert.IntoTable("quantity_type2")
                .Row(new { id = 1, type = "BUC" })
                .Row(new { id = 2, type = "KG" });

            Create.Table("receipt2")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("identifier").AsString().NotNullable().Unique()
                .WithColumn("date").AsDateTime()
                .WithColumn("total_price").AsDouble()
                .WithColumn("total_discount").AsDouble()
                .WithColumn("description").AsString()
                .WithColumn("provider_id").AsInt32().NotNullable().ForeignKey("provider2", "id")
                .WithColumn("currency_id").AsInt32().NotNullable().ForeignKey("currency2", "id")
                .WithColumn("data_owner_id").AsInt32().NotNullable().ForeignKey("data_owner2", "id");

            Create.Table("purchased_product2")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("name").AsString()
                .WithColumn("price").AsDouble()
                .WithColumn("quantity").AsInt32()
                .WithColumn("vat").AsInt32()
                .WithColumn("quantity_type_id").AsInt32().NotNullable().ForeignKey("quantity_type2", "id")
                .WithColumn("receipt_id").AsInt32().NotNullable().ForeignKey("receipt2", "id");

        }
    }
}
