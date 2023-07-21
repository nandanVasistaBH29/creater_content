create database creater_content;
use  creater_content;
CREATE TABLE `creater_content`.`users` (
  `user_id` VARCHAR(45) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `email` VARCHAR(55) NOT NULL,
  `paid` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE);

  CREATE TABLE `creater_content`.`videos` (
  `video_id` VARCHAR(45) NOT NULL,
  `title` VARCHAR(100) NOT NULL Unique,
  `description` VARCHAR(255) NOT NULL,
  `likes` BIGINT NOT NULL DEFAULT 0,
  `dis_likes` BIGINT NOT NULL DEFAULT 0,
  `view_count` BIGINT NOT NULL DEFAULT 0,
  `video_links` MEDIUMTEXT,--this has to be removed 
  `uploader_id` VARCHAR(45),
  PRIMARY KEY (`video_id`),
  FOREIGN KEY (`uploader_id`) REFERENCES `creater_content`.`users` (`user_id`) ON DELETE SET NULL
);

CREATE TABLE `creater_content`.`comments_videos` (
  `user_id` VARCHAR(45) NOT NULL,
  `video_id` VARCHAR(45) NOT NULL,
  `comment_id` VARCHAR(45) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `updated_at` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (`user_id`, `video_id`, `comment_id`),
  FOREIGN KEY (`user_id`) REFERENCES `creater_content`.`users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`video_id`) REFERENCES `creater_content`.`videos` (`video_id`) ON DELETE CASCADE
);
-- First, add an index to the `comment_id` column
ALTER TABLE `creater_content`.`comments_videos`
ADD INDEX `idx_comment_id` (`comment_id`);

-- Then, add the `parent_comment_id` column as a self-referencing foreign key
ALTER TABLE `creater_content`.`comments_videos`
ADD COLUMN `parent_comment_id` VARCHAR(45) NULL,
ADD CONSTRAINT `fk_parent_comment`
  FOREIGN KEY (`parent_comment_id`)
  REFERENCES `creater_content`.`comments_videos` (`comment_id`)
  ON DELETE CASCADE;



select * from comments_videos;
create table comment_likes (
  
);

ALTER TABLE comments_videos  ADD CONSTRAINT `fk`  FOREIGN KEY (parent_comment_id) REFERENCES comments_videos(comment_id);

ALTER TABLE `creater_content`.`comments_videos` ADD CONSTRAINT `parent_comment_id` FOREIGN KEY (`parent_comment_id`) REFERENCES comments_videos(comment_id) ON DELETE CASCADE;


drop table comments_videos;


CREATE TABLE `creater_content`.`teams` (
  `team_id` INT NOT NULL AUTO_INCREMENT,
  `team_name` VARCHAR(100) NOT NULL,
  `owner_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`team_id`),
  UNIQUE INDEX `team_name_UNIQUE` (`team_name` ASC) VISIBLE,
  FOREIGN KEY (`owner_id`) REFERENCES `creater_content`.`users` (`user_id`) ON DELETE CASCADE
);

CREATE TABLE `creater_content`.`team_members` (
  `team_id` INT NOT NULL,
  `user_id` VARCHAR(45) NOT NULL,
`role` text not null,
  PRIMARY KEY (`team_id`, `user_id`),
  FOREIGN KEY (`team_id`) REFERENCES `creater_content`.`teams` (`team_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `creater_content`.`users` (`user_id`) ON DELETE CASCADE
);
create table documents (
    doc_id varchar(45) primary key,
    title varchar(255),
    content TEXT,
    created_at datetime default NOW(),
    updated_at datetime default NOW()
);

CREATE TABLE document_users (
    `user_id` VARCHAR(45) NOT NULL,
    `doc_id` VARCHAR(45) NOT NULL,
    `access` ENUM('-1', '0', '1', '2') DEFAULT '0',
    PRIMARY KEY (`user_id`, `doc_id`),
    FOREIGN KEY (`user_id`) REFERENCES `creater_content`.`users` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`doc_id`) REFERENCES `creater_content`.`documents` (`doc_id`) ON DELETE CASCADE
);

drop table `creater_content`.`users`;
truncate `creater_content`.`users`;
truncate `creater_content`.`videos`;
truncate  `creater_content`.`comments`;
drop table teams;
drop table team_members;
drop table documents;


