import * as cheerio from 'cheerio'

export async function fetchJobFromUrl(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    })
    if (!response.ok) {
        throw new Error(`Failed to fetch job description from ${url}, status: ${response.status}`)
    }
    const html = await response.text()
    const $ = cheerio.load(html)
    
    $('script, style, nav, header, footer, aside').remove()
    
    const selectors = [
        '#content',
        '.posting-description',
        '.job-description',
        '#job-description',
        'main',
        'article',
    ]

    for (const selector of selectors) {
        const element = $(selector)
        if (element.length && element.text().trim().length > 200) {
            return element.text().replace(/\s+/g, ' ').trim()
        }
    }
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000)
}