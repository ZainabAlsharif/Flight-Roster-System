--inserting values into db

--airports
INSERT INTO Airport (AirportCode, AirportName, City, Country) VALUES
('IST', 'Istanbul Airport', 'Istanbul', 'Turkey'),
('SAW', 'Sabiha Gokcen International Airport', 'Istanbul', 'Turkey'),
('MJI', 'Mitiga International Airport', 'Tripoli', 'Libya'),
('ALG', 'Houari Boumediene Airport', 'Algiers', 'Algeria'),
('BGW', 'Baghdad International Airport', 'Baghdad', 'Iraq'),
('CAI', 'Cairo International Airport', 'Cairo', 'Egypt');

INSERT INTO VehicleType (VehicleTypeCode, SeatCount, SeatingPlan, StandardMenu) VALUES
('B737', 189, 'Business: 20 seats, Economy: 169 seats', 'Light meals, beverages, snacks'),
('A320', 194, 'Business: 24 seats, Economy: 170 seats', 'Full meal service, beverages, snacks'),
('A380', 555, 'First: 14 seats, Business: 80 seats, Economy: 461 seats', 'Premium meal service, wines, champagne, gourmet meals');


--flights (airlines alpabet is FT for FlyTech)
INSERT INTO Flight (FlightNumber, FlightDateTime, DurationMinutes, DistanceKm, SourceAirportCode, DestinationAirportCode, VehicleTypeCode, SharedFlightNumber, SharedCompanyName, ConnectingFlightNumber) VALUES
('FT101', '2025-12-10 12:00:00', 120, 1500, 'IST', 'SAW', 'A320', NULL, NULL, NULL),
('FT201', '2025-12-12 15:30:00', 180, 2500, 'MJI', 'ALG', 'A380', 'EK201', 'Emirates', NULL),
('FT303', '2025-12-15 09:00:00', 90, 800, 'BGW', 'CAI', 'B737', NULL, NULL, NULL),
('FT405', '2025-12-18 17:00:00', 240, 3000, 'CAI', 'IST', 'A380', NULL, NULL, 'SV101');

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
(4, 'Omar Nasser', 31, 'Male', 'Iraq', 'chef');

--attendant languages
INSERT INTO AttendantLanguage (AttendantId, LanguageCode) VALUES
(1, 'AR'), (1, 'EN'),
(2, 'AR'), (2, 'EN'), (2, 'TR'),
(3, 'TR'), (3, 'EN'),
(4, 'AR'), (4, 'EN');

--attendant vehicle assignments
INSERT INTO AttendantVehicle (AttendantId, VehicleTypeCode) VALUES
(1, 'A320'),
(2, 'A320'),
(3, 'A320'),
(4, 'A320');

--dishes
INSERT INTO Dish (DishId, DishName) VALUES
(1, 'Chicken Kabsa'),
(2, 'Vegetable Biryani'),
(3, 'Caesar Salad');


--chef dishes
INSERT INTO ChefDish (AttendantId, DishId) VALUES
(1, 1), (1, 2),
(4, 1), (4, 3);

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
(1, 'FT101', '2025-11-01 10:00:00', '{"pilots": [1, 2], "attendants": [1, 2], "passengers": [1]}'),
(2, 'FT201', '2025-11-05 14:00:00', '{"pilots": [3, 4], "attendants": [3, 4], "passengers": [3, 4]}'),
(3, 'FT303', '2025-11-10 09:00:00', '{"pilots": [1, 3], "attendants": [1, 2], "passengers": [5]}'),
(4, 'FT405', '2025-11-15 16:00:00', '{"pilots": [2, 4], "attendants": [3, 4], "passengers": [6]}');
