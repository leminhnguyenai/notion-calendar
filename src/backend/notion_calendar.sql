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

ALTER TABLE relations
ADD FOREIGN KEY (calendar_id) REFERENCES connections(calendar_id);

INSERT INTO connections VALUES (
    'e6f252d04935bd2e95f3d4c8a8f70b7eb3ef1a0788956694458def155e8f3dbd@group.calendar.google.com',
    'Notion projects',
    '{"date": {
      "name": "Due Date",
      "value": "eD%3DI"
    }}',
    '{"name": {
      "name": "Name",
      "value": "title"
    }}',
    '{"description": {
      "name": "Notes",
      "value": "Jg~E"
    }}',
    '{"doneMethod": {
      "name": "Status",
      "value": "F%3FJa"
    }}',
    '{"doneMethodOption": {
      "name": "Done",
      "value": "Jqhn"
    }}'
);
