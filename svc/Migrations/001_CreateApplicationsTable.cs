using FluentMigrator;

namespace ConfigService.Migrations;

[Migration(1)]
public class CreateApplicationsTable : Migration
{
    public override void Up()
    {
        Create.Table("applications")
            .WithColumn("id").AsString(26).PrimaryKey()
            .WithColumn("name").AsString(255).NotNullable().Unique()
            .WithColumn("description").AsString(1000).Nullable()
            .WithColumn("created_at").AsDateTime2().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn("updated_at").AsDateTime2().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime);
    }

    public override void Down()
    {
        Delete.Table("applications");
    }
}
