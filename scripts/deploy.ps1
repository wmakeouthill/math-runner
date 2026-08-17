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
