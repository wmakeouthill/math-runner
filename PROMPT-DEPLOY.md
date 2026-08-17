# Prompt de deploy para o Cursor

Antes de colar, faça só isto:

1. Crie o subdomínio **`math-runner`** no painel do <https://www.duckdns.org>
   (o IP você pode deixar como estiver — a Task 2 acerta).
2. Copie o **token** da sua conta DuckDNS (fica no topo da página).
3. No bloco abaixo, troque `<TOKEN_DUCKDNS>` pelo token.

Depois cole o bloco no chat do Cursor (modo Agent), com a pasta do projeto
aberta. Ele executa **uma task por vez** e para para você revisar.

O token não entra no repositório em momento nenhum — ele vai direto para um
arquivo `chmod 700` de dono root na VPS.

---

````
Você vai colocar o jogo Math Runner no ar. O diagnóstico da VPS já foi feito e
está em `docs/DEPLOY.md` — leia esse arquivo antes de começar, ele explica o
porquê de cada escolha. Este prompt é o roteiro de execução.

## Contexto que já está confirmado (não precisa reinvestigar)

- VPS Oracle Cloud Ubuntu 22.04, 2 vCPU, 956 Mi de RAM, 79 GB livres.
- Acesso: ssh -i "C:\Users\wcaco\Downloads\nf-dux.key" ubuntu@163.176.146.231
  (o usuário `ubuntu` tem sudo sem senha)
- nginx 1.18.0 já rodando nas portas 80 e 443. iptables e a VCN da Oracle já
  liberam 22/80/443.
- Existem DOIS certbots: `/usr/local/bin/certbot` (pip, tem dns-duckdns) e
  `/snap/bin/certbot` (snap 5.7.0, tem webroot). Quem renova de verdade é o
  `snap.certbot.renew.timer`, que roda o **snap**. Por isso todo comando de
  certbot aqui usa `/snap/bin/certbot` e autenticador `webroot`. Não troque
  para dns-duckdns: foi exatamente isso que quebrou a renovação do app
  anterior.
- Node NÃO está instalado na VPS e não deve ser. 1 GB de RAM não builda este
  projeto. O build roda na máquina Windows e só o `dist/` sobe.
- rsync não existe nem lá nem aqui. Use tar + scp.
- O app anterior (`libbs`) foi desligado pelo usuário. Sobrou sujeira para
  limpar na Task 1.

## Regras

- Uma task por vez. Ao terminar cada uma, PARE, mostre a saída dos comandos de
  aceite e espere o usuário liberar a próxima.
- Se um critério de aceite falhar, PARE e mostre o erro. Não improvise
  contorno, não pule para a task seguinte.
- Nunca escreva o token do DuckDNS em nenhum arquivo dentro do repositório,
  nem em commit, nem em log.
- Não instale Docker, Node, nem rsync na VPS. Não crie container.
- Não builde nada na VPS.

---

## Task 0 — Arquivos de config no repositório

Crie os arquivos abaixo. Nada é aplicado na VPS ainda.

**`deploy/nginx-acme.conf`** (vhost temporário, só para o desafio do
certificado):

```
server {
    listen 80;
    server_name math-runner.duckdns.org;
    root /var/www/math-runner/current;
}
```

**`deploy/nginx-math-runner.conf`** (vhost definitivo):

```
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

    # o nginx.conf global tem todos os gzip_types comentados, o que faz o nginx
    # comprimir só text/html. Sem estas duas linhas o bundle vai com 1.44 MB em
    # vez de 393 KB.
    gzip_types application/javascript text/css application/manifest+json image/svg+xml application/json;
    gzip_min_length 1024;

    # assets tem hash no nome: pode cachear para sempre
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # entrypoints do PWA nunca podem cachear, senão o autoUpdate do service
    # worker nunca chega no aluno
    location = /index.html           { add_header Cache-Control "no-cache"; }
    location = /sw.js                { add_header Cache-Control "no-cache"; }
    location = /registerSW.js        { add_header Cache-Control "no-cache"; }
    location = /manifest.webmanifest { add_header Cache-Control "no-cache"; }

    location / { try_files $uri $uri/ /index.html; }
}
```

ATENÇÃO: é `listen 443 ssl http2;`, não `http2 on;`. A diretiva nova só existe
do nginx 1.25 em diante e lá é 1.18 — `http2 on` faz o `nginx -t` falhar.

