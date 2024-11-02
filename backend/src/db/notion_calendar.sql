CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(320) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE NOT NULL
    -- Add roles
);

CREATE TABLE IF NOT EXISTS connections (
    calendar_id VARCHAR(90) PRIMARY KEY,
    user_id INT,
    calendar_name VARCHAR(50),
    date JSON NOT NULL,
    name JSON NOT NULL,
    description JSON,
    done_method JSON,
    done_method_option JSON,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connection_settings (
   calendar_id VARCHAR(90) PRIMARY KEY,
   sync_rate INT NOT NULL DEFAULT 900000,
   statistic BOOLEAN NOT NULL DEFAULT TRUE,
   FOREIGN KEY (calendar_id) REFERENCES connections(calendar_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS relations (
    notion_id VARCHAR(36) PRIMARY KEY,
    calendar_id VARCHAR(90) UNIQUE NOT NULL,
    event_id VARCHAR(90) UNIQUE NOT NULL,
    created_time TIMESTAMP NOT NULL,
    FOREIGN KEY (calendar_id) REFERENCES connections(calendar_id) ON DELETE CASCADE,
    notion_last_edited_time TIMESTAMP NOT NULL,
    google_calendar_last_edited_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
   user_id INT PRIMARY KEY,
   theme ENUM("system", "dark", "light") NOT NULL DEFAULT "system",
   FOREIGN KEY (user_id) REFERENCES users(user_id)   
);

-- TEST DATA
-- INSERT INTO connections VALUES (
--         "acwfghhsdad",
--         4,
--         "Calendar 3",
--         '{"name": "Skibidi", "value": "Skibidi"}',
--         '{"name": "Skibidi", "value": "Skibidi"}',
--         '{"name": "Skibidi", "value": "Skibidi"}',
--         '{"name": "Skibidi", "value": "Skibidi"}',
--         '{"name": "Skibidi", "value": "Skibidi"}'
-- )

SELECT FROM ()