const GRAPH_BASE_URL = 'https://graph.instagram.com';
const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/responsibleindividuals/';

const SAMPLE_POSTS = [
    {
        id: 'sample-1',
        caption: 'Learning circle as part of our Responsible Individuals launch week.',
        media_url: 'https://cdn.jsdelivr.net/gh/ImpashreeShetty/responsible-individuals-website@main/Launchphotos/IMG_2760.jpeg',
        permalink: INSTAGRAM_PROFILE_URL,
        timestamp: '2025-07-19T10:00:00+05:30',
        media_type: 'IMAGE'
    },
    {
        id: 'sample-2',
        caption: 'WASH demo with volunteers and teachers at GHPS Bachenahatti.',
        media_url: 'https://cdn.jsdelivr.net/gh/ImpashreeShetty/responsible-individuals-website@main/Launchphotos/IMG_2758.jpeg',
        permalink: INSTAGRAM_PROFILE_URL,
        timestamp: '2025-08-05T09:00:00+05:30',
        media_type: 'IMAGE'
    },
    {
        id: 'sample-3',
        caption: 'STEM lab restock underway thanks to our community donors.',
        media_url: 'https://cdn.jsdelivr.net/gh/ImpashreeShetty/responsible-individuals-website@main/Launchphotos/IMG_2764.jpeg',
        permalink: INSTAGRAM_PROFILE_URL,
        timestamp: '2025-08-22T14:30:00+05:30',
        media_type: 'IMAGE'
    }
];

const respond = (statusCode, body = {}) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
});

const normalisePost = (post = {}) => ({
    id: post.id,
    caption: post.caption || '',
    mediaUrl: post.media_url || post.thumbnail_url || '',
    permalink: post.permalink || INSTAGRAM_PROFILE_URL,
    timestamp: post.timestamp || new Date().toISOString(),
    mediaType: post.media_type || 'IMAGE'
});

exports.handler = async (event) => {
    const limitParam = parseInt(event.queryStringParameters?.limit, 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 12) : 4;
    const userId = process.env.INSTAGRAM_USER_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!userId || !accessToken) {
        const fallback = SAMPLE_POSTS.slice(0, limit).map((post) => normalisePost(post));
        return respond(200, fallback);
    }

    const fields = ['id', 'caption', 'media_url', 'permalink', 'thumbnail_url', 'media_type', 'timestamp'].join(',');
    const url = `${GRAPH_BASE_URL}/${encodeURIComponent(userId)}/media?fields=${encodeURIComponent(fields)}&access_token=${accessToken}&limit=${limit}`;

    try {
        const apiRes = await fetch(url);
        if (!apiRes.ok) {
            const text = await apiRes.text();
            console.error('Instagram API error:', apiRes.status, text);
            throw new Error(`Instagram API ${apiRes.status}`);
        }

        const payload = await apiRes.json();
        const posts = Array.isArray(payload.data) ? payload.data : [];

        if (!posts.length) {
            return respond(200, SAMPLE_POSTS.slice(0, limit).map((post) => normalisePost(post)));
        }

        return respond(200, posts.slice(0, limit).map((post) => normalisePost(post)));
    } catch (error) {
        console.error('Unable to fetch Instagram feed', error);
        const fallback = SAMPLE_POSTS.slice(0, limit).map((post) => normalisePost(post));
        return respond(200, fallback);
    }
};
