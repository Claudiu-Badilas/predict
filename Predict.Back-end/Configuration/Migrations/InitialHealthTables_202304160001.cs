using FluentMigrator;

namespace Configuration.Context;

[Migration(202304160001)]
public class InitialHealthTables_202304160001 : Migration
{
    public override void Up()
    {
        // Add new provider
        Insert.IntoTable("provider")
            .Row(new { name = "ZEPP_LIFE" });

        // Heart rate table
        Create.Table("heart_rate")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("rate").AsInt32().Nullable()
            .WithColumn("measurement_date").AsDateTime().Nullable()
            .WithColumn("is_automation").AsBoolean().NotNullable()
            .WithColumn("provider_id").AsInt32().NotNullable()
            .WithColumn("data_owner_id").AsInt32().NotNullable();

        Create.ForeignKey("fk_heart_rate_provider")
            .FromTable("heart_rate").ForeignColumn("provider_id")
            .ToTable("provider").PrimaryColumn("id");

        Create.ForeignKey("fk_heart_rate_data_owner")
            .FromTable("heart_rate").ForeignColumn("data_owner_id")
            .ToTable("data_owner").PrimaryColumn("id");
    }

    public override void Down()
    {
        Delete.Table("heart_rate");
    }
}
