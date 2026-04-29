import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_API_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
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
