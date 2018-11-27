
param([string]$abiPath);

Get-ChildItem $abiPath -File -Filter *.json | ForEach-Object {
    Write-Output $_.FullName
    $file = Get-Content -Path $_.FullName -Raw
    $jsonObj = ConvertFrom-Json -InputObject $file
    $json = ConvertTo-Json $jsonObj.abi -Depth 4
    Out-File -FilePath $_.FullName -InputObject $json -Encoding utf8
}

