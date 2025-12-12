--inserting values into db

--airports
INSERT OR REPLACE INTO Airport (AirportCode, AirportName, City, Country) VALUES
('IST', 'Istanbul Airport', 'Istanbul', 'Turkey'),
('SAW', 'Sabiha Gokcen International Airport', 'Istanbul', 'Turkey'),
('MJI', 'Mitiga International Airport', 'Tripoli', 'Libya'),
('ALG', 'Houari Boumediene Airport', 'Algiers', 'Algeria'),
('BGW', 'Baghdad International Airport', 'Baghdad', 'Iraq'),
('CAI', 'Cairo International Airport', 'Cairo', 'Egypt');

--vehicle types
INSERT OR REPLACE INTO VehicleType (VehicleTypeCode, SeatCount, SeatingPlan, StandardMenu) VALUES
('B737', 166, 'Business: 16 seats, Economy: 150 seats', 'Light meals, beverages, snacks'),
('A320', 180, 'Business: 20 seats, Economy: 160 seats', 'Full meal service, beverages, snacks'),
('B777', 244, 'First: 8 seats, Business: 35 seats, Economy: 201 seats', 'Premium meal service, beverages, snacks');

--flights (airlines alpabet is FT for FlyTech)
INSERT OR REPLACE INTO Flight (FlightNumber, FlightDateTime, DurationMinutes, DistanceKm, SourceAirportCode, DestinationAirportCode, VehicleTypeCode, SharedFlightNumber, SharedCompanyName, ConnectingFlightNumber) VALUES
('FT101', '2025-12-10 12:00:00', 120, 1500, 'IST', 'SAW', 'A320', NULL, NULL, NULL),
('FT201', '2025-12-12 15:30:00', 180, 2500, 'MJI', 'ALG', 'B777', 'EK201', 'Emirates', NULL),
('FT303', '2025-12-15 09:00:00', 90, 800, 'BGW', 'CAI', 'B737', NULL, NULL, NULL),
('FT405', '2025-12-18 17:00:00', 240, 3000, 'CAI', 'IST', 'A320', NULL, NULL, 'FT101');

--languages
INSERT OR REPLACE INTO Language (LanguageCode, LanguageName) VALUES
('EN', 'English'),
('AR', 'Arabic'),
('TR', 'Turkish'),
('FR', 'French');

--pilots
INSERT OR REPLACE INTO Pilot (PilotId, Name, Age, Gender, Nationality, VehicleTypeCode, AllowedRangeKm, SeniorityLevel) VALUES
(1, 'Abdulsallam Alaradi', 45, 'Male', 'Libya', 'A320', 6000, 'Senior'),
(2, 'Aya Sabah', 42, 'Female', 'Iraq', 'A320', 6000, 'Senior'),
(3, 'Karim Benali', 28, 'Male', 'Algeria', 'A320', 6000, 'Junior'),
(4, 'Selin Arslan', 27, 'Female', 'Turkey', 'A320', 6000, 'Junior');

--pilot languages
INSERT OR REPLACE INTO PilotLanguage (PilotId, LanguageCode) VALUES
(1, 'AR'), (1, 'EN'),
(2, 'AR'), (2, 'EN'),(2, 'TR'), 
(3, 'FR'), (3, 'EN'), 
(4, 'TR'), (4, 'EN');

--cabin crew (atttendants)
INSERT OR REPLACE INTO Attendant (AttendantId, Name, Age, Gender, Nationality, AttendantType) VALUES
(1, 'Hassan Alawi', 32, 'Male', 'Egypt', 'Flight attendant'),
(2, 'Merve Yildiz', 29, 'Female', 'Turkey', 'Flight attendant'),
(3, 'Fatima Almansouri', 30, 'Female', 'Libya', 'Chef'),
(4, 'Omar Nasser', 31, 'Male', 'Iraq', 'Chef'),
(5, 'Lina Saeed', 28, 'Female', 'Algeria', 'Flight attendant'),
(6, 'Yusuf Karim', 33, 'Male', 'Egypt', 'Flight attendant'),
(7, 'Ayla Demir', 27, 'Female', 'Turkey', 'Chef'),
(8, 'Sami Haddad', 34, 'Male', 'Iraq', 'Chef'),
(9, 'Nadia Bensalem', 30, 'Female', 'Algeria', 'Flight attendant'),
(10, 'Salma Farouk', 29, 'Female', 'Libya', 'Flight attendant'),
(11, 'Omar Zaki', 35, 'Male', 'Egypt', 'Chef'),
(12, 'Dina Youssef', 28, 'Female', 'Turkey', 'Chef');

