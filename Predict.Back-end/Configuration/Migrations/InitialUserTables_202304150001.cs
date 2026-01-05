using FluentMigrator;

namespace Predict.Configuration.Migrations;

[Migration(202304150001)]
public class InitialUserTables_202304150001 : Migration
{
    public override void Up()
    {
        Create.Table("users")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("email").AsString(100).NotNullable().Unique()
            .WithColumn("password_hash").AsBinary().NotNullable()
            .WithColumn("password_salt").AsBinary().NotNullable()
            .WithColumn("join_date").AsDateTime().NotNullable()
            .WithColumn("last_login").AsDateTime().Nullable()
            .WithColumn("is_active").AsBoolean().NotNullable()
            .WithColumn("is_admin").AsBoolean().NotNullable();

        Insert.IntoTable("users").Row(new
        {
            email = "test@mail.com",
            password_hash = System.Text.Encoding.UTF8.GetBytes("password_hash"),
            password_salt = System.Text.Encoding.UTF8.GetBytes("password_salt"),
            join_date = DateTime.UtcNow,
            last_login = DateTime.UtcNow,
            is_active = true,
            is_admin = true
        });

        Create.Table("data_owner")
            .WithColumn("id").AsInt32().PrimaryKey().Identity()
            .WithColumn("name").AsString(100).NotNullable()
            .WithColumn("creation_date").AsDateTime().NotNullable()
            .WithColumn("user_id").AsInt32().NotNullable()
            .ForeignKey("fk_data_owner_user", "users", "id");

        Insert.IntoTable("data_owner").Row(new
        {
            name = "claudiu",
            creation_date = DateTime.UtcNow,
            user_id = 1
        });
    }

    public override void Down()
    {
        Delete.Table("data_owner");
        Delete.Table("users");
    }
}
