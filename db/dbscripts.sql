create database creater_content;
use  creater_content;
drop table `creater_content`.`users`;
CREATE TABLE `creater_content`.`users` (
  `user_id` VARCHAR(45) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `email` VARCHAR(55) NOT NULL,
  `paid` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE);

truncate `creater_content`.`users`;
truncate `creater_content`.`videos`;
truncate  `creater_content`.`comments`;
select * from `creater_content`.`users`;
drop table videos;
drop table comments;
CREATE TABLE `creater_content`.`videos` (
  `video_id` VARCHAR(45) NOT NULL,
  `title` VARCHAR(100) NOT NULL Unique,
  `description` VARCHAR(255) NOT NULL,
  `likes` BIGINT NOT NULL DEFAULT 0,
  `dis_likes` BIGINT NOT NULL DEFAULT 0,
  `video_links` MEDIUMTEXT,
  `uploader_id` VARCHAR(45),
  PRIMARY KEY (`video_id`),
  FOREIGN KEY (`uploader_id`) REFERENCES `creater_content`.`users` (`user_id`) ON DELETE SET NULL
);
select * from videos;

create table  `creater_content`.`comments`(
`user_id` VARCHAR(45) NOT NULL,
`video_id` VARCHAR(45) NOT NULL,
`comment_id` VARCHAR(45) NOT NULL,
`likes` BIGINT NOT NULL DEFAULT 0,
`dis_likes` BIGINT NOT NULL DEFAULT 0,
PRIMARY KEY (`user_id`,`video_id`,`comment_id`),
FOREIGN KEY (`user_id`) REFERENCES `creater_content`.`users` (`user_id`) ON DELETE  CASCADE,
FOREIGN KEY (`video_id`) REFERENCES `creater_content`.`videos` (`video_id`) ON DELETE  CASCADE
);


select * from comments;

