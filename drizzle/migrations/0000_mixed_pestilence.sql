CREATE TABLE `data_rows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`banner_image` text,
	`links` text DEFAULT '[]' NOT NULL,
	`data` text,
	`content` text,
	`title` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
