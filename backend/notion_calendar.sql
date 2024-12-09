CREATE TABLE users (
    user_id VARCHAR(72) PRIMARY KEY,
    email VARCHAR(256) UNIQUE NOT NULL,
    refresh_token VARCHAR(512),
    role ENUM("user", "admin") NOT NULL DEFAULT "user"
);

CREATE TABLE connections (
    calendar_id VARCHAR(52) PRIMARY KEY,
    user_id VARCHAR(72) NOT NULL,
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
    notion_id VARCHAR(36) PRIMARY KEY,
    google_id VARCHAR(26) UNIQUE NOT NULL,
    calendar_id VARCHAR(52) NOT NULL,
    created_time TIMESTAMP NOT NULL,
    last_updated_time TIMESTAMP NOT NULL,
    FOREIGN KEY (calendar_id) REFERENCES connections(calendar_id) ON DELETE CASCADE
);

CREATE TABLE settings (
    user_id VARCHAR(72) PRIMARY KEY,
    theme ENUM("light", "dark", "system") NOT NULL DEFAULT "system",
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


