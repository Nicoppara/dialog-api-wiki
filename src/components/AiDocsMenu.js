import React, {useState} from 'react';
import styles from './AiDocsMenu.module.css';

async function readMarkdown(url) {
  const response = await fetch(url);
  if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('Markdown unavailable');
  }
  return response.text();
}

export default function AiDocsMenu({pageUrl, baseUrl}) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const indexUrl = baseUrl + 'llms.txt';
  const fullUrl = baseUrl + 'llms-full.txt';

  async function copy(url, confirmation) {
    setBusy(true);
    setStatus('正在复制…');
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        // 保留点击授权，浏览器等待内容准备好后写入剪贴板
        const content = readMarkdown(url).then((text) => new Blob([text], {type: 'text/plain'}));
        await navigator.clipboard.write([new ClipboardItem({'text/plain': content})]);
      } else {
        await navigator.clipboard.writeText(await readMarkdown(url));
      }
      setStatus(confirmation);
    } catch {
      setStatus('复制失败，可打开下方文件手动复制。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className={styles.menu}>
      <summary>供 AI 使用</summary>
      <div className={styles.panel}>
        <button type="button" disabled={busy} onClick={() => copy(pageUrl, '已复制当前页 Markdown。')}>
          复制当前页 Markdown
        </button>
        <button type="button" disabled={busy} onClick={() => copy(fullUrl, '已复制全站 Markdown。')}>
          复制全站 Markdown
        </button>
        <hr />
        <a href={pageUrl} target="_blank" rel="noopener">打开当前页 Markdown</a>
        <a href={indexUrl} target="_blank" rel="noopener">文档索引（llms.txt）</a>
        <a href={fullUrl} target="_blank" rel="noopener">全站文档（llms-full.txt）</a>
        <div className={styles.status} role="status">{status}</div>
      </div>
    </details>
  );
}
