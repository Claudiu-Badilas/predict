using FluentMigrator;

namespace Predict.Configuration.Migrations;

[Migration(202304150003)]
public class InitialReceiptTables_202304150003 : Migration
{
    public override void Up()
    {
        Create.Table("quantity_type")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("type").AsString(20).NotNullable().Unique();

        Insert.IntoTable("quantity_type")
            .Row(new { type = "BUC" })
            .Row(new { type = "KG" });

        Create.Table("receipt")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("identifier").AsString(100).NotNullable().Unique()
            .WithColumn("receipt_date").AsDateTime().Nullable()
            .WithColumn("total_price").AsDecimal(18, 2).Nullable()
            .WithColumn("total_discount").AsDecimal(18, 2).Nullable()
            .WithColumn("description").AsString(500).Nullable()
            .WithColumn("provider_id").AsInt32().NotNullable()
            .WithColumn("currency_id").AsInt32().NotNullable()
            .WithColumn("data_owner_id").AsInt32().NotNullable();

        Create.ForeignKey("fk_receipt_provider")
            .FromTable("receipt").ForeignColumn("provider_id")
            .ToTable("provider").PrimaryColumn("id");

        Create.ForeignKey("fk_receipt_currency")
            .FromTable("receipt").ForeignColumn("currency_id")
            .ToTable("currency").PrimaryColumn("id");

        Create.ForeignKey("fk_receipt_data_owner")
            .FromTable("receipt").ForeignColumn("data_owner_id")
            .ToTable("data_owner").PrimaryColumn("id");

        Create.Table("purchased_product")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("name").AsString(200).Nullable()
            .WithColumn("price").AsDecimal(18, 2).Nullable()
            .WithColumn("quantity").AsDecimal(18, 3).Nullable()
            .WithColumn("vat").AsInt32().Nullable()
            .WithColumn("quantity_type_id").AsInt32().NotNullable()
            .WithColumn("receipt_id").AsInt32().NotNullable();

        Create.ForeignKey("fk_purchased_product_quantity_type")
            .FromTable("purchased_product").ForeignColumn("quantity_type_id")
            .ToTable("quantity_type").PrimaryColumn("id");

        Create.ForeignKey("fk_purchased_product_receipt")
            .FromTable("purchased_product").ForeignColumn("receipt_id")
            .ToTable("receipt").PrimaryColumn("id");
    }

    public override void Down()
    {
        Delete.Table("purchased_product");
        Delete.Table("receipt");
        Delete.Table("quantity_type");
    }
}