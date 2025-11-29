## 1. Flight Information API - ERD Summary

### **Entities**
#### **Airport**
- AirportCode (PK)  
- AirportName  
- City  
- Country  

#### **VehicleType**
- VehicleTypeCode (PK)  
- SeatCount  
- SeatingPlan  
- StandardMenu  

#### **Flight**
- FlightNumber (PK)  
- FlightDateTime  
- DurationMinutes  
- DistanceKm  
- SourceAirportCode  
- DestinationAirportCode  
- VehicleTypeCode  
- SharedFlightNumber (nullable)  
- SharedCompanyName (nullable)  
- ConnectingFlightNumber (nullable)

### **Cardinalities**
- **Source Airport → Flight**  
  - One airport can be the source of many flights.  
  - Each flight has exactly one source airport.  
  *(1 → N)*

- **Destination Airport → Flight**  
  - One airport can be the destination of many flights.  
  - Each flight has exactly one destination airport.  
  *(1 → N)*

- **VehicleType → Flight**  
  - One vehicle type can be used for many flights.  
  - Each flight uses exactly one vehicle type.  
  *(1 → N)*

---

## 2. Flight Crew API – ERD Summary

### **Entities**
#### **Pilot**
- PilotId (PK)  
- Name  
- Age  
- Gender  
- Nationality  
- VehicleTypeCode  
- AllowedRangeKm  
- SeniorityLevel  

#### **Language**
- LanguageCode (PK)  
- LanguageName  

#### **VehicleType**
- VehicleTypeCode (PK)

### **Cardinalities**
- **VehicleType → Pilot (Pilot Vehicle Restriction)**  
  - One vehicle type can have many pilots.  
  - Each pilot is restricted to exactly one vehicle type.  
  *(1 → N)*

- **Pilot ↔ Language (Speaks)**  
  - One pilot can speak many languages.  
  - One language can be spoken by many pilots.  
  *(M ↔ N)*

---

## 3. Cabin Crew API – ERD Summary

### **Entities**
#### **Attendant**
- AttendantId (PK)  
- Name  
- Age  
- Gender  
- Nationality  
- AttendantType (chief, regular, chef)

#### **Language**
- LanguageCode (PK)  
- LanguageName  

#### **VehicleType**
- VehicleTypeCode (PK)

#### **Dish**
- DishId (PK)  
- DishName

### **Cardinalities**
- **Attendant ↔ Language (Speaks)**  
  - One attendant can speak many languages.  
  - One language can be spoken by many attendants.  
  *(M ↔ N)*

- **Attendant ↔ VehicleType (Participates In)**  
  - One attendant can participate in many vehicle types.  
  - One vehicle type can include many attendants.  
  *(M ↔ N)*

- **Chef ↔ Dish (Prepares)**  
  - One chef (AttendantType = chef) can prepare multiple dishes.  
  - One dish may be prepared by multiple chefs.  
  *(M ↔ N)*

> Note: SQL uses `AttendantLanguage`, `AttendantVehicle`, and `ChefDish` junction tables.

---

## 4. Passenger Information API – ERD Summary

### **Entities**
#### **Passenger**
- PassengerId (PK)  
- FlightNumber  
- Name  
- Age  
- Gender  
- Nationality  
- SeatType (business/economy)  
- SeatNumber (nullable)  
- ParentPassengerId (nullable)

### **Cardinalities**
- **Flight → Passenger**  
  - One flight can have many passengers.  
  - Each passenger belongs to exactly one flight.  
  *(1 → N)*

- **Passenger → Infant (Parent Relationship)**  
  - One passenger can have many infants (0–2 years).  
  - Each infant has exactly one parent passenger.  
  *(1 → N)*

- **Passenger ↔ Passenger (AffiliatedWith)**  
  - One passenger can specify 1–2 affiliated passengers.  
  - One passenger can be affiliated by many others.  
  *(M ↔ N)*

> SQL implementation uses `PassengerAffiliation(PassengerId, AffiliateId)`.

---

## 5. Main System – ERD Summary

### **Entities**
#### **SystemUser**
- UserId (PK)  
- Username  
- PasswordHash  
- Role (staff / passenger)

#### **Roster**
- RosterId (PK)  
- FlightNumber  
- GeneratedAt  
- RosterJson

#### **Flight**  
- FlightNumber (PK)  
*(Minimal representation; full details stored in Flight Information API.)*

### **Cardinalities**
- **Flight → Roster**  
  - One flight can have multiple rosters (regenerations).  
  - Each roster corresponds to exactly one flight.  
  *(1 → N)*

> `SystemUser` is independent; it supports authentication and does not require relationships in the ERD.

---

## Notes
- **Nullable** = attribute exists in the schema but may contain NULL values.  
- **M:N relationships** are represented as junction tables in SQL.  
- Conceptual ERD and SQL schema differ slightly for implementation purposes.

