// netlify/functions/recommend.js
// This runs on Netlify's servers — the GROQ_KEY env variable is NEVER sent to the browser

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let mood;
  try {
    ({ mood } = JSON.parse(event.body));
    if (!mood) throw new Error('Missing mood');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const GROQ_KEY = process.env.GROQ_KEY; // ← stored safely in Netlify dashboard, never in code
  if (!GROQ_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured on server' }) };
  }

  const prompt = `Think of yourself as a world class movie analyst, someone who lives and breathes movies.

The user will describe the kind of movie/series they want to watch. Based on that, recommend exactly 5 titles.

User's request: "${mood}"

For each recommendation return ONLY a JSON array (no markdown, no backticks, no explanation outside the array):
[
  {
    "title": "Movie or Series Name",
    "type": "Movie or Web Series",
    "seasons": null,
    "cast": "Top 3-4 actors",
    "runtime": "e.g. 2h 18m or 45 min/ep",
    "language": "e.g. Hindi, English, Korean",
    "imdb": "e.g. 8.2/10 or null",
    "rottentomatoes": "e.g. 94% or null",
    "platform": "OTT platform available in India",
    "reason": "One sentence on why this matches what they asked for"
  }
]

Only recommend titles you are highly confident exist and are accurate. Do not hallucinate titles or cast. OTT platform must be specific to India (Netflix, Prime Video, JioCinema, Disney+ Hotstar, SonyLIV, ZEE5, MX Player, Apple TV+). If seasons > 1, set seasons to the number. Return only the JSON array, nothing else.`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await groqRes.json();

    if (!data.choices) {
      throw new Error('Groq API error: ' + JSON.stringify(data));
    }

    const raw = data.choices[0].message.content;
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not parse response from AI');

    const movies = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movies)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
