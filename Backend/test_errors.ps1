Write-Host "`nTesting API Error Handling...`n"

# Test 1: Normal operation
Write-Host "1. Testing normal operation..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/recommendations" -Method Post
    Write-Host "Success! Received" $response.data.Count "recommendations"
} catch {
    Write-Host "Error:" $_.Exception.Message
}

# Test 2: Missing file scenario
Write-Host "`n2. Testing missing file scenario..."
if (Test-Path "data_sample.csv") {
    Rename-Item "data_sample.csv" "data_sample_temp.csv"
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/recommendations" -Method Post
        Write-Host "Response:" $response
    } catch {
        Write-Host "Expected error received:" $_.Exception.Message
    }
    Rename-Item "data_sample_temp.csv" "data_sample.csv"
}

# Test 3: Empty file scenario
Write-Host "`n3. Testing empty file scenario..."
$null | Set-Content "empty.csv"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/recommendations" -Method Post
    Write-Host "Response:" $response
} catch {
    Write-Host "Expected error received:" $_.Exception.Message
}
Remove-Item "empty.csv"

Write-Host "`nTesting completed!"
