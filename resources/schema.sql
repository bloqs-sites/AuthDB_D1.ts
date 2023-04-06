DROP TABLE IF EXISTS `credentials`;
CREATE TABLE `credentials`(
    `id` TEXT,
    `credentials_type` INT,
    `administrator` INT NOT NULL DEFAULT 0,
    `last_log_in` INT NOT NULL DEFAULT 0,
    PRIMARY KEY(`id`, `credentials_type`)
) STRICT;
