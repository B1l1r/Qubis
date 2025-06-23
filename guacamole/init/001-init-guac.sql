
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE guacamole_connection (
    connection_id       INTEGER NOT NULL DEFAULT nextval('guacamole_connection_seq'),
    connection_name     VARCHAR(128) NOT NULL,
    protocol            VARCHAR(32),
    max_connections     INTEGER,
    max_connections_per_user INTEGER,
    PRIMARY KEY (connection_id)
);

CREATE TABLE guacamole_connection_parameter (
    connection_id       INTEGER NOT NULL,
    parameter_name      VARCHAR(128) NOT NULL,
    parameter_value     TEXT,
    PRIMARY KEY (connection_id, parameter_name)
);

CREATE SEQUENCE guacamole_connection_seq START WITH 1;

CREATE TABLE guacamole_user (
    user_id         INTEGER NOT NULL DEFAULT nextval('guacamole_user_seq'),
    username        VARCHAR(128) NOT NULL,
    password_hash   TEXT,
    password_salt   TEXT,
    password_date   TIMESTAMP,
    PRIMARY KEY (user_id)
);

CREATE SEQUENCE guacamole_user_seq START WITH 1;
