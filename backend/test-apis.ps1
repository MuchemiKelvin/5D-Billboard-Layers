# BeamerShow API Testing with PowerShell
# Make sure the backend server is running on port 5000

$BASE_URL = "http://localhost:5000/api"
$passed = 0
$failed = 0

Write-Host "🚀 BeamerShow API Testing with PowerShell" -ForegroundColor Blue
Write-Host "📍 Base URL: $BASE_URL" -ForegroundColor Blue
Write-Host ""

# Helper function to test endpoints
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null,
        [string]$Description
    )
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Blue
    Write-Host "   $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers -Body $Data -TimeoutSec 10
        }
        
        Write-Host "   ✅ SUCCESS" -ForegroundColor Green
        $responseJson = $response | ConvertTo-Json -Depth 3
        Write-Host "   📊 Response: $($responseJson.Substring(0, [Math]::Min(200, $responseJson.Length)))..." -ForegroundColor Gray
        
        $script:passed++
    }
    catch {
        Write-Host "   ❌ FAILED" -ForegroundColor Red
        Write-Host "   💥 Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }
    
    Write-Host ""
}

# Test API Overview
Test-Endpoint -Method "GET" -Endpoint "" -Description "API Overview"

# Test Authentication
$registerData = '{"username":"testuser","email":"test@example.com","password":"TestPassword123!","company":"Test Corp","role":"operator"}'
Test-Endpoint -Method "POST" -Endpoint "/auth/register" -Data $registerData -Description "User Registration"

$loginData = '{"email":"test@example.com","password":"TestPassword123!"}'
Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Data $loginData -Description "User Login"

# Test Slots
Test-Endpoint -Method "GET" -Endpoint "/slots" -Description "Get All Slots"
Test-Endpoint -Method "GET" -Endpoint "/slots/1" -Description "Get Slot by ID"

# Test Sponsors
Test-Endpoint -Method "GET" -Endpoint "/sponsors" -Description "Get All Sponsors"
Test-Endpoint -Method "GET" -Endpoint "/sponsors/1" -Description "Get Sponsor by ID"

# Test Blocks
Test-Endpoint -Method "GET" -Endpoint "/blocks" -Description "Get All Blocks"
Test-Endpoint -Method "GET" -Endpoint "/blocks/active" -Description "Get Active Block"

# Test Analytics
Test-Endpoint -Method "GET" -Endpoint "/analytics/overview" -Description "Get Analytics Overview"

# Test AR
Test-Endpoint -Method "GET" -Endpoint "/ar/models" -Description "Get AR Models"
Test-Endpoint -Method "GET" -Endpoint "/ar/triggers" -Description "Get AR Triggers"

# Test Bidding
Test-Endpoint -Method "GET" -Endpoint "/bidding/active" -Description "Get Active Bids"

# Test Sync
Test-Endpoint -Method "GET" -Endpoint "/sync/status" -Description "Get Sync Status"

# Test Devices
Test-Endpoint -Method "GET" -Endpoint "/devices" -Description "Get All Devices"

# Test Beamer
Test-Endpoint -Method "GET" -Endpoint "/beamer/status" -Description "Get Beamer Status"

# Test iPad
Test-Endpoint -Method "GET" -Endpoint "/ipad/status" -Description "Get iPad Status"

# Print results
$total = $passed + $failed
Write-Host "📊 Test Results:" -ForegroundColor Blue
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "📊 Total: $total" -ForegroundColor Blue

if ($total -gt 0) {
    $successRate = [math]::Round(($passed / $total) * 100, 1)
    Write-Host "📈 Success Rate: $successRate%" -ForegroundColor Blue
}

Write-Host ""
if ($failed -gt 0) {
    Write-Host "💡 Some tests failed. Make sure the backend server is running on port 5000." -ForegroundColor Red
} else {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
}
