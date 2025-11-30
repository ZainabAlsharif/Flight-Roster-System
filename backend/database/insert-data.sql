--inserting values into db

--airports
INSERT INTO Airport (AirportCode, AirportName, City, Country) VALUES
('IST', 'Istanbul Airport', 'Istanbul', 'Turkey'),
('SAW', 'Sabiha Gokcen International Airport', 'Istanbul', 'Turkey'),
('MJI', 'Mitiga International Airport', 'Tripoli', 'Libya'),
('ALG', 'Houari Boumediene Airport', 'Algiers', 'Algeria'),
('BGW', 'Baghdad International Airport', 'Baghdad', 'Iraq'),
('CAI', 'Cairo International Airport', 'Cairo', 'Egypt');

--vehicle types
INSERT INTO VehicleType (VehicleTypeCode, SeatCount, SeatingPlan, StandardMenu) VALUES
('B737', 166, 'Business: 16 seats, Economy: 150 seats', 'Light meals, beverages, snacks'),
('A320', 180, 'Business: 20 seats, Economy: 160 seats', 'Full meal service, beverages, snacks'),
('B777', 244, 'First: 8 seats, Business: 35 seats, Economy: 201 seats', 'Premium meal service, beverages, snacks');

--flights (airlines alpabet is FT for FlyTech)
INSERT INTO Flight (FlightNumber, FlightDateTime, DurationMinutes, DistanceKm, SourceAirportCode, DestinationAirportCode, VehicleTypeCode, SharedFlightNumber, SharedCompanyName, ConnectingFlightNumber) VALUES
('FT101', '2025-12-10 12:00:00', 120, 1500, 'IST', 'SAW', 'A320', NULL, NULL, NULL),
('FT201', '2025-12-12 15:30:00', 180, 2500, 'MJI', 'ALG', 'B777', 'EK201', 'Emirates', NULL),
('FT303', '2025-12-15 09:00:00', 90, 800, 'BGW', 'CAI', 'B737', NULL, NULL, NULL),
('FT405', '2025-12-18 17:00:00', 240, 3000, 'CAI', 'IST', 'A380', NULL, NULL, 'FT101');

--languages
INSERT INTO Language (LanguageCode, LanguageName) VALUES
('EN', 'English'),
('AR', 'Arabic'),
('TR', 'Turkish'),
('FR', 'French');

--pilots
INSERT INTO Pilot (PilotId, Name, Age, Gender, Nationality, VehicleTypeCode, AllowedRangeKm, SeniorityLevel) VALUES
(1, 'Abdulsallam Alaradi', 45, 'Male', 'Libya', 'A320', 6000, 'senior'),
(2, 'Aya Sabah', 42, 'Female', 'Iraq', 'A320', 6000, 'senior'),
(3, 'Karim Benali', 28, 'Male', 'Algeria', 'A320', 6000, 'junior'),
(4, 'Selin Arslan', 27, 'Female', 'Turkey', 'A320', 6000, 'junior');

--pilot languages
INSERT INTO PilotLanguage (PilotId, LanguageCode) VALUES
(1, 'AR'), (1, 'EN'),
(2, 'AR'), (2, 'EN'),(2, 'TR'), 
(3, 'FR'), (3, 'EN'), 
(4, 'TR'), (4, 'EN');

--cabin crew (atttendants)
INSERT INTO Attendant (AttendantId, Name, Age, Gender, Nationality, AttendantType) VALUES
(1, 'Hassan Alawi', 32, 'Male', 'Egypt', 'flight attendant'),
(2, 'Merve Yildiz', 29, 'Female', 'Turkey', 'flight attendant'),
(3, 'Fatima Almansouri', 30, 'Female', 'Libya', 'chef'),
(4, 'Omar Nasser', 31, 'Male', 'Iraq', 'chef'),
(5, 'Lina Saeed', 28, 'Female', 'Algeria', 'flight attendant'),
(6, 'Yusuf Karim', 33, 'Male', 'Egypt', 'flight attendant'),
(7, 'Ayla Demir', 27, 'Female', 'Turkey', 'chef'),
(8, 'Sami Haddad', 34, 'Male', 'Iraq', 'chef'),
(9, 'Nadia Bensalem', 30, 'Female', 'Algeria', 'flight attendant'),
(10, 'Salma Farouk', 29, 'Female', 'Libya', 'flight attendant'),
(11, 'Omar Zaki', 35, 'Male', 'Egypt', 'chef'),
(12, 'Dina Youssef', 28, 'Female', 'Turkey', 'chef');