**`scripts/deploy.ps1`**:

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

# extrai no release novo, troca o symlink (atomico) e mantem so os 3 ultimos
ssh -i $KeyPath $Target @"
set -e
sudo mkdir -p $base/releases/$rel
sudo tar xzf /tmp/dist.tgz -C $base/releases/$rel
sudo chown -R www-data:www-data $base/releases/$rel
sudo ln -sfn $base/releases/$rel $base/current
rm -f /tmp/dist.tgz
ls -1dt $base/releases/* | tail -n +4 | xargs -r sudo rm -rf
"@

$r = Invoke-WebRequest "https://$Domain/?v=$rel" -UseBasicParsing -TimeoutSec 20
if ($r.StatusCode -ne 200 -or $r.Content -notmatch 'id="root"') {
  throw "health check falhou (HTTP $($r.StatusCode)) - rode o rollback"
}
Write-Host "deploy $rel OK -> https://$Domain"
```

Por último, adicione uma linha `.env` ao `.gitignore` (hoje ele só cobre
`*.local`).

Aceite: os três arquivos existem e o `.gitignore` tem a linha `.env`.
PARE aqui.

---

## Task 1 — Limpar o que sobrou do libbs na VPS

```bash
ssh -i "C:\Users\wcaco\Downloads\nf-dux.key" ubuntu@163.176.146.231
sudo rm -f /etc/nginx/sites-enabled/lis
sudo nginx -t && sudo systemctl reload nginx
sudo /snap/bin/certbot delete --cert-name 163.176.146.231 --non-interactive
sudo /snap/bin/certbot renew --dry-run
```

O certificado `163.176.146.231` foi emitido para um IP, coisa que a Let's
Encrypt não faz — é lixo, e é ele que faz toda rodada de renovação sair com
erro.

O arquivo `/etc/nginx/sites-available/lis` NÃO deve ser apagado, só o symlink
em `sites-enabled` — é assim que o usuário traz o libbs de volta se quiser.

PERGUNTE ao usuário se ele quer apagar também o certificado
`portal-libbs.duckdns.org`. Se sim:
`sudo /snap/bin/certbot delete --cert-name portal-libbs.duckdns.org --non-interactive`
Explique o trade-off: enquanto ele existir, vai falhar em toda renovação (o
certbot snap não tem o plugin dns-duckdns que ele usa) e essa falha permanente
mascara falhas de verdade. Apagar é reversível — reemitir é um comando.

Aceite: o `--dry-run` termina sem `renew failure`, ou dizendo que não havia
renovação a tentar. PARE aqui.

---

## Task 2 — DuckDNS

O token vai para a VPS sem passar pelo repositório. Crie o script num arquivo
temporário FORA do projeto, mande por scp e apague o local:

```powershell
$tmp = "$env:TEMP\duck-math-runner.sh"
@'
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=math-runner&token=<TOKEN_DUCKDNS>&ip=" | curl -k -o /opt/duckdns/math-runner.log -K -
'@ | Set-Content -Path $tmp -Encoding utf8 -NoNewline
scp -i "C:\Users\wcaco\Downloads\nf-dux.key" $tmp ubuntu@163.176.146.231:/tmp/duck-math-runner.sh
Remove-Item $tmp
```

Depois, na VPS:

```bash
sudo mv /tmp/duck-math-runner.sh /opt/duckdns/math-runner.sh
sudo chown root:root /opt/duckdns/math-runner.sh
sudo chmod 700 /opt/duckdns/math-runner.sh
sudo /opt/duckdns/math-runner.sh && cat /opt/duckdns/math-runner.log
(sudo crontab -l 2>/dev/null; echo '*/5 * * * * /opt/duckdns/math-runner.sh >/dev/null 2>&1 # math-runner') | sudo crontab -
```

O cron existe porque o IP público da Oracle pode ser efêmero e mudar num
stop/start da instância.

Aceite: o `math-runner.log` contém `OK`, e
`nslookup math-runner.duckdns.org` (rodado do Windows) devolve
`163.176.146.231`. Se o DNS ainda não propagou, espere 1 minuto e repita — não
siga sem isso, o certificado da Task 3 depende do DNS estar certo.
PARE aqui.

---

## Task 3 — Estrutura de releases e certificado

```powershell
scp -i "C:\Users\wcaco\Downloads\nf-dux.key" deploy\nginx-acme.conf ubuntu@163.176.146.231:/tmp/
```

Na VPS:

```bash
sudo mkdir -p /var/www/math-runner/releases/inicial
echo ok | sudo tee /var/www/math-runner/releases/inicial/index.html
sudo ln -sfn /var/www/math-runner/releases/inicial /var/www/math-runner/current
sudo chown -R www-data:www-data /var/www/math-runner

