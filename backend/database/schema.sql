PRAGMA foreign_keys = ON;

------------------------------------------------------------
-- 1. FLIGHT INFORMATION API TABLES
------------------------------------------------------------

-- AIRPORT
CREATE TABLE Airport (
    AirportCode TEXT PRIMARY KEY,
    AirportName TEXT NOT NULL,
    City TEXT NOT NULL,
    Country TEXT NOT NULL
);

-- VEHICLE TYPE
CREATE TABLE VehicleType (
    VehicleTypeCode TEXT PRIMARY KEY,
    SeatCount INTEGER NOT NULL,
    SeatingPlan TEXT NOT NULL,
    StandardMenu TEXT NOT NULL
);

-- FLIGHT
CREATE TABLE Flight (
    FlightNumber TEXT PRIMARY KEY,
    FlightDateTime TEXT NOT NULL,
    DurationMinutes INTEGER NOT NULL,
    DistanceKm INTEGER NOT NULL,

    SourceAirportCode TEXT NOT NULL,
    DestinationAirportCode TEXT NOT NULL,
    VehicleTypeCode TEXT NOT NULL,

    SharedFlightNumber TEXT,        -- nullable
    SharedCompanyName TEXT,         -- nullable
    ConnectingFlightNumber TEXT,    -- nullable

    FOREIGN KEY (SourceAirportCode) REFERENCES Airport(AirportCode),
    FOREIGN KEY (DestinationAirportCode) REFERENCES Airport(AirportCode),
    FOREIGN KEY (VehicleTypeCode) REFERENCES VehicleType(VehicleTypeCode)
);

------------------------------------------------------------
-- 2. FLIGHT CREW API TABLES
------------------------------------------------------------

-- LANGUAGE
CREATE TABLE Language (
    LanguageCode TEXT PRIMARY KEY,
    LanguageName TEXT NOT NULL
);

-- PILOT
CREATE TABLE Pilot (
    PilotId INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Age INTEGER NOT NULL,
    Gender TEXT NOT NULL,
    Nationality TEXT NOT NULL,
    VehicleTypeCode TEXT NOT NULL,
    AllowedRangeKm INTEGER NOT NULL,
    SeniorityLevel TEXT NOT NULL,

    FOREIGN KEY (VehicleTypeCode) REFERENCES VehicleType(VehicleTypeCode)
);

-- M:N — PILOT SPEAKS LANGUAGE
CREATE TABLE PilotLanguage (
    PilotId INTEGER NOT NULL,
    LanguageCode TEXT NOT NULL,

    PRIMARY KEY (PilotId, LanguageCode),
    FOREIGN KEY (PilotId) REFERENCES Pilot(PilotId),
    FOREIGN KEY (LanguageCode) REFERENCES Language(LanguageCode)
);

------------------------------------------------------------
-- 3. CABIN CREW API TABLES
------------------------------------------------------------

-- ATTENDANT
CREATE TABLE Attendant (
    AttendantId INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Age INTEGER NOT NULL,
    Gender TEXT NOT NULL,
    Nationality TEXT NOT NULL,
    AttendantType TEXT NOT NULL    -- chief / regular / chef
);

-- M:N — ATTENDANT SPEAKS LANGUAGE
CREATE TABLE AttendantLanguage (
    AttendantId INTEGER NOT NULL,
    LanguageCode TEXT NOT NULL,

    PRIMARY KEY (AttendantId, LanguageCode),
    FOREIGN KEY (AttendantId) REFERENCES Attendant(AttendantId),
    FOREIGN KEY (LanguageCode) REFERENCES Language(LanguageCode)
);

-- M:N — ATTENDANT PARTICIPATES IN VEHICLE TYPES
CREATE TABLE AttendantVehicle (
    AttendantId INTEGER NOT NULL,
    VehicleTypeCode TEXT NOT NULL,

    PRIMARY KEY (AttendantId, VehicleTypeCode),
    FOREIGN KEY (AttendantId) REFERENCES Attendant(AttendantId),
    FOREIGN KEY (VehicleTypeCode) REFERENCES VehicleType(VehicleTypeCode)
);

-- DISH
CREATE TABLE Dish (
    DishId INTEGER PRIMARY KEY,
    DishName TEXT NOT NULL
);

-- M:N — CHEF PREPARES DISH
CREATE TABLE ChefDish (
    AttendantId INTEGER NOT NULL,
    DishId INTEGER NOT NULL,

    PRIMARY KEY (AttendantId, DishId),
    FOREIGN KEY (AttendantId) REFERENCES Attendant(AttendantId),
    FOREIGN KEY (DishId) REFERENCES Dish(DishId)
);

------------------------------------------------------------
-- 4. PASSENGER INFORMATION API TABLES
------------------------------------------------------------

-- PASSENGER
CREATE TABLE Passenger (
    PassengerId INTEGER PRIMARY KEY,
    TicketID TEXT NOT NULL UNIQUE,
    FlightNumber TEXT NOT NULL,
    Name TEXT NOT NULL,
    Age INTEGER NOT NULL,
    Gender TEXT NOT NULL,
    Nationality TEXT NOT NULL,
    SeatType TEXT NOT NULL,          -- business/economy
    SeatNumber TEXT,                 -- nullable
    ParentPassengerId INTEGER,       -- nullable

    FOREIGN KEY (FlightNumber) REFERENCES Flight(FlightNumber),
    FOREIGN KEY (ParentPassengerId) REFERENCES Passenger(PassengerId)
);

-- M:N — PASSENGER AFFILIATION (SELF RELATIONSHIP)
CREATE TABLE PassengerAffiliation (
    PassengerId INTEGER NOT NULL,
    AffiliateId INTEGER NOT NULL,

    PRIMARY KEY (PassengerId, AffiliateId),
    FOREIGN KEY (PassengerId) REFERENCES Passenger(PassengerId),
    FOREIGN KEY (AffiliateId) REFERENCES Passenger(PassengerId)
);

------------------------------------------------------------
-- 5. MAIN SYSTEM TABLES
------------------------------------------------------------

-- SYSTEM USERS
CREATE TABLE SystemUser (
    UserId INTEGER PRIMARY KEY,
    Username TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT NOT NULL               -- staff / passenger
);

-- ROSTER
CREATE TABLE Roster (
    RosterId INTEGER PRIMARY KEY,
    FlightNumber TEXT NOT NULL,
    GeneratedAt TEXT NOT NULL,
    RosterJson TEXT NOT NULL,        -- can store full crew/passenger assignments

    FOREIGN KEY (FlightNumber) REFERENCES Flight(FlightNumber)
);
