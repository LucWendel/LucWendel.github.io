# Basketball Stats Database

Deze folder bevat de basketball statistieken data in JSON formaat.

## Bestanden:
- `basketball-stats.json` - Hoofddatabase met alle wedstrijd data
- `backup-*.json` - Automatische backups van de data

## Gebruik:
De data wordt automatisch gesynchroniseerd tussen devices via GitHub.

## Data Structuur:
```json
{
  "exportDate": "2025-08-13T10:30:00.000Z",
  "totalGames": 5,
  "games": [
    {
      "date": "2025-08-13",
      "players": [...],
      "stats": {...}
    }
  ]
}
```
