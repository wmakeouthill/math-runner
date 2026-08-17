# Deploy — Math Runner

VPS Oracle Cloud `163.176.146.231` · domínio `math-runner.duckdns.org` · nginx
estático. Plano validado contra a máquina real em 2026-08-17, **depois** de o
`libbs` ser desligado — o Math Runner passa a ser o único app da VPS.

Para executar isto pelo Cursor, use [`PROMPT-DEPLOY.md`](../PROMPT-DEPLOY.md).
Este documento é o "porquê" e o runbook manual.

---

## 1. Diagnóstico da máquina

Levantado via SSH, não é chute:

| Item | Estado |
| --- | --- |
| SO | Ubuntu 22.04.5 LTS, x86_64, Oracle Cloud |
| CPU | 2 vCPU AMD EPYC 7551 |
| RAM | 956 Mi total — **575 Mi livres** (nada mais rodando) |
| Swap | 1 GB |
| Disco | 88 GB, **79 GB livres** (10% usado) |
| nginx | 1.18.0 rodando, escutando 80 e 443 |
| certbot | snap 5.7.0 (timer ativo, 2×/dia) + pip 5.6.0 em `/usr/local/bin` |
| Docker | 29.3.1 ativo, **0 containers**, imagens antigas paradas |
| Node | **não instalado** |
| rsync | **não instalado** (nem na VPS nem no Git Bash local) |
| Firewall | iptables libera 22/80/443; VCN da Oracle idem (confirmado por curl externo) |
| crontab do root | **vazio** |

Sobrou do `libbs`, para limpar na Fase 0: o vhost `/etc/nginx/sites-enabled/lis`
(hoje devolvendo 502), o certificado `portal-libbs.duckdns.org` e um
certificado-lixo chamado `163.176.146.231`.

### A máquina aguenta?

**Aguenta com folga, e sobra muita.** O Math Runner é SPA estática: `dist/` tem
13 arquivos e 1.7 MB (bundle JS de 1.44 MB → **393 KB com gzip**). nginx
servindo arquivo estático custa ~0 de RAM extra — o processo já está no ar. Uma
turma de 40 alunos abrindo o jogo ao mesmo tempo dá ~16 MB de tráfego, e o PWA
cacheia tudo depois da primeira visita. Egress gratuito da Oracle é 10 TB/mês.

Com o `libbs` fora, a única restrição que resta é esta:

> **1 GB de RAM não builda este projeto.** `tsc -b && vite build` com Phaser
> passa fácil de 1 GB de pico — e nem tem Node instalado. Por isso o build roda
> na sua máquina (Node v22.17 já presente) e sobe só o `dist/`. O servidor nunca
> compila nada. É também o que mantém o deploy rápido e o servidor burro.

---

## 2. O que quebrou o TLS aqui antes (e por que não vai quebrar de novo)

Vale entender, porque a solução escolhida sai direto daqui.

Existem **dois** certbots nesta VPS:

| Binário | Versão | Plugins | Quem chama |
| --- | --- | --- | --- |
| `/usr/local/bin/certbot` | pip 5.6.0 | inclui `dns-duckdns` | ninguém (cron apagado) |
| `/snap/bin/certbot` | snap 5.7.0 | `apache`, `nginx`, `standalone`, `webroot` | `snap.certbot.renew.timer`, **ativo, 2×/dia** |

O certificado do `portal-libbs` foi emitido com `authenticator = dns-duckdns`.
O timer que realmente roda usa o certbot **snap**, que não tem esse plugin →
falhava toda vez. E o cron que tinha o binário certo chamava `certbot` sem
caminho absoluto, com PATH `/usr/bin:/bin` — nunca achou o binário. Resultado:
certificado emitido em 22/05 chegou a 3 dias do vencimento sem renovar.

**A escolha deste plano:** emitir com `/snap/bin/certbot` e autenticador
`webroot`. É o binário que o timer já executa, e `webroot` é builtin em qualquer
build de certbot. Renovação automática, **zero cron**, nada que possa sumir num
upgrade de plugin.

---

## 3. Outros riscos encontrados

### 🟡 gzip está praticamente desligado

`nginx.conf` tem `gzip on;` mas com **todos** os `gzip_types` comentados — o
default do nginx comprime só `text/html`. Sem corrigir, o bundle de 1.44 MB vai
inteiro pela rede em vez de 393 KB. É a diferença entre 3 s e 1 s no 4G do
aluno. O vhost da Fase 3 declara os tipos.

### 🟡 Cache do PWA pode congelar a versão

`registerType: 'autoUpdate'` só entrega atualização se `index.html` e `sw.js`
**não** ficarem em cache. Se saírem com cache longo, o aluno trava numa versão
velha e nenhum deploy seu chega nele. O vhost da Fase 3 trata isso.

### 🟡 IP possivelmente efêmero

Se o IP público for *Ephemeral* no console da Oracle, ele muda a cada
stop/start. É para isso que serve o cron do DuckDNS da Fase 2 — custo zero,
resolve o caso.