--attendant languages
INSERT OR REPLACE INTO AttendantLanguage (AttendantId, LanguageCode) VALUES
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
INSERT OR REPLACE INTO AttendantVehicle (AttendantId, VehicleTypeCode) VALUES
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
INSERT OR REPLACE INTO Dish (DishId, DishName) VALUES
(1, 'Chicken Kabsa'),
(2, 'Vegetable Biryani'),
(3, 'Caesar Salad'),
(4, 'Grilled Fish with Lemon Butter'),
(5, 'Pasta Primavera');

--chef dishes
INSERT OR REPLACE INTO ChefDish (AttendantId, DishId) VALUES
(4, 1), (4, 3),
(3, 4), (3, 5),
(7, 2), (7, 5),
(8, 2), (8, 5),
(11, 1), (11, 4),
(12, 3), (12, 5);

--passengers
INSERT OR REPLACE INTO Passenger (PassengerId, FlightNumber, TicketID, Name, Age, Gender, Nationality, SeatType, SeatNumber, ParentPassengerId) VALUES
(1, 'FT101', '00001', 'Omar Ali', 35, 'Male', 'Turkey', 'Business', '1A', NULL),
(2, 'FT101', '00002', 'Zeynep Ali', 32, 'Female', 'Turkey', 'Business', '1B', NULL),
(7, 'FT101', '00007', 'Elif Ali', 8, 'Female', 'Turkey', 'Business', '1C', 1),
(8, 'FT101', '00008', 'Can Ali', 5, 'Male', 'Turkey', 'Business', '2A', 1),
(9, 'FT101', '00009', 'Ahmet Yilmaz', 45, 'Male', 'Turkey', 'Economy', '10A', NULL),
(3, 'FT201', '00003', 'Youssef Hassan', 40, 'Male', 'Egypt', 'Business', '2A', NULL),
(4, 'FT201', '00004', 'Amina Youssef', 2, 'Female', 'Egypt', 'Economy', '15C', 3),
(5, 'FT303', '00005', 'Sara Ahmed', 25, 'Female', 'Iraq', 'Economy', '14D', NULL),
(6, 'FT405', '00006', 'Lina Mustafa', 35, 'Female', 'Libya', 'Business', '3B', NULL);

--passenger affiliations
INSERT OR REPLACE INTO PassengerAffiliation (PassengerId, AffiliateId) VALUES
(1, 2),
(2, 1),
(7, 8),
(8, 7),
(3, 4),
(6, 1);

---system users
-- Passwords are hashed with bcrypt (saltRounds=10)
INSERT OR REPLACE INTO SystemUser (UserId, Username, Password, Role) VALUES
(1, 'pilot_abdulsallam', '$2b$10$c01qtNQhw82Rz.4jLwRchOp7twyo4vZPaQ.mm1zI2Z2c8YTu3QuhW', 'staff'), --pilot1
(2, 'pilot_aya', '$2b$10$sr0MDZPbWMWcAzge0g90f.sIztNP4W/NL/NIOFuCqTlu0p5vg.06O', 'staff'), --pilot2
(3, 'pilot_karim', '$2b$10$uZhdSASW6Aapcgrn7ZOOOuxT8isneyTeJB3cexi4U7NudnUYs9FPe', 'staff'), --pilot3
(4, 'pilot_selin', '$2b$10$HrRlZsNHOmT3XJFELDR/5O127YBrHHM.dBISkbQYr7.EAvsjHWk6C', 'staff'), --pilot4
(5, 'attendant_hassan', '$2b$10$mEO.SBuVvm1j2tFmDHQosuNkcohvQ9SvtGA7/mts.qiTTlV3RBpsi', 'staff'), --attendant5
(6, 'attendant_merve', '$2b$10$6xUMej249btgOiGirTRqbO56Z5VAf5boVeIl9hf1Vs.6GOaoQs35e', 'staff'), --attendant6
(7, 'attendant_fatima', '$2b$10$Nmr4NRsu3fqW.U4R.ARzJ.6V55lY1IpxZ9dEZ0WA5kN1bPVW18SUG', 'staff'); --attendant7

--rosters
INSERT OR REPLACE INTO Roster (RosterId, FlightNumber, GeneratedAt, RosterJson) VALUES
(1, 'FT101', '11-01-2025 / 10:00:00', '{"pilots":[1,3],"attendants":[1,2,3,4]}'),
(2, 'FT201', '05-11-2025 / 11:00:00', '{"pilots":[2],"attendants":[5,6,7,8]}'),
(3, 'FT303', '10-11-2025 / 09:30:00', '{"pilots":[3],"attendants":[1,6,9,10]}'),
(4, 'FT405', '15-11-2025 / 14:00:00', '{"pilots":[4],"attendants":[2,5,11,12]}');