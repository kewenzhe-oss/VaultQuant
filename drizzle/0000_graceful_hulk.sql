CREATE TABLE `journal` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`content` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`report_data` text NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `strategies` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`strategyName` text NOT NULL,
	`description` text,
	`open_position_rules` text,
	`close_position_rules` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`positionType` text NOT NULL,
	`openDate` text NOT NULL,
	`openTime` text NOT NULL,
	`closeDate` text,
	`closeTime` text,
	`isActiveTrade` integer DEFAULT true NOT NULL,
	`instrumentName` text,
	`symbolName` text NOT NULL,
	`entryPrice` text,
	`deposit` text,
	`result` text,
	`totalCost` text,
	`quantity` text,
	`sellPrice` text,
	`quantitySold` text,
	`notes` text,
	`rating` integer DEFAULT 0,
	`strategy_id` text,
	`applied_open_rules` text,
	`applied_close_rules` text,
	`close_events` text,
	`open_other_details` text,
	`close_other_details` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`strategy_id`) REFERENCES `strategies`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`capital` text,
	`created_at` text NOT NULL,
	`tokens` integer DEFAULT 5,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`open_custom_field_names` text,
	`close_custom_field_names` text
);