### 🟡 `.env` não está no `.gitignore`

O `.gitignore` cobre `*.local`, não `.env`. O token do DuckDNS **não precisa**
entrar neste repositório (ver Fase 2), mas se você criar um `.env` por outro
motivo, adicione a linha antes.

---

## 4. Arquitetura escolhida

```
Windows (build)                        VPS (só serve)
─────────────────                      ──────────────────────────────
npm test && npm run build              nginx 1.18 (já rodando)
      ↓ tar + scp                        └─ math-runner.duckdns.org
/var/www/math-runner/releases/<ts>/         root → .../current
/var/www/math-runner/current ──symlink──────┘
```

**Descartado de propósito:**

- **Docker/Compose** — nginx já está no ar ocupando 80/443. Um container para
  servir 13 arquivos estáticos adicionaria proxy, restart policy e ~50 MB de RAM
  para resolver nada.
- **Build na VPS** — 1 GB de RAM, sem Node. Ver seção 1.
- **GitHub Actions** — enquanto só você faz deploy, um script local resolve.
  Vale quando um segundo dev precisar publicar sem a sua chave SSH.
- **Certificado por DNS-01** (`dns-duckdns`) — é exatamente o que quebrou aqui.
  Ver seção 2.

**Rollback** é trocar o symlink `current` para o release anterior. Sem rebuild,
sem reload de nginx, ~1 segundo.

---

## Fase 1 — Limpar o que sobrou do `libbs`

```bash
ssh -i "C:\Users\wcaco\Downloads\nf-dux.key" ubuntu@163.176.146.231

# vhost do libbs sai do ar (reversível: basta recriar o symlink)
sudo rm -f /etc/nginx/sites-enabled/lis
sudo nginx -t && sudo systemctl reload nginx

# certificado emitido para um IP: a Let's Encrypt não emite isso, é lixo puro
# e é ele que faz a rodada inteira de renovação sair com erro
sudo /snap/bin/certbot delete --cert-name 163.176.146.231 --non-interactive

# OPCIONAL — só se o libbs não volta mesmo. Enquanto existir, vai falhar em
# toda renovação (o snap não tem dns-duckdns) e mascarar falhas de verdade.
sudo /snap/bin/certbot delete --cert-name portal-libbs.duckdns.org --non-interactive

# prova
sudo /snap/bin/certbot renew --dry-run
```

