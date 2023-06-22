create database creater_content;
use  creater_content;

CREATE TABLE `customer_worker`.`users` (
  `user_id` INT NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `email` VARCHAR(55) NOT NULL,
  `paid` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE);

select * from `customer_worker`.`users`;