sudo cp /tmp/nginx-acme.conf /etc/nginx/sites-available/math-runner
sudo ln -sfn /etc/nginx/sites-available/math-runner /etc/nginx/sites-enabled/math-runner
sudo nginx -t && sudo systemctl reload nginx

curl -s http://math-runner.duckdns.org/    # tem que responder: ok

sudo /snap/bin/certbot certonly --webroot \
  -w /var/www/math-runner/current -d math-runner.duckdns.org
```

Se o certbot pedir e-mail e aceite dos termos, pergunte o e-mail ao usuário.

Aceite: `sudo /snap/bin/certbot certificates` lista
`math-runner.duckdns.org` como VALID. PARE aqui.

---

## Task 4 — vhost definitivo

```powershell
scp -i "C:\Users\wcaco\Downloads\nf-dux.key" deploy\nginx-math-runner.conf ubuntu@163.176.146.231:/tmp/
```

Na VPS:

```bash
sudo cp /tmp/nginx-math-runner.conf /etc/nginx/sites-available/math-runner
sudo nginx -t && sudo systemctl reload nginx
```

Aceite: `curl -I https://math-runner.duckdns.org/` devolve 200, e
`curl -I http://math-runner.duckdns.org/` devolve 301. PARE aqui.

---

## Task 5 — Primeiro deploy

Na máquina Windows, na raiz do projeto:

```powershell
.\scripts\deploy.ps1
```

Se der erro de execution policy, rode com
`powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1`.

Aceite: o script imprime `deploy <timestamp> OK`. PARE aqui.

---

## Task 6 — Validar e commitar

Rode e mostre a saída dos quatro:

```bash
# 1. o bundle está sendo comprimido (content-encoding: gzip)
curl -sI -H 'Accept-Encoding: gzip' https://math-runner.duckdns.org/assets/$(curl -s https://math-runner.duckdns.org/ | grep -o 'assets/index-[^"]*\.js' | head -1 | cut -d/ -f2)

# 2. o index NÃO está cacheado (Cache-Control: no-cache)
curl -sI https://math-runner.duckdns.org/index.html | grep -i cache-control

# 3. o assets ESTÁ cacheado como immutable (mesma URL do item 1)
curl -sI https://math-runner.duckdns.org/assets/<arquivo-js> | grep -i cache-control

# 4. rollback funciona: troca para o release anterior e volta
ssh -i "C:\Users\wcaco\Downloads\nf-dux.key" ubuntu@163.176.146.231 \
  "readlink /var/www/math-runner/current; ls -1dt /var/www/math-runner/releases/*"
```

Peça ao usuário para abrir https://math-runner.duckdns.org no celular,
confirmar que a fase 1 é jogável e que dá para instalar como app (PWA).

Se tudo passou, commite:
- `deploy/nginx-acme.conf`
- `deploy/nginx-math-runner.conf`
- `scripts/deploy.ps1`
- `.gitignore`
- `docs/DEPLOY.md` e `PROMPT-DEPLOY.md` se ainda não estiverem versionados

Mensagem de commit sugerida:
`chore: deploy do jogo em math-runner.duckdns.org com nginx estático`

Confirme que NENHUM arquivo commitado contém o token do DuckDNS antes de
commitar.
````

---

## Depois: como atualizar o jogo

Toda vez que quiser publicar uma versão nova:

```powershell
.\scripts\deploy.ps1
```

Roda os testes, builda, sobe, troca o symlink e faz health check. Se qualquer
etapa falhar, o script para e o site continua na versão anterior.

## Se precisar voltar atrás

```bash
ssh -i "C:\Users\wcaco\Downloads\nf-dux.key" ubuntu@163.176.146.231 \
  "ls -1dt /var/www/math-runner/releases/* | sed -n 2p | xargs -I{} sudo ln -sfn {} /var/www/math-runner/current"
```

Volta para o release anterior em ~1 segundo, sem rebuild e sem reload de nginx.
