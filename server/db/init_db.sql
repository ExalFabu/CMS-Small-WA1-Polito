-- SQLite
BEGIN TRANSACTION;
DROP TABLE IF EXISTS "users";
CREATE TABLE "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT,
	"name"	TEXT,
	"salt"	TEXT,
	"password"	TEXT,
	"role"	TEXT DEFAULT 'user'
);

/*
	ROLES:
	- admin
	- editor
	- user
*/

INSERT INTO "users" VALUES (1,'buffa@test.com','Buffa', '123123tredueuno', '49d4c05bad68104c3610ed6284f13724070adafdde85bd4038beaf3fbf204f64', 'admin'); /* password='password' for everyone */
INSERT INTO "users" VALUES (2,'edit1@test.com','Editor1', 'ciaociaoehciao', 'e2abd4f76e0b160be6fa4fdf91b43f8aaa25703d0eae0ef6d732184e437eb81c', 'editor');
INSERT INTO "users" VALUES (3,'edit2@test.com','Editor2', 'ciaociaoehciao', 'e2abd4f76e0b160be6fa4fdf91b43f8aaa25703d0eae0ef6d732184e437eb81c', 'editor'); /* Here i got lazy and didn't want to generate other salted passwords*/
INSERT INTO "users" VALUES (4,'user@test.com','User', 'ciaociaoehciao', 'e2abd4f76e0b160be6fa4fdf91b43f8aaa25703d0eae0ef6d732184e437eb81c', 'user');


DROP TABLE IF EXISTS "pages";
CREATE TABLE "pages" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"title" TEXT,
	"author" INTEGER,
	"created_at"	TEXT,
	"published_at"	TEXT
);

INSERT INTO "pages" VALUES (1,2, 'PageTitle 1', '2023-01-01T00:00:00','2023-01-01T00:00:00');
INSERT INTO "pages" VALUES (2,3, 'PageTitle 2', '2023-01-01T00:00:00',NULL);

DROP TABLE IF EXISTS "blocks";
CREATE TABLE "blocks" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"page_id"	INTEGER,
	"type"	TEXT, -- header, paragraph, image.
	"content"	TEXT,
	"order"	INTEGER
);

INSERT INTO "blocks" VALUES (1,1,'header','Header 1',1);
INSERT INTO "blocks" VALUES (2,1,'paragraph','Paragraph 1',2);
INSERT INTO "blocks" VALUES (3,1,'image','https://picsum.photos/200/300',3);
INSERT INTO "blocks" VALUES (4,1,'paragraph','Paragraph 2',4);
INSERT INTO "blocks" VALUES (5,2,'header','Header 2',1);
INSERT INTO "blocks" VALUES (6,2,'paragraph','Paragraph 2.1',2);
INSERT INTO "blocks" VALUES (7,2,'paragraph','Paragraph 2.2',3);
INSERT INTO "blocks" VALUES (8,2,'paragraph','Paragraph 2.3',4);


COMMIT;