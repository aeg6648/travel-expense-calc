import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || '';
  const query = `${country} 여행 경비 실제`;

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ items: [], error: 'NAVER_API_KEY_MISSING' });
  }

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/blog?query=${encodeURIComponent(query)}&display=8&sort=sim`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error('Naver API error');
    const data = await res.json();

    const items = (data.items || []).map((item: Record<string, string>) => ({
      title: item.title?.replace(/<[^>]+>/g, ''),
      link: item.link,
      description: item.description?.replace(/<[^>]+>/g, ''),
      bloggerName: item.bloggername,
      postDate: item.postdate,
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [], error: 'FETCH_FAILED' });
  }
}
