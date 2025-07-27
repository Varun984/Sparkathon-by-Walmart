CREATE TYPE "public"."inventory_threshold_enum" AS ENUM('critical', 'healthy', 'warning');--> statement-breakpoint
CREATE TYPE "public"."relocation_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."status_enum" AS ENUM('pending', 'cannot_fulfill', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TABLE "admin" (
	"admin_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "demand_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"demand_quantity" integer NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"source" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "forecasting_metrics" (
	"forecast_id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer NOT NULL,
	"how_much_time_to_fill" time NOT NULL,
	"predicted_demand" double precision NOT NULL,
	"actual_demand" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" varchar(255) NOT NULL,
	"volume_occupied" double precision NOT NULL,
	"volume_available" double precision NOT NULL,
	"volume_reserved" double precision NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"threshold" integer NOT NULL,
	"location_id" integer NOT NULL,
	"status" "inventory_threshold_enum" DEFAULT 'healthy' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"inventory_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "items" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"weight" double precision NOT NULL,
	"dimensions" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"address" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"zip_code" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "real_time_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer NOT NULL,
	"alert_type" varchar(100) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"is_resolved" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "relocation_message" (
	"relocation_message_id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"from_inventory_id" integer NOT NULL,
	"to_inventory_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"priority" varchar(50) DEFAULT 'medium',
	"estimated_completion_time" timestamp with time zone,
	"status" "relocation_status_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spike_monitoring" (
	"spike_monitoring_id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trigger_message" (
	"trigger_message_id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer NOT NULL,
	"message" text NOT NULL,
	"status" "status_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "demand_history" ADD CONSTRAINT "demand_history_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_history" ADD CONSTRAINT "demand_history_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecasting_metrics" ADD CONSTRAINT "forecasting_metrics_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_time_alerts" ADD CONSTRAINT "real_time_alerts_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relocation_message" ADD CONSTRAINT "relocation_message_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relocation_message" ADD CONSTRAINT "relocation_message_from_inventory_id_inventory_id_fk" FOREIGN KEY ("from_inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relocation_message" ADD CONSTRAINT "relocation_message_to_inventory_id_inventory_id_fk" FOREIGN KEY ("to_inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spike_monitoring" ADD CONSTRAINT "spike_monitoring_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trigger_message" ADD CONSTRAINT "trigger_message_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;