Aceite: o dry-run termina com `0 renew failure(s)` (ou "No renewals were
attempted", se você apagou os dois).

> Para trazer o libbs de volta um dia: `sudo ln -s /etc/nginx/sites-available/lis
> /etc/nginx/sites-enabled/` e reemitir o certificado. O arquivo do vhost
> continua em `sites-available`.

---

## Fase 2 — DuckDNS

Crie `math-runner` no painel do DuckDNS e pegue o token da conta.

```bash
sudo tee /opt/duckdns/math-runner.sh >/dev/null <<'EOF'
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=math-runner&token=SEU_TOKEN_AQUI&ip=" \
  | curl -k -o /opt/duckdns/math-runner.log -K -
EOF
sudo chmod 700 /opt/duckdns/math-runner.sh
sudo /opt/duckdns/math-runner.sh && cat /opt/duckdns/math-runner.log   # espera: OK

(sudo crontab -l 2>/dev/null; \
 echo '*/5 * * * * /opt/duckdns/math-runner.sh >/dev/null 2>&1 # math-runner') \
 | sudo crontab -
```

O token fica só nesse arquivo, `chmod 700`, dono root. Não vai para o
repositório e não é necessário para o certificado.

Aceite: `nslookup math-runner.duckdns.org` devolve `163.176.146.231`.

---

## Fase 3 — nginx + TLS

```bash
# estrutura de releases
sudo mkdir -p /var/www/math-runner/releases/inicial
echo ok | sudo tee /var/www/math-runner/releases/inicial/index.html
sudo ln -sfn /var/www/math-runner/releases/inicial /var/www/math-runner/current
sudo chown -R www-data:www-data /var/www/math-runner

# vhost temporário só na 80, para o desafio ACME
sudo tee /etc/nginx/sites-available/math-runner >/dev/null <<'EOF'
server {
    listen 80;
    server_name math-runner.duckdns.org;
    root /var/www/math-runner/current;
}
EOF
sudo ln -sfn /etc/nginx/sites-available/math-runner /etc/nginx/sites-enabled/math-runner
sudo nginx -t && sudo systemctl reload nginx

# certificado — binário snap + webroot, que é o que o timer já renova sozinho
sudo /snap/bin/certbot certonly --webroot \
  -w /var/www/math-runner/current -d math-runner.duckdns.org
```

Agora o vhost definitivo:

```bash
sudo tee /etc/nginx/sites-available/math-runner >/dev/null <<'EOF'
server {
    listen 80;
    server_name math-runner.duckdns.org;
    location /.well-known/acme-challenge/ { root /var/www/math-runner/current; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name math-runner.duckdns.org;

    ssl_certificate     /etc/letsencrypt/live/math-runner.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/math-runner.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root  /var/www/math-runner/current;
    index index.html;

    # nginx.conf global tem gzip_types comentado: 1.44 MB -> 393 KB
    gzip_types application/javascript text/css application/manifest+json image/svg+xml application/json;
    gzip_min_length 1024;

    # nomes com hash: pode cachear para sempre
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # entrypoints do PWA: nunca cachear, senão o aluno trava numa versão velha
    location = /index.html           { add_header Cache-Control "no-cache"; }
    location = /sw.js                { add_header Cache-Control "no-cache"; }
    location = /registerSW.js        { add_header Cache-Control "no-cache"; }
    location = /manifest.webmanifest { add_header Cache-Control "no-cache"; }

    location / { try_files $uri $uri/ /index.html; }
}
EOF
sudo nginx -t && sudo systemctl reload nginx
```

> `listen 443 ssl http2;` e não `http2 on;` — a diretiva nova só existe a partir
> do nginx 1.25, e aqui é 1.18.

Aceite: `curl -I https://math-runner.duckdns.org/` → 200.

---

## Fase 4 — Deploy e atualização (`scripts/deploy.ps1`)

O primeiro deploy e todos os seguintes são o mesmo comando: `.\scripts\deploy.ps1`.

```powershell
param(
  [string]$KeyPath = "$env:USERPROFILE\Downloads\nf-dux.key",
  [string]$Target  = "ubuntu@163.176.146.231",
  [string]$Domain  = "math-runner.duckdns.org"
)
$ErrorActionPreference = 'Stop'
$base = "/var/www/math-runner"
$rel  = Get-Date -Format 'yyyyMMdd-HHmmss'

npm test
if ($LASTEXITCODE -ne 0) { throw "testes falharam" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "build falhou" }

tar -czf dist.tgz -C dist .
scp -i $KeyPath dist.tgz "${Target}:/tmp/dist.tgz"
Remove-Item dist.tgz

# extrai no release novo, troca o symlink (atômico) e mantém só os 3 últimos
ssh -i $KeyPath $Target @"
set -e
sudo mkdir -p $base/releases/$rel
sudo tar xzf /tmp/dist.tgz -C $base/releases/$rel
sudo chown -R www-data:www-data $base/releases/$rel
sudo ln -sfn $base/releases/$rel $base/current
rm -f /tmp/dist.tgz
ls -1dt $base/releases/* | tail -n +4 | xargs -r sudo rm -rf
"@

# health check: falha o script se o site não voltar 200 com o app dentro
$r = Invoke-WebRequest "https://$Domain/?v=$rel" -UseBasicParsing -TimeoutSec 20
if ($r.StatusCode -ne 200 -or $r.Content -notmatch 'id="root"') {
  throw "health check falhou (HTTP $($r.StatusCode)) — rode o rollback"
}
Write-Host "deploy $rel OK -> https://$Domain"
```

Por que symlink em vez de sobrescrever a pasta: a troca é atômica (ninguém pega
meio deploy), o rollback não precisa de rebuild, e o nginx não precisa de reload
porque resolve o symlink a cada request (`open_file_cache` está desligado, que é
o default).

---

## Rollback

```bash
ssh -i "C:\Users\wcaco\Downloads\nf-dux.key" ubuntu@163.176.146.231 \
  "ls -1dt /var/www/math-runner/releases/* | sed -n 2p | xargs -I{} sudo ln -sfn {} /var/www/math-runner/current"
```

Volta para o release imediatamente anterior (`ls -1dt` lista por data desc,
`sed -n 2p` pega o segundo). Confira com
`readlink /var/www/math-runner/current`.

---

## Checklist

- [ ] **Fase 1** — `certbot renew --dry-run` sem falha
- [ ] **Fase 2** — `nslookup math-runner.duckdns.org` → `163.176.146.231`
- [ ] **Fase 3** — `curl -I https://math-runner.duckdns.org/` → 200
- [ ] **Fase 3** — `curl -sI .../assets/<arquivo>.js -H 'Accept-Encoding: gzip'`
      mostra `content-encoding: gzip` e `immutable`
- [ ] **Fase 3** — `curl -sI .../index.html` mostra `Cache-Control: no-cache`
- [ ] **Fase 4** — jogo abre, fase 1 joga, PWA instala pelo navegador
- [ ] **Fase 4** — segundo deploy chega no navegador sem Ctrl+F5 (prova o cache)
- [ ] **Rollback** — testado uma vez, de propósito, antes de precisar

## Se um dia apertar

- Comprimir 1.44 MB a cada request custa CPU: `gzip_static on` + gerar `.gz` no
  build resolve. Só vale se aparecer carga real.
- 393 KB de JS é Phaser inteiro num chunk só. Code splitting só compensa se o
  tempo de primeira carga virar reclamação de aluno.
