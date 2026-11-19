import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {markdownPath} from '../src/markdown-path.mjs';

const markdown = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, {fences: true});

export default function aiDocs() {
  let version;

  return {
    name: 'ai-docs',
    allContentLoaded({allContent}) {
      version = allContent['docusaurus-plugin-content-docs'].default.loadedVersions.find((entry) => entry.isLast);
    },
    async postBuild({siteDir, outDir, siteConfig, baseUrl}) {
      const docs = version.docs.filter((doc) => !doc.unlisted);
      const byId = new Map(docs.map((doc) => [doc.id, doc]));
      const bySource = new Map(docs.map((doc) => [doc.source, doc]));
      const byRoute = new Map(docs.map((doc) => [withoutSlash(doc.permalink), doc]));
      const docUrl = (doc) => new URL(markdownPath(doc.permalink, baseUrl), siteConfig.url);
      const write = async (file, content) => {
        const destination = path.join(outDir, file);
        await mkdir(path.dirname(destination), {recursive: true});
        await writeFile(destination, content, 'utf8');
      };
      const contentById = new Map();
      for (const doc of docs) {
        const pageUrl = new URL(doc.permalink, siteConfig.url);
        const filename = path.join(siteDir, doc.source.slice('@site/'.length));
        const raw = await readFile(filename, 'utf8');
        const tree = markdown.parse(raw.replace(/^\uFEFF/, '').replace(/^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, ''));

        rewriteLinks(tree, (url, kind) => {
          if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url;
          const target = new URL(url.startsWith('/') ? baseUrl + url.slice(1) : url, pageUrl);
          if (kind === 'image') return target.href;
          const relativePath = url.split(/[?#]/, 1)[0];
          const source = path.posix.join(path.posix.dirname(doc.source), decodeURI(relativePath));
          const linked = bySource.get(source) ?? byRoute.get(withoutSlash(decodeURI(target.pathname)));
          return linked ? docUrl(linked).href + target.search + target.hash : target.href;
        });
        const title = tree.children[0]?.type === 'heading' && tree.children[0].depth === 1
          ? tree.children.shift()
          : {type: 'heading', depth: 1, children: [{type: 'text', value: doc.title}]};
        const heading = markdown.stringify({type: 'root', children: [title]}).trim();
        const content = [heading, '原文：' + pageUrl.href, markdown.stringify(tree).trim()].join('\n\n').trimEnd();
        contentById.set(doc.id, content);
        await write(docUrl(doc).pathname.slice(baseUrl.length), content + '\n');
      }

      const header = '# ' + siteConfig.title + '\n\n> Paper 原生对话框库的中文手册与接入示例。';
      const readOrder = new Set();
      const sections = outline(Object.values(version.sidebars).flat(), byId, docUrl, readOrder);
      const remaining = docs.filter((doc) => !readOrder.has(doc.id));
      if (remaining.length) sections.push('## 其他文档', remaining.map((doc) => indexEntry(doc, docUrl)).join('\n'));
      const fullUrl = new URL(baseUrl + 'llms-full.txt', siteConfig.url).href;
      const index = [header, '每项链接指向对应页面的 Markdown。[查看完整手册](' + fullUrl + ')。', ...sections];
      const full = [...readOrder, ...remaining.map((doc) => doc.id)].map((id) => contentById.get(id));
      await write('llms.txt', index.join('\n\n') + '\n');
      await write('llms-full.txt', [header, ...full].join('\n\n---\n\n') + '\n');
    },
  };
}

function withoutSlash(url) {
  return url.replace(/\/+$/, '');
}

function rewriteLinks(node, resolve) {
  if (node.type === 'link' || node.type === 'image' || node.type === 'definition') {
    node.url = resolve(node.url, node.type);
  }
  for (const child of node.children ?? []) rewriteLinks(child, resolve);
}

function indexEntry(doc, docUrl) {
  const title = doc.title.replace(/[\[\]]/g, '\\$&');
  const link = '- [' + title + '](' + docUrl(doc).href + ')';
  const description = doc.frontMatter.description;
  return description ? link + ': ' + description : link;
}

function outline(items, byId, docUrl, readOrder, depth = 2) {
  const sections = [];
  let entries = [];
  for (const item of items) {
    if (item.type === 'category') {
      if (entries.length) sections.push(entries.join('\n'));
      entries = [];
      sections.push('#'.repeat(depth) + ' ' + item.label);
      const children = item.link?.type === 'doc' ? [item.link, ...item.items] : item.items;
      sections.push(...outline(children, byId, docUrl, readOrder, depth + 1));
    } else if (item.type === 'doc' || item.type === 'ref') {
      const doc = byId.get(item.id);
      if (!doc || readOrder.has(doc.id)) continue;
      entries.push(indexEntry(doc, docUrl));
      readOrder.add(doc.id);
    }
  }
  if (entries.length) sections.push(entries.join('\n'));
  return sections;
}
