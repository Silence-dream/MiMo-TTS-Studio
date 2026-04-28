'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px 24px',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline"
          style={{
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--card-border)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
          }}
        >
          ← 返回合成工具
        </Link>

        {/* 主标题 */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 gradient-text">MiMo TTS Studio</h1>
          <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
            基于小米 MiMo-V2.5-TTS 系列模型的在线语音合成工具
          </p>
        </header>

        {/* 项目简介 */}
        <section
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--accent)' }}>
            项目简介
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--foreground)' }}>
            MiMo TTS Studio 是一个基于小米 MiMo-V2.5-TTS 系列模型打造的在线语音合成工具。
            它提供了直观友好的用户界面，让用户能够轻松地将文本转换为自然流畅的语音。
          </p>
          <p className="text-base leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
            无论您是内容创作者、开发者还是普通用户，都可以通过 MiMo TTS Studio
            快速生成高质量的语音内容， 用于视频配音、有声读物、语音助手等多种场景。
          </p>
        </section>

        {/* 三大核心功能 */}
        <section
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>
            三大核心功能
          </h2>

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
          >
            {/* 功能1：内置音色 */}
            <div
              className="rounded-xl p-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                内置音色选择
              </h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                提供多种精心调校的内置音色，包括不同性别、年龄和风格的声音。
                只需选择音色，输入文本，即可快速生成语音。
              </p>
            </div>

            {/* 功能2：声音设计 */}
            <div
              className="rounded-xl p-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                声音设计
              </h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                通过自然语言描述来设计独特的声音。只需描述您想要的声音特征，
                如"温柔的女声"、"活力的少年音"，AI 就能为您生成相应的声音。
              </p>
            </div>

            {/* 功能3：声音克隆 */}
            <div
              className="rounded-xl p-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-3xl mb-3">🔊</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                声音克隆
              </h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                上传一段音频样本，AI 就能复刻该声音的音色特征。
                适合需要保持声音一致性的场景，如系列视频、品牌语音等。
              </p>
            </div>
          </div>
        </section>

        {/* 技术特点 */}
        <section
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>
            技术特点
          </h2>

          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
          >
            {[
              { icon: '⚡', title: '快速合成', desc: '支持流式传输，实时生成语音' },
              { icon: '🎯', title: '高质量输出', desc: '24kHz 采样率，清晰自然' },
              { icon: '🔧', title: '灵活配置', desc: '支持多种音频格式和参数' },
              { icon: '💡', title: '风格控制', desc: '通过标签精确控制语音风格' },
              { icon: '📱', title: '响应式设计', desc: '完美适配各种设备' },
              { icon: '🌙', title: '暗色主题', desc: '支持暗色/亮色主题切换' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                    {item.title}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 技术栈 */}
        <section
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>
            技术栈
          </h2>

          <div className="flex flex-wrap gap-3">
            {[
              'Next.js 16',
              'React 19',
              'TypeScript',
              'Tailwind CSS 4',
              'MiMo-V2.5-TTS',
              'SSE 流式传输',
              'Web Audio API',
            ].map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: 'var(--accent-glow)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* 使用场景 */}
        <section
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>
            使用场景
          </h2>

          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
          >
            {[
              { title: '视频配音', desc: '为短视频、教程、宣传片添加专业配音' },
              { title: '有声读物', desc: '将文字内容转换为有声书，解放双眼' },
              { title: '语音助手', desc: '为智能设备和应用定制独特的语音' },
              { title: '在线教育', desc: '制作教学音频，提升学习体验' },
              { title: '游戏开发', desc: '为游戏角色生成个性化语音' },
              { title: '无障碍服务', desc: '为视障用户提供语音辅助功能' },
            ].map((scene, index) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                  {scene.title}
                </h4>
                <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                  {scene.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 快速开始 */}
        <section
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>
            快速开始
          </h2>

          <div className="space-y-4">
            {[
              {
                step: '1',
                title: '获取 API Key',
                desc: '访问 platform.xiaomimimo.com 注册并获取您的 API Key',
              },
              {
                step: '2',
                title: '配置 API',
                desc: '在工具中输入您的 API Key 和 API Endpoint',
              },
              {
                step: '3',
                title: '选择模式',
                desc: '根据需求选择内置音色、声音设计或声音克隆模式',
              },
              {
                step: '4',
                title: '输入文本',
                desc: '输入要合成的文本，可以添加风格标签控制语音效果',
              },
              {
                step: '5',
                title: '生成语音',
                desc: '点击"合成语音"按钮，等待生成完成即可播放和下载',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    color: 'white',
                  }}
                >
                  {item.step}
                </span>
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                    {item.title}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 风格标签示例 */}
        <section
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--accent)' }}>
            风格标签示例
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--foreground-secondary)' }}>
            使用风格标签可以精确控制语音的情感、语速、语调等特征
          </p>

          <div className="space-y-3">
            {[
              { tag: '(开心)', desc: '欢快愉悦的语气' },
              { tag: '(悲伤)', desc: '低沉忧伤的语气' },
              { tag: '(愤怒)', desc: '激动愤怒的语气' },
              { tag: '(温柔)', desc: '柔和亲切的语气' },
              { tag: '(严肃)', desc: '正式庄重的语气' },
              { tag: '[深吸一口气]', desc: '模拟真实呼吸声' },
              { tag: '[停顿]', desc: '在指定位置添加停顿' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <code
                  className="px-3 py-1 rounded text-sm font-mono"
                  style={{
                    background: 'var(--accent-glow)',
                    color: 'var(--accent)',
                  }}
                >
                  {item.tag}
                </code>
                <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 页脚 */}
        <footer className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            MiMo TTS Studio · 基于小米 MiMo-V2.5-TTS 系列模型
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            © 2024 MiMo TTS Studio. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
