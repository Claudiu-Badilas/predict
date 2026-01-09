using FluentMigrator;

namespace Predict.Configuration.Migrations;

[Migration(202601060001)]
public class InitialUserTables_202601060001 : Migration
{
    public override void Up()
    {
        // =========================
        // USERS
        // =========================
        Execute.Sql(@"
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash BYTEA NOT NULL,
                password_salt BYTEA NOT NULL,
                join_date TIMESTAMP NOT NULL,
                last_login TIMESTAMP NULL,
                is_active BOOLEAN NOT NULL,
                is_admin BOOLEAN NOT NULL
            );
        ");

        Execute.Sql(@"
            INSERT INTO users (
                email, password_hash, password_salt, join_date, last_login, is_active, is_admin
            ) VALUES (
                'test@mail.com',
                convert_to('password_hash', 'UTF8'),
                convert_to('password_salt', 'UTF8'),
                NOW(),
                NOW(),
                TRUE,
                TRUE
            );
        ");

        // =========================
        // DATA OWNER
        // =========================
        Execute.Sql(@"
            CREATE TABLE data_owner (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                creation_date TIMESTAMP NOT NULL,
                user_id INT NOT NULL,
                CONSTRAINT fk_data_owner_user
                    FOREIGN KEY (user_id) REFERENCES users(id)
            );
        ");

        Execute.Sql(@"
            INSERT INTO data_owner (name, creation_date, user_id)
            VALUES ('claudiu', NOW(), 1);
        ");

        // =========================
        // PROVIDER
        // =========================
        Execute.Sql(@"
            CREATE TABLE provider (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );
        ");

        Execute.Sql(@"
            INSERT INTO provider (name) VALUES
            ('RAIFFEISEN'),
            ('REVOLUT'),
            ('ORANGE_MONEY'),
            ('CARREFOUR'),
            ('KAUFLAND');
        ");

        // =========================
        // CURRENCY
        // =========================
        Execute.Sql(@"
            CREATE TABLE currency (
                id SERIAL PRIMARY KEY,
                code VARCHAR(10) NOT NULL UNIQUE
            );
        ");

        Execute.Sql(@"
            INSERT INTO currency (code) VALUES
            ('EUR'),
            ('USD'),
            ('RON');
        ");

        // =========================
        // TRANSACTION TYPE
        // =========================
        Execute.Sql(@"
            CREATE TABLE transaction_type (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL UNIQUE
            );
        ");

        Execute.Sql(@"
            INSERT INTO transaction_type (type) VALUES
            ('SPEND'),
            ('RECEIVED'),
            ('INTERNAL_TRANSFER'),
            ('TOP_UP'),
            ('TRANSFER'),
            ('FEE'),
            ('CARD_PAYMENT'),
            ('ATM'),
            ('EXCHANGE'),
            ('REWARD'),
            ('REFUND'),
            ('BILL_PAYMENT'),
            ('BALANCE_CHECK'),
            ('UNDEFINED');
        ");

        // =========================
        // TRANSACTIONS
        // =========================
        Execute.Sql(@"
            CREATE TABLE transactions (
                id SERIAL PRIMARY KEY,
                identifier VARCHAR(100) NOT NULL UNIQUE,
                registration_date TIMESTAMP NULL,
                completion_date TIMESTAMP NULL,
                amount NUMERIC(18,2) NULL,
                fee NUMERIC(18,2) NULL,
                description VARCHAR(500) NULL,
                reference_id INT NULL,
                provider_id INT NOT NULL,
                currency_id INT NOT NULL,
                transaction_type_id INT NOT NULL,
                data_owner_id INT NOT NULL,
                CONSTRAINT fk_transactions_provider
                    FOREIGN KEY (provider_id) REFERENCES provider(id),
                CONSTRAINT fk_transactions_currency
                    FOREIGN KEY (currency_id) REFERENCES currency(id),
                CONSTRAINT fk_transactions_transaction_type
                    FOREIGN KEY (transaction_type_id) REFERENCES transaction_type(id),
                CONSTRAINT fk_transactions_data_owner
                    FOREIGN KEY (data_owner_id) REFERENCES data_owner(id)
            );
        ");

        // =========================
        // QUANTITY TYPE
        // =========================
        Execute.Sql(@"
            CREATE TABLE quantity_type (
                id SERIAL PRIMARY KEY,
                type VARCHAR(20) NOT NULL UNIQUE
            );
        ");

        Execute.Sql(@"
            INSERT INTO quantity_type (type) VALUES
            ('BUC'),
            ('KG');
        ");

        // =========================
        // RECEIPT
        // =========================
        Execute.Sql(@"
            CREATE TABLE receipt (
                id SERIAL PRIMARY KEY,
                identifier VARCHAR(100) NOT NULL UNIQUE,
                receipt_date TIMESTAMP NULL,
                total_price NUMERIC(18,2) NULL,
                total_discount NUMERIC(18,2) NULL,
                description VARCHAR(500) NULL,
                provider_id INT NOT NULL,
                currency_id INT NOT NULL,
                data_owner_id INT NOT NULL,
                CONSTRAINT fk_receipt_provider
                    FOREIGN KEY (provider_id) REFERENCES provider(id),
                CONSTRAINT fk_receipt_currency
                    FOREIGN KEY (currency_id) REFERENCES currency(id),
                CONSTRAINT fk_receipt_data_owner
                    FOREIGN KEY (data_owner_id) REFERENCES data_owner(id)
            );
        ");

        // =========================
        // PURCHASED PRODUCT
        // =========================
        Execute.Sql(@"
            CREATE TABLE purchased_product (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NULL,
                price NUMERIC(18,2) NULL,
                quantity NUMERIC(18,3) NULL,
                vat INT NULL,
                quantity_type_id INT NOT NULL,
                receipt_id INT NOT NULL,
                CONSTRAINT fk_purchased_product_quantity_type
                    FOREIGN KEY (quantity_type_id) REFERENCES quantity_type(id),
                CONSTRAINT fk_purchased_product_receipt
                    FOREIGN KEY (receipt_id) REFERENCES receipt(id)
            );
        ");
    }

    public override void Down()
    {
        Execute.Sql(@"DROP TABLE IF EXISTS purchased_product;");
        Execute.Sql(@"DROP TABLE IF EXISTS receipt;");
        Execute.Sql(@"DROP TABLE IF EXISTS quantity_type;");
        Execute.Sql(@"DROP TABLE IF EXISTS transactions;");
        Execute.Sql(@"DROP TABLE IF EXISTS transaction_type;");
        Execute.Sql(@"DROP TABLE IF EXISTS currency;");
        Execute.Sql(@"DROP TABLE IF EXISTS provider;");
        Execute.Sql(@"DROP TABLE IF EXISTS data_owner;");
        Execute.Sql(@"DROP TABLE IF EXISTS users;");
    }
}
