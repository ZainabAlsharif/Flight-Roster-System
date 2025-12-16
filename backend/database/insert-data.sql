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
INSERT OR REPLACE INTO Pilot (PilotId, Name, Age, Gender, Nationality, VehicleTypeCode, AllowedRangeKm, SeniorityLevel, PilotSeatNumber) VALUES
(1001, 'Abdulsallam Alaradi', 45, 'Male', 'Libya', 'A320', 6000, 'Senior', 'P1'),
(1002, 'Aya Sabah', 42, 'Female', 'Iraq', 'A320', 6000, 'Senior', 'P1'),
(1003, 'Karim Benali', 28, 'Male', 'Algeria', 'A320', 6000, 'Junior', 'P2'),
(1004, 'Selin Arslan', 27, 'Female', 'Turkey', 'A320', 6000, 'Junior', 'P2');
--pilot languages
INSERT OR REPLACE INTO PilotLanguage (PilotId, LanguageCode) VALUES
(1001, 'AR'), (1001, 'EN'),
(1002, 'AR'), (1002, 'EN'),(1002, 'TR'), 
(1003, 'FR'), (1003, 'EN'), 
(1004, 'TR'), (1004, 'EN');

--cabin crew (atttendants)
INSERT OR REPLACE INTO Attendant (AttendantId, Name, Age, Gender, Nationality, AttendantType, AttendantSeatNumber) VALUES
(2001, 'Hassan Alawi', 32, 'Male', 'Egypt', 'Flight attendant', 'A1'),
(2002, 'Merve Yildiz', 29, 'Female', 'Turkey', 'Flight attendant', 'A2'),
(2003, 'Fatima Almansouri', 30, 'Female', 'Libya', 'Chef', 'A3'),
(2004, 'Omar Nasser', 31, 'Male', 'Iraq', 'Chef', 'A1'),
(2005, 'Lina Saeed', 28, 'Female', 'Algeria', 'Flight attendant', 'A2'),
(2006, 'Yusuf Karim', 33, 'Male', 'Egypt', 'Flight attendant', 'A3'),
(2007, 'Ayla Demir', 27, 'Female', 'Turkey', 'Chef', 'A1'),
(2008, 'Sami Haddad', 34, 'Male', 'Iraq', 'Chef', 'A2'),
(2009, 'Nadia Bensalem', 30, 'Female', 'Algeria', 'Flight attendant', 'A3'),
(2010, 'Salma Farouk', 29, 'Female', 'Libya', 'Flight attendant', 'A1'),
(2011, 'Omar Zaki', 35, 'Male', 'Egypt', 'Chef', 'A2'),
(2012, 'Dina Youssef', 28, 'Female', 'Turkey', 'Chef', 'A3');

--attendant languages
INSERT OR REPLACE INTO AttendantLanguage (AttendantId, LanguageCode) VALUES
(2001, 'AR'), (2001, 'EN'),
(2002, 'AR'), (2002, 'EN'), (2002, 'TR'),
(2003, 'TR'), (2003, 'EN'),
(2004, 'AR'), (2004, 'EN'),
(2005, 'FR'), (2005, 'EN'),
(2006, 'AR'), (2006, 'EN'),
(2007, 'TR'), (2007, 'EN'),
(2008, 'AR'), (2008, 'EN'),
(2009, 'FR'), (2009, 'EN'),
(2010, 'TR'), (2010, 'EN'),
(2011, 'AR'), (2011, 'EN'),
(2012, 'TR'), (2012, 'EN');

--attendant vehicle assignments
INSERT OR REPLACE INTO AttendantVehicle (AttendantId, VehicleTypeCode) VALUES
(2001, 'A320'),
(2002, 'A320'),
(2003, 'A320'),
(2004, 'A320'),
(2005, 'B777'),
(2006, 'B777'),
(2007, 'B777'),
(2008, 'B777'),
(2009, 'B737'),
(2010, 'B737'),
(2011, 'B737'),
(2012, 'B737');

--dishes
INSERT OR REPLACE INTO Dish (DishId, DishName) VALUES
(1, 'Chicken Kabsa'),
(2, 'Vegetable Biryani'),
(3, 'Caesar Salad'),
(4, 'Grilled Fish with Lemon Butter'),
(5, 'Pasta Primavera');

--chef dishes
INSERT OR REPLACE INTO ChefDish (AttendantId, DishId) VALUES
(2004, 1), (2004, 3),
(2003, 4), (2003, 5),
(2007, 2), (2007, 5),
(2008, 2), (2008, 5),
(2011, 1), (2011, 4),
(2012, 3), (2012, 5);

--passengers
INSERT OR REPLACE INTO Passenger (PassengerId, FlightNumber, TicketID, Name, Age, Gender, Nationality, SeatType, SeatNumber, ParentPassengerId) VALUES
(3001, 'FT101', '00001', 'Omar Ali', 35, 'Male', 'Turkey', 'Business', '1A', NULL),
(3002, 'FT101', '00002', 'Zeynep Ali', 32, 'Female', 'Turkey', 'Business', '1B', NULL),
(3007, 'FT101', '00007', 'Elif Ali', 8, 'Female', 'Turkey', 'Business', '1C', 3001),
(3008, 'FT101', '00008', 'Can Ali', 5, 'Male', 'Turkey', 'Business', '2A', 3001),
(3009, 'FT101', '00009', 'Ahmet Yilmaz', 45, 'Male', 'Turkey', 'Economy', '10A', NULL),
(3003, 'FT201', '00003', 'Youssef Hassan', 40, 'Male', 'Egypt', 'Business', '2A', NULL),
(3004, 'FT201', '00004', 'Amina Youssef', 2, 'Female', 'Egypt', 'Economy', '15C', 3003),
(3005, 'FT303', '00005', 'Sara Ahmed', 25, 'Female', 'Iraq', 'Economy', '14D', NULL),
(3006, 'FT405', '00006', 'Lina Mustafa', 35, 'Female', 'Libya', 'Business', '3B', NULL);

--passenger affiliations
INSERT OR REPLACE INTO PassengerAffiliation (PassengerId, AffiliateId) VALUES
(3001, 3002),
(3002, 3001),
(3007, 3008),
(3008, 3007),
(3003, 3004),
(3006, 3001);

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
(1, 'FT101', '11-01-2025 / 10:00:00', '{"pilots":[1001,1003],"attendants":[2001,2002,2003,2004]}'),
(2, 'FT201', '05-11-2025 / 11:00:00', '{"pilots":[1002],"attendants":[2005,2006,2007,2008]}'),
(3, 'FT303', '10-11-2025 / 09:30:00', '{"pilots":[1003],"attendants":[2001,2006,2009,2010]}'),
(4, 'FT405', '15-11-2025 / 14:00:00', '{"pilots":[1004],"attendants":[2002,2005,2011,2012]}');