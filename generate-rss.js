// Generate RSS feed XML
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate RSS feed XML
 * This creates a basic RSS feed. The dynamic one with all articles is at /rss page
 */
function generateRSSFeed() {
  const baseUrl = 'https://www.policydrift.live';
  const currentDate = new Date().toUTCString();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
  xml += '  <channel>\n';
  xml += '    <title>PolicyDrift News</title>\n';
  xml += `    <link>${baseUrl}</link>\n`;
  xml += '    <description>Stay updated with the latest news, insights, and perspectives from around the world</description>\n';
  xml += '    <language>en-us</language>\n';
  xml += `    <lastBuildDate>${currentDate}</lastBuildDate>\n`;
  xml += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;
  xml += '    <image>\n';
  xml += `      <url>${baseUrl}/logo.png</url>\n`;
  xml += '      <title>PolicyDrift News</title>\n';
  xml += `      <link>${baseUrl}</link>\n`;
  xml += '    </image>\n';
  
  // Add a sample item
  xml += '    <item>\n';
  xml += '      <title>Welcome to PolicyDrift News</title>\n';
  xml += `      <link>${baseUrl}</link>\n`;
  xml += '      <description>Your trusted source for breaking news and in-depth analysis</description>\n';
  xml += `      <pubDate>${currentDate}</pubDate>\n`;
  xml += `      <guid>${baseUrl}</guid>\n`;
  xml += '    </item>\n';
  
  xml += '  </channel>\n';
  xml += '</rss>';
  
  return xml;
}

async function main() {
  try {
    console.log('Generating RSS feed...');
    const rssXML = generateRSSFeed();
    
    const publicDir = path.join(__dirname, 'public');
    const rssPath = path.join(publicDir, 'rss.xml');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(rssPath, rssXML, 'utf8');
    console.log('✅ RSS feed generated successfully at:', rssPath);
    console.log('📝 Size:', (rssXML.length / 1024).toFixed(2), 'KB');
    console.log('ℹ️  Dynamic RSS with all articles available at /rss page');
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error);
    process.exit(1);
  }
}

main();
