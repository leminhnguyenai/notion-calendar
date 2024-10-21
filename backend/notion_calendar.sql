CREATE TABLE connections (
    calendar_id VARCHAR(90) PRIMARY KEY,
    calendar_name VARCHAR(40) NOT NULL,
    date JSON NOT NULL,
    name JSON NOT NULL,
    description JSON,
    done_method JSON,
    done_method_option JSON
);

SELECT * FROM connections;

CREATE TABLE relations (
    notion_id VARCHAR(36) PRIMARY KEY,
    calendar_id VARCHAR(90) NOT NULL,
    event_id VARCHAR(90) NOT NULL,
    created_time TIMESTAMP NOT NULL
);

SELECT * FROM relations;

CREATE TABLE settings (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    refresh_rate INT DEFAULT 180000 NOT NULL
);


ADD FOREIGN KEY (calendar_id) REFERENCES connections(calendar_id);

INSERT INTO settings () VALUES ();