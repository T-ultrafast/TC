CREATE TABLE `account` (
	`id` varchar(255) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clause` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`clause_type` varchar(100) NOT NULL,
	`text_content` text NOT NULL,
	`risk_level` varchar(50),
	`explanation` text,
	`page_number` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clause_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultation` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(255) NOT NULL,
	`lawyer_id` varchar(255) NOT NULL,
	`document_id` varchar(36),
	`status` varchar(50) DEFAULT 'requested',
	`scheduled_at` timestamp,
	`fee` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`file_url` text NOT NULL,
	`file_type` varchar(50) NOT NULL,
	`content_text` text,
	`risk_score` int,
	`summary` text,
	`status` varchar(50) DEFAULT 'processing',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lawyer` (
	`id` varchar(255) NOT NULL,
	`title` text,
	`license_number` varchar(255) NOT NULL,
	`bar_association` varchar(255) NOT NULL,
	`specialties` text NOT NULL,
	`city` varchar(255),
	`state` varchar(255),
	`country` varchar(255) DEFAULT 'USA',
	`hourly_rate` decimal(10,2) NOT NULL,
	`bio` text,
	`rating` decimal(3,2) DEFAULT '0.00',
	`reviews_count` int DEFAULT 0,
	`verification_status` varchar(50) DEFAULT 'pending',
	`verified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lawyer_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message` (
	`id` varchar(36) NOT NULL,
	`consultation_id` varchar(36) NOT NULL,
	`sender_id` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`read` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(255) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL,
	`image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`plan` varchar(50) NOT NULL DEFAULT 'free',
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(255) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clause` ADD CONSTRAINT `clause_document_id_document_id_fk` FOREIGN KEY (`document_id`) REFERENCES `document`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultation` ADD CONSTRAINT `consultation_client_id_user_id_fk` FOREIGN KEY (`client_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultation` ADD CONSTRAINT `consultation_lawyer_id_lawyer_id_fk` FOREIGN KEY (`lawyer_id`) REFERENCES `lawyer`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consultation` ADD CONSTRAINT `consultation_document_id_document_id_fk` FOREIGN KEY (`document_id`) REFERENCES `document`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document` ADD CONSTRAINT `document_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lawyer` ADD CONSTRAINT `lawyer_id_user_id_fk` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message` ADD CONSTRAINT `message_consultation_id_consultation_id_fk` FOREIGN KEY (`consultation_id`) REFERENCES `consultation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message` ADD CONSTRAINT `message_sender_id_user_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;