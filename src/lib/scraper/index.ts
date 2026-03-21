import * as cheerio from 'cheerio'

export interface ScrapeResult {
  price: number | null
  currency: string
  error: string | null
  html?: string
}

// Common price selectors across popular ecommerce platforms
const PRICE_SELECTORS = [
  '[data-price]',
  '[itemprop="price"]',
  '.price',
  '.product-price',
  '.offer-price',
  '#priceblock_ourprice',
  '#priceblock_dealprice',
  '.a-price .a-offscreen',
  '[data-automation="buybox-price"]',
  '.ProductMeta__Price',
  '.price__current',
  '.product__price',
  'span.amount',
  '.woocommerce-Price-amount',
]

const CURRENCY_PATTERNS: Record<string, string> = {
  '$': 'AUD',
  'AU$': 'AUD',
  'USD': 'USD',
  'GBP': 'GBP',
  '£': 'GBP',
  '€': 'EUR',
  'NZD': 'NZD',
  'NZ$': 'NZD',
}

function extractPrice(text: string): { price: number | null; currency: string } {
  // Remove whitespace and normalize
  const cleaned = text.trim().replace(/\s+/g, ' ')

  // Try to find currency symbol
  let currency = 'AUD'
  for (const [symbol, code] of Object.entries(CURRENCY_PATTERNS)) {
    if (cleaned.includes(symbol)) {
      currency = code
      break
    }
  }

  // Extract numeric price
  const priceMatch = cleaned.match(/[\d,]+\.?\d*/g)
  if (!priceMatch) return { price: null, currency }

  // Take first match, remove commas, parse as float
  const price = parseFloat(priceMatch[0].replace(/,/g, ''))

  if (isNaN(price) || price <= 0) return { price: null, currency }

  return { price, currency }
}

export async function scrapePrice(url: string): Promise<ScrapeResult> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CompetitelBot/1.0; +https://competitel.com)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return {
        price: null,
        currency: 'AUD',
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Try each selector
    for (const selector of PRICE_SELECTORS) {
      const element = $(selector).first()
      if (element.length === 0) continue

      // Check data-price attribute first
      const dataPriceAttr = element.attr('data-price') || element.attr('content')
      if (dataPriceAttr) {
        const price = parseFloat(dataPriceAttr)
        if (!isNaN(price) && price > 0) {
          return { price, currency: 'AUD', error: null }
        }
      }

      const text = element.text()
      if (text) {
        const { price, currency } = extractPrice(text)
        if (price !== null) {
          return { price, currency, error: null }
        }
      }
    }

    // Fallback: look for structured data (JSON-LD)
    const jsonLdScripts = $('script[type="application/ld+json"]')
    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const jsonLd = JSON.parse($(jsonLdScripts[i]).html() || '{}')
        const offers = jsonLd.offers || (jsonLd['@graph'] && jsonLd['@graph'].find((g: { offers?: unknown }) => g.offers))
        if (offers) {
          const price = offers.price || (Array.isArray(offers) && offers[0]?.price)
          if (price) {
            return {
              price: parseFloat(price),
              currency: offers.priceCurrency || 'AUD',
              error: null,
            }
          }
        }
      } catch {
        // Continue
      }
    }

    return {
      price: null,
      currency: 'AUD',
      error: 'Could not find price on page. Please enter manually.',
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { price: null, currency: 'AUD', error: 'Request timed out after 10 seconds' }
    }
    return {
      price: null,
      currency: 'AUD',
      error: err instanceof Error ? err.message : 'Unknown scraping error',
    }
  }
}
