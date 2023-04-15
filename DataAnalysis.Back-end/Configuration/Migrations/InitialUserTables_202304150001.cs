using FluentMigrator;
using FluentMigrator.Builders;
using FluentMigrator.Builder;
using FluentMigrator.Expressions;
using FluentMigrator.Model;
using FluentMigrator.Postgres;
using FluentMigrator.Infrastructure;
using FluentMigrator.Runner.Initialization;

namespace Configuration.Context {

    [Migration(202106280001)]
    public class InitialUserTables_202304150001 : Migration {
        public override void Down() {
            Delete.Table("user2");
            Delete.Table("data_owner2");

        }
        public override void Up() {
            Create.Table("user2")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("email").AsString(100).NotNullable().Unique()
                .WithColumn("password_hash").AsBinary().NotNullable()
                .WithColumn("password_salt").AsBinary().NotNullable()
                .WithColumn("join_date").AsDateTime()
                .WithColumn("last_login").AsDateTime()
                .WithColumn("is_active").AsBoolean()
                .WithColumn("is_admin").AsBoolean();

            Create.Table("data_owner2")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("name").AsString(100).NotNullable()
                .WithColumn("creation_date").AsDateTime()
                .WithColumn("user_id").AsInt32().NotNullable().ForeignKey("user2", "id");
        }
    }
}
