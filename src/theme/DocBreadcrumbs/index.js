import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import {markdownPath} from '../../markdown-path.mjs';
import AiDocsMenu from '../../components/AiDocsMenu';
import styles from './styles.module.css';

export default function DocBreadcrumbsWrapper(props) {
  const {metadata} = useDoc();
  const {siteConfig: {baseUrl}} = useDocusaurusContext();

  return (
    <div className={styles.row}>
      <div><DocBreadcrumbs {...props} /></div>
      {!metadata.unlisted &&
        <AiDocsMenu key={metadata.permalink} pageUrl={markdownPath(metadata.permalink, baseUrl)} baseUrl={baseUrl} />}
    </div>
  );
}