--attendant languages
INSERT INTO AttendantLanguage (AttendantId, LanguageCode) VALUES
(1, 'AR'), (1, 'EN'),
(2, 'AR'), (2, 'EN'), (2, 'TR'),
(3, 'TR'), (3, 'EN'),
(4, 'AR'), (4, 'EN'),
(5, 'FR'), (5, 'EN'),
(6, 'AR'), (6, 'EN'),
(7, 'TR'), (7, 'EN'),
(8, 'AR'), (8, 'EN'),
(9, 'FR'), (9, 'EN'),
(10, 'TR'), (10, 'EN'),
(11, 'AR'), (11, 'EN'),
(12, 'TR'), (12, 'EN');

--attendant vehicle assignments
INSERT INTO AttendantVehicle (AttendantId, VehicleTypeCode) VALUES
(1, 'A320'),
(2, 'A320'),
(3, 'A320'),
(4, 'A320'),
(5, 'B777'),
(6, 'B777'),
(7, 'B777'),
(8, 'B777'),
(9, 'B737'),
(10, 'B737'),
(11, 'B737'),
(12, 'B737');

--dishes
INSERT INTO Dish (DishId, DishName) VALUES
(1, 'Chicken Kabsa'),
(2, 'Vegetable Biryani'),
(3, 'Caesar Salad'),
(4, 'Grilled Fish with Lemon Butter'),
(5, 'Pasta Primavera');

--chef dishes
INSERT INTO ChefDish (AttendantId, DishId) VALUES
(1, 1), (1, 2),
(4, 1), (4, 3),
(3, 4), (3, 5),
(8, 2), (8, 5),
(11, 1), (11, 4),
(12, 3), (12, 5);

--passengers
INSERT INTO Passenger (PassengerId, FlightNumber, Name, Age, Gender, Nationality, SeatType, SeatNumber, ParentPassengerId) VALUES
(1, 'FT101', 'Omar Ali', 30, 'Male', 'Turkey', 'Economy', '12A', NULL),
(3, 'FT201', 'Youssef Hassan', 40, 'Male', 'Egypt', 'Business', '2A', NULL),
(4, 'FT201', 'Amina Youssef', 2, 'Female', 'Egypt', 'Economy', '15C', 3),
(5, 'FT303', 'Sara Ahmed', 25, 'Female', 'Iraq', 'Economy', '14D', NULL),
(6, 'FT405', 'Lina Mustafa', 35, 'Female', 'Libya', 'Business', '3B', NULL);

--passenger affiliations
INSERT INTO PassengerAffiliation (PassengerId, AffiliateId) VALUES
(1, 2),
(3, 4),
(3, 5),
(6, 1);

---system users
INSERT INTO SystemUser (UserId, Username, PasswordHash, Role) VALUES
(1, 'pilot_abdulsallam', 'TBD', 'staff'),
(2, 'pilot_aya', 'TBD', 'staff'),
(3, 'pilot_karim', 'TBD', 'staff'),
(4, 'pilot_selin', 'TBD', 'staff'),
(5, 'attendant_hassan', 'TBD', 'staff'),
(6, 'attendant_merve', 'TBD', 'staff'),
(7, 'attendant_fatima', 'TBD', 'staff'),
(8, 'attendant_omar', 'TBD', 'staff'),
(9, 'passenger_omar', 'TBD', 'passenger'),
(10, 'passenger_youssef', 'TBD', 'passenger'),
(11, 'passenger_sara', 'TBD', 'passenger'),
(12, 'passenger_lina', 'TBD', 'passenger');

--rosters
INSERT INTO Roster (RosterId, FlightNumber, GeneratedAt, RosterJson) VALUES
(1, 'FT101', '2025-11-01 10:00:00', '{"PilotId":1,"Attendants":[1,2,3,4]}'),
(2, 'FT201', '2025-11-05 11:00:00', '{"PilotId":2,"Attendants":[5,6,7,8]}'),
(3, 'FT303', '2025-11-10 09:30:00', '{"PilotId":3,"Attendants":[1,6,9,10]}'),
(4, 'FT405', '2025-11-15 14:00:00', '{"PilotId":4,"Attendants":[2,5,11,12]}');