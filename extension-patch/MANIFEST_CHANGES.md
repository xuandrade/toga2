# Alterações no manifest.json da extensão

## 1. Adicionar permissões

No array `"permissions"`, garanta que estas três estejam presentes:

```json
"permissions": [
  "declarativeNetRequest",
  "storage",
  "tabs"
]
```

> Se a extensão já usa `webRequest` para bloquear sites, mantenha essa permissão
> e avise — podemos adaptar o `toga-background-module.js` para usar `webRequest` em vez de
> `declarativeNetRequest`.

## 2. Registrar o content script

```json
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["toga-bridge.js"],
    "run_at": "document_start"
  }
]
```

> Se já existir um array `content_scripts`, adicione apenas o objeto acima ao array.

## 3. Registrar o background (se ainda não tiver)

**Manifest V3:**
```json
"background": {
  "service_worker": "background.js"
}
```

**Manifest V2:**
```json
"background": {
  "scripts": ["background.js"],
  "persistent": false
}
```

> Se já tiver um background.js/service_worker, NÃO substitua —
> apenas cole o conteúdo de `toga-background-module.js` no **final** do arquivo existente.

## 4. Copiar os arquivos

| Arquivo deste patch          | Destino na extensão         |
|------------------------------|-----------------------------|
| `toga-bridge.js`             | raiz da extensão            |
| `toga-background-module.js`  | cole no final do background.js |

## Manifest V3 mínimo de exemplo

```json
{
  "manifest_version": 3,
  "name": "Meu Bloqueador",
  "version": "1.0",
  "permissions": [
    "declarativeNetRequest",
    "storage",
    "tabs"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["toga-bridge.js"],
      "run_at": "document_start"
    }
  ]
}
```

## Como testar

1. Acesse `chrome://extensions/`, ative **Modo de desenvolvedor**
2. Clique em **Recarregar** na extensão
3. Abra o TOGA no navegador
4. Abra o console (F12) e verifique se aparece:
   - Mensagem `{ source: 'TOGA_BLOCKER', type: 'READY', active: false }` no console do app
5. Clique em **🛡 Blindado** — o painel de modo de foco deve aparecer agora
