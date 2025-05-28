# Web Scraper API

A unified API for web scraping with multiple engines (Playwright, Puppeteer, etc.)

## Features

- Abstract different scraping engines behind a unified API
- Switch between engines (Playwright, Puppeteer) with minimal configuration
- Extract text and attributes from web pages
- Take screenshots and generate PDFs
- Execute custom JavaScript in the page context
- Full API documentation with Swagger

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Available Endpoints

### GET /scraper/engines
Get available scraping engines and the default engine.

### POST /scraper/extract
Extract data from a webpage using CSS selectors.

### POST /scraper/screenshot
Take a screenshot of a webpage.

### POST /scraper/pdf
Generate a PDF of a webpage.

### POST /scraper/evaluate
Evaluate JavaScript code in the context of a webpage.

## Configuration

The application can be configured using environment variables:

- `DEFAULT_ENGINE`: The default scraping engine to use if not specified in requests ('playwright' or 'puppeteer')
- `PORT`: The port the API will listen on (default: 3000)

## Example Usage

### Extract Data

```bash
curl -X POST http://localhost:3000/scraper/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selector": "h1, p",
    "engine": "playwright"
  }'
```

### Take Screenshot

```bash
curl -X POST http://localhost:3000/scraper/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "screenshotOptions": {
      "fullPage": true,
      "type": "jpeg",
      "quality": 80
    }
  }' \
  --output screenshot.jpg
```

### Generate PDF

```bash
curl -X POST http://localhost:3000/scraper/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "pdfOptions": {
      "format": "A4",
      "printBackground": true
    }
  }' \
  --output webpage.pdf
```

### Evaluate JavaScript

```bash
curl -X POST http://localhost:3000/scraper/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "script": "return Array.from(document.querySelectorAll(\"h1, p\")).map(el => el.textContent)"
  }'
```

## License

This project is [MIT licensed](LICENSE).