CREATE TABLE survey_responses(

	purchase_amount float,
	ease_of_finding_products int,
	household_income varchar(50),
	likelihood_to_recommend int,
	browser_and_version varchar(50),
	year_of_birth int,
	email varchar(50),
	gender varchar(50),
	survey_date DATETIME,
	design_of_site int,
	postal_code int,
	comment_topic varchar(50),
	education varchar(50),
	marital_status varchar(50),
	product_selection int,
	overall_satisfaction int,
	device_type varchar(50),
	likelihood_to_buy_again int,
	comment varchar(255),
	ethnicity varchar(50),
	merchant_id int,
	comment_tone varchar(100),
	checkout_experience int,
	os_platform varchar(50),
	shipping_charges int,
	os_version varchar(10),

	PRIMARY KEY(email)

) ENGINE = InnoDB;

LOAD DATA LOCAL INFILE 'cs130.csv' INTO TABLE survey_responses FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"';