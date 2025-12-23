using FluentMigrator;

namespace Configuration.Context {

    [Migration(202304160001)]
    public class InitialHealthTables_202304160001 : Migration {
        public override void Down() {
            Delete.Table("hearth_rate");

        }
        public override void Up() {
            Create.Table("hearth_rate")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("rate").AsInt32().Nullable()
                .WithColumn("date").AsDateTime().Nullable()
                .WithColumn("is_automation").AsBoolean()
                .WithColumn("provider_id").AsInt32().NotNullable().ForeignKey("provider", "id")
                .WithColumn("data_owner_id").AsInt32().NotNullable().ForeignKey("data_owner", "id");

            Insert.IntoTable("provider")
               .Row(new { id = 6, name = "ZEPP_LIFE" });
        }
    }
}
