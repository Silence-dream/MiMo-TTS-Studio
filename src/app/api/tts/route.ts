import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_API_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';

// 简单的内存速率限制（滑动窗口，每 IP 每分钟最多 30 次请求）
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Map 过大时清理已过期的 IP 条目，防止内存泄漏
  if (rateLimitMap.size > 100) {
    for (const [key, ts] of rateLimitMap) {
      if (ts.filter((t) => now - t < RATE_WINDOW_MS).length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 速率限制
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }

    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: '缺少 API Key' }, { status: 400 });
    }

    const body = await request.json();
    const { apiEndpoint, ...rest } = body;

    const targetUrl = apiEndpoint || DEFAULT_API_ENDPOINT;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(rest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        // 忽略解析错误
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    // 非流式响应
    if (!rest.stream) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // 流式响应
    const encoder = new TextEncoder();
    const reader = response.body?.getReader();

    if (!reader) {
      return NextResponse.json({ error: '无法读取流式响应' }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('代理请求失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '代理请求失败' },
      { status: 500 }
    );
  }
}
