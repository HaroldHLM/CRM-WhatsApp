import { createRoot } from 'react-dom/client';
import { App } from '../ui/App';
import { styles } from '../ui/styles';
import { StorageLeadsRepository } from '../repositories/leads.repo';
import { reserveTopBar } from './layout';

const HOST_ID = 'crm-wa-root';

function mount() {
  if (document.getElementById(HOST_ID)) return;
  const host = document.createElement('div');
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles;
  shadow.appendChild(style);
  const container = document.createElement('div');
  shadow.appendChild(container);

  reserveTopBar(host);

  const repo = new StorageLeadsRepository(chrome.storage.local);
  createRoot(container).render(<App repo={repo} />);
}

mount();
