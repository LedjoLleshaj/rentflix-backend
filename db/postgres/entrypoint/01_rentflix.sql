\connect postgres

-- Create the table of users
CREATE TABLE public.users (
    username VARCHAR(50) UNIQUE NOT NULL,
    password_md5 CHAR(32) NOT NULL,
    customer_id INTEGER NOT NULL
);

-- Only for testing purposes:
-- username: "text_0X" (X = 1..9)
-- password: "test"
-- TODO: remove this
INSERT INTO
        public.users(username, password_md5, customer_id)
    VALUES
        ('test_01', '098f6bcd4621d373cade4e832627b4f6', 1),
        ('test_02', '098f6bcd4621d373cade4e832627b4f6', 2),
        ('test_03', '098f6bcd4621d373cade4e832627b4f6', 3),
        ('test_04', '098f6bcd4621d373cade4e832627b4f6', 4),
        ('test_05', '098f6bcd4621d373cade4e832627b4f6', 5),
        ('test_06', '098f6bcd4621d373cade4e832627b4f6', 6),
        ('test_07', '098f6bcd4621d373cade4e832627b4f6', 7),
        ('test_08', '098f6bcd4621d373cade4e832627b4f6', 8),
        ('test_09', '098f6bcd4621d373cade4e832627b4f6', 9);
;
