# Global workflow
When the page is loaded, the user can only pick one territory (Singapore, UK, France)

When a territory is loaded, the current portfolio is loaded from databricks : 
  - All buildings (under active contracts)
    - Latitude
    - Longitude
  - All devices (under active contracts) along with
    - Building_id 
    - mechanic_id
    - type
    - amount (price)
  - All mechanics
    - id
    - country
    - full name
    - Home address (that we don't have for now)

A base scenario is computed where : 

- Each device is pinned to it's current mechanic
- A plan is made 

# Questions
- Maybe exclude SSI for now ? (Since we can't know in db if an engineer does SSI or not)
