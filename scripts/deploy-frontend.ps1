param(
  [Parameter(Mandatory = $true)] [string] $ApiBaseUrl,
  [Parameter(Mandatory = $true)] [string] $BucketName,
  [Parameter(Mandatory = $true)] [string] $DistributionId,
  [string] $Region = 'us-east-1'
)
$ErrorActionPreference = 'Stop'
$env:VITE_API_BASE_URL = $ApiBaseUrl.TrimEnd('/')
pnpm --dir frontend build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
aws s3 sync frontend/dist "s3://$BucketName" --delete --region $Region
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
aws cloudfront create-invalidation --distribution-id $DistributionId --paths '/*' --region $Region