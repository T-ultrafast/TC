ALTER TABLE `session` DROP INDEX `session_token_unique`;--> statement-breakpoint
ALTER TABLE `user` DROP INDEX `user_email_unique`;--> statement-breakpoint
ALTER TABLE `account` DROP FOREIGN KEY `account_user_id_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `document` DROP FOREIGN KEY `document_user_id_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `lawyer` DROP FOREIGN KEY `lawyer_id_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `session` DROP FOREIGN KEY `session_user_id_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `account` MODIFY COLUMN `provider_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clause` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clause` MODIFY COLUMN `document_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `consultation` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `consultation` MODIFY COLUMN `document_id` varchar(255);--> statement-breakpoint
ALTER TABLE `document` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `message` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `message` MODIFY COLUMN `consultation_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `token_idx` UNIQUE(`token`);--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `email_idx` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document` ADD CONSTRAINT `document_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lawyer` ADD CONSTRAINT `lawyer_id_user_id_fk` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `provider_idx` ON `account` (`provider_id`);--> statement-breakpoint
CREATE INDEX `clause_doc_idx` ON `clause` (`document_id`);--> statement-breakpoint
CREATE INDEX `clause_risk_idx` ON `clause` (`risk_level`);--> statement-breakpoint
CREATE INDEX `cons_status_idx` ON `consultation` (`status`);--> statement-breakpoint
CREATE INDEX `doc_status_idx` ON `document` (`status`);--> statement-breakpoint
CREATE INDEX `doc_user_idx` ON `document` (`user_id`);--> statement-breakpoint
CREATE INDEX `lawyer_status_idx` ON `lawyer` (`verification_status`);--> statement-breakpoint
CREATE INDEX `msg_cons_idx` ON `message` (`consultation_id`);