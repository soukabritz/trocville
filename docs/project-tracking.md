# Project tracking

## Done

- Layered API (routes → controllers → services → repositories)
- PostgreSQL schema + Docker Compose
- Auth: bcrypt + JWT
- Item CRUD, filters, owner checks
- Trade offers with status workflow
- Messages limited to trade participants
- Expo app: register, login, listing, my trades, profile, logout
- Backend tests: health, validation, authz on items/messages, trade and message services
- English docs for the CCP brief

## In progress / next

- Create an item from the mobile app
- Accept / refuse a trade in the UI
- Conversation screen
- Persist JWT (SecureStore)
- More tests with a real database
- GitHub remote + regular commits
- CCP3 (deploy / CI) later

## How to justify this at the oral

“Repositories only talk to SQL. Services hold the rules (owner, participant, status). The mobile screens call the API and show loading / error / empty states.”
