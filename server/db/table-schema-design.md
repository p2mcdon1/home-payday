# User Schema
- Id - GUID
- Name - string 100
- Password string 100
- CreatedOn - datetime
- DeletedOn - datetime?
- LockedUntil - datetime?
- Avatar - blob?

# Account Schema
- Id - GUID
- Name - string 100
- OwnedByUserId - GUID
- CreatedOn - datetime
- DeletedOn - datetime?
- LockedOn - datetime?
- Avatar - blob?
- LastBalanceId - GUID?

# Chore Schema
- Id - GUID
- Name - string 100
- Description string max
- Link - string 256
- Avatar - blob
- LifecycleId
- RateId

# Chore Lifecycle
- Id - GUID
- Infinite - bool
- Daily - bool
- DaysOfWeekMask - int?
- MaxPerDay - int?
- MaxPerHour - int?

# Chore Rate
- Id - GUID
- Each - double?
- Formula - string? 20
- CreatedOn
- LastModifiedOn

# Effort
- Id - GUID
- ChoreId - GUID
- LoggedByUserId - GUID
- EffortedOn - datetime
- ApprovedByUserId - GUID
- CreatedOn - datetime
- Completion - int
- Notes - string? max
- LastModfiedOn - datetime

# Payments
- Id - GUID
- EffortId - GUID
- PayedToAccountId - GUID
- PayedByUserId - GUID
- CreateOn - datetime
- Amount - double
- Notes string? max

# Withdrawal
- Id - GUID
- AccountId - GUID
- LoggedBy - GUID
- CreatedOn - datetime
- Notes - string max
- Amount - double

# Balance
- Id - GUID
- AccountId - GUID
- CalculatedOn - datetime
- Amount - double
