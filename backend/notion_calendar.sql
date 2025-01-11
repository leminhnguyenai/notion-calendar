CREATE TABLE users (
    user_id VARCHAR(256) PRIMARY KEY,
    email VARCHAR(256) UNIQUE NOT NULL,
    notion_id VARCHAR(512) UNIQUE,
    role ENUM("user", "admin") NOT NULL DEFAULT "user",
    re_auth BOOLEAN NOT NULL
);

CREATE TABLE connections (
    connection_id VARCHAR(72) PRIMARY KEY,
    calendar_id VARCHAR(52),
    user_id VARCHAR(256) NOT NULL,
    calendar_name VARCHAR(90) NOT NULL,
    db JSON NOT NULL,
    event_name JSON NOT NULL,
    date JSON NOT NULL,
    description JSON,
    done_method JSON,
    done_method_option JSON,
    sync_rate INT NOT NULL DEFAULT 90000,
    statistic BOOLEAN NOT NULL DEFAULT TRUE,
    next_exec_time TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE relations (
    notion_event_id VARCHAR(36) PRIMARY KEY,
    google_event_id VARCHAR(26) UNIQUE NOT NULL,
    connection_id VARCHAR(52) NOT NULL,
    created_time TIMESTAMP NOT NULL,
    last_updated_time TIMESTAMP NOT NULL,
    FOREIGN KEY (connection_id) REFERENCES connections(connection_id) ON DELETE CASCADE
);

CREATE TABLE settings (
    user_id VARCHAR(256) PRIMARY KEY,
    theme ENUM("light", "dark", "system") NOT NULL DEFAULT "system",
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE jwt_tokens_blacklisting (
   jwt_token_id VARCHAR(72) PRIMARY KEY,
   user_id VARCHAR(256),
   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE fingerprints_list (
   fingerprint_id VARCHAR(256) PRIMARY KEY,
   user_id VARCHAR(72),
   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
)

