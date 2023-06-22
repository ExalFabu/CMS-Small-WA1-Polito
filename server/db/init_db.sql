BEGIN TRANSACTION;
DROP TABLE IF EXISTS "users";
CREATE TABLE IF NOT EXISTS "users" (
        "id"    INTEGER PRIMARY KEY AUTOINCREMENT,
        "email" TEXT,
        "name"  TEXT,
        "salt"  TEXT,
        "password"      TEXT,
        "role"  TEXT DEFAULT 'user'
);
INSERT INTO users VALUES(1,'editor1@test.com','Main Editor','ciaociaoehciao','e2abd4f76e0b160be6fa4fdf91b43f8aaa25703d0eae0ef6d732184e437eb81c','editor');
INSERT INTO users VALUES(2,'editor2@test.com','Second Editor','ciaociaoehciao','e2abd4f76e0b160be6fa4fdf91b43f8aaa25703d0eae0ef6d732184e437eb81c','editor');
INSERT INTO users VALUES(3,'editor3@test.com','Pageless Editor','ciaociaoehciao','e2abd4f76e0b160be6fa4fdf91b43f8aaa25703d0eae0ef6d732184e437eb81c','editor');
INSERT INTO users VALUES(4,'user4@test.com','Useless User','ciaociaoehciao','e2abd4f76e0b160be6fa4fdf91b43f8aaa25703d0eae0ef6d732184e437eb81c','user');
INSERT INTO users VALUES(22,'buffa@test.com','Buffa','123123tredueuno','49d4c05bad68104c3610ed6284f13724070adafdde85bd4038beaf3fbf204f64','admin');   

DROP TABLE IF EXISTS "pages";
CREATE TABLE IF NOT EXISTS "pages" (
        "id"    INTEGER PRIMARY KEY AUTOINCREMENT,
        "title" TEXT,
        "author" INTEGER,
        "created_at"    TEXT,
        "published_at"  TEXT
);
INSERT INTO pages VALUES(2,'Neapolitan Pizza',1,'2023-06-15T18:09:25.171Z',NULL);
INSERT INTO pages VALUES(3,'Paesto',1,'2023-06-15T18:14:03.643Z',NULL);
INSERT INTO pages VALUES(4,'Movie''s Breakfast',1,'2023-06-15T18:16:39.293Z','2023-06-13T22:00:00.000Z');
INSERT INTO pages VALUES(5,'Tiramisù',1,'2023-06-15T18:58:10.685Z','2023-06-11T22:00:00.000Z');
INSERT INTO pages VALUES(6,'Donuts',1,'2023-06-15T19:13:41.158Z','2023-07-29T22:00:00.000Z');
INSERT INTO pages VALUES(7,'Gym Dish',1,'2023-06-15T19:18:50.190Z','2023-08-15T22:00:00.000Z');
INSERT INTO pages VALUES(8,'Bread',2,'2023-06-15T19:22:41.775Z',NULL);
INSERT INTO pages VALUES(9,'Cheeseburger',2,'2023-06-15T19:28:38.066Z','2024-01-04T23:00:00.000Z');
INSERT INTO pages VALUES(10,'Mix',2,'2023-06-15T19:30:12.823Z','2023-06-15T19:28:53.368Z');

DROP TABLE IF EXISTS "blocks";
CREATE TABLE IF NOT EXISTS "blocks" (
        "id"    INTEGER PRIMARY KEY AUTOINCREMENT,
        "page_id"       INTEGER,
        "type"  TEXT, -- header, paragraph, image.
        "content"       TEXT,
        "order" INTEGER
);
INSERT INTO blocks VALUES(2,2,'paragraph','To be honest i don''t really know how to make a good pizza... but here''s a picture',2);
INSERT INTO blocks VALUES(3,2,'header','Welcome to this innovative recipe',1);
INSERT INTO blocks VALUES(4,2,'image','images/pizza.jpg',3);
INSERT INTO blocks VALUES(5,2,'paragraph','Hope you enjoyed this exhaustive recipe.. even though I''m more of a Margherita type',4);
INSERT INTO blocks VALUES(6,3,'header','Typical lunch for an average Italian student',1);
INSERT INTO blocks VALUES(7,3,'image','images/pasta.jpg',2);
INSERT INTO blocks VALUES(8,3,'paragraph',replace('I don''t really know why there are two forks... would have been perfect with a fork and spoon. \nYes, I''m that guy','\n',char(10)),3);
INSERT INTO blocks VALUES(9,4,'image','images/pancakes.jpg',1);
INSERT INTO blocks VALUES(10,4,'paragraph','Pancakes with Maple''s Syrup',2);
INSERT INTO blocks VALUES(11,4,'header','Yum',3);
INSERT INTO blocks VALUES(12,5,'image','images/tiramisu.jpg',1);
INSERT INTO blocks VALUES(13,5,'header','THE Italian Dessert',2);
INSERT INTO blocks VALUES(14,5,'image','images/tiramisu.jpg',3);
INSERT INTO blocks VALUES(15,5,'image','images/tiramisu.jpg',4);
INSERT INTO blocks VALUES(16,5,'paragraph','Triple images',5);
INSERT INTO blocks VALUES(17,6,'image','images/donuts.jpg',1);
INSERT INTO blocks VALUES(18,6,'paragraph','Vertical Images don''t look that good on a website',2);
INSERT INTO blocks VALUES(19,6,'header','But donuts are good',3);
INSERT INTO blocks VALUES(20,7,'paragraph','Are you a gym enthusiast? Then this is you main dish, probably',1);
INSERT INTO blocks VALUES(21,7,'image','images/chicken_rice.jpg',2);
INSERT INTO blocks VALUES(22,7,'paragraph','Maybe not fried chicken... but you get what i mean',3);
INSERT INTO blocks VALUES(23,7,'header','Mandatory header',4);
INSERT INTO blocks VALUES(24,7,'paragraph','I''m running out of creativeness',5);
INSERT INTO blocks VALUES(25,8,'image','images/bread.jpg',1);
INSERT INTO blocks VALUES(26,8,'paragraph','Bread?',2);
INSERT INTO blocks VALUES(27,8,'header','BREAD!',3);
INSERT INTO blocks VALUES(28,9,'paragraph','Basic but',1);
INSERT INTO blocks VALUES(29,9,'header','Good',2);
INSERT INTO blocks VALUES(30,9,'image','images/hamburger.jpg',3);
INSERT INTO blocks VALUES(31,10,'image','images/bread.jpg',2);
INSERT INTO blocks VALUES(32,10,'header','Complete Dish',1);
INSERT INTO blocks VALUES(33,10,'image','images/tiramisu.jpg',6);
INSERT INTO blocks VALUES(34,10,'paragraph','Starting with a nice loaf of bread',3);
INSERT INTO blocks VALUES(35,10,'image','images/chicken_rice.jpg',4);
INSERT INTO blocks VALUES(36,10,'paragraph','Then a chicken with rice... maybe better to hold the rice if you have bread? You do you',5);
INSERT INTO blocks VALUES(37,10,'paragraph','Then to complete a nice tiramisu glass',7);

DROP TABLE IF EXISTS "site";
CREATE TABLE IF NOT EXISTS "site" (
        "id"    INTEGER PRIMARY KEY AUTOINCREMENT,
        "title" TEXT
);
INSERT INTO site VALUES(1,'RossoPaprika');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',22);
INSERT INTO sqlite_sequence VALUES('site',1);
INSERT INTO sqlite_sequence VALUES('pages',10);
INSERT INTO sqlite_sequence VALUES('blocks',37);
COMMIT;