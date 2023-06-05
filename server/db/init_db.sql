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
COMMIT;