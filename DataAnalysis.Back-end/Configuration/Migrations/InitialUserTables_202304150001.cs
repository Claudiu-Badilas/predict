using FluentMigrator;

namespace Configuration.Context {

    [Migration(202304150001)]
    public class InitialUserTables_202304150001 : Migration {
        public override void Down() {
            Delete.Table("user");
            Delete.Table("data_owner");

        }
        public override void Up() {
            Create.Table("user")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("email").AsString(100).NotNullable().Unique()
                .WithColumn("password_hash").AsBinary().NotNullable()
                .WithColumn("password_salt").AsBinary().NotNullable()
                .WithColumn("join_date").AsDateTime()
                .WithColumn("last_login").AsDateTime().Nullable()
                .WithColumn("is_active").AsBoolean()
                .WithColumn("is_admin").AsBoolean();

            Insert.IntoTable("user")
                .Row(new {
                    id = 1,
                    email = "test@mail.com",
                    password_hash = "password_hash",
                    password_salt = "password_salt",
                    join_date = DateTime.UtcNow,
                    last_login = DateTime.UtcNow,
                    is_active = true,
                    is_admin = true
                });

            Create.Table("data_owner")
                .WithColumn("id").AsInt32().NotNullable().PrimaryKey().Identity()
                .WithColumn("name").AsString(100).NotNullable()
                .WithColumn("creation_date").AsDateTime()
                .WithColumn("user_id").AsInt32().NotNullable().ForeignKey("user", "id");

            Insert.IntoTable("data_owner")
                .Row(new {
                    id = 1,
                    name = "claudiu",
                    creation_date = DateTime.UtcNow,
                    user_id = 1
                });
        }
    }
}
