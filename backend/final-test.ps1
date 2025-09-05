# BeamerShow API Test Script - FINAL VERSION
Write-Host "BeamerShow API Test Suite - FINAL" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"
$testResults = @{
    Total = 0
    Passed = 0
    Failed = 0
}

function Test-ApiEndpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $testResults.Total++
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        $config = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Body) {
            $config.Body = $Body
        }
        
        $response = Invoke-WebRequest @config -TimeoutSec 10
        Write-Host "SUCCESS $Name - Status: $($response.StatusCode)" -ForegroundColor Green
        
        try {
            $jsonResponse = $response.Content | ConvertFrom-Json
            $jsonResponse | ConvertTo-Json -Depth 2 | Write-Host -ForegroundColor Gray
        } catch {
            Write-Host $response.Content -ForegroundColor Gray
        }
        
        $testResults.Passed++
        return $response
    }
    catch {
        Write-Host "ERROR $Name - Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
        return $null
    }
    
    Write-Host ""
}

# Test 1: Health Check
Write-Host "1. HEALTH CHECK" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Test-ApiEndpoint -Name "Health Check" -Method "GET" -Endpoint "/health"

# Test 2: API Overview
Write-Host "2. API OVERVIEW" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Test-ApiEndpoint -Name "API Overview" -Method "GET" -Endpoint "/api"

# Test 3: Authentication - Register (FIXED: Using unique email)
Write-Host "3. AUTHENTICATION - REGISTER (FIXED)" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    username = "testuser$timestamp"
    email = "test$timestamp@example.com"
    password = "testpass123"
    role = "SPONSOR"
} | ConvertTo-Json

$registerResponse = Test-ApiEndpoint -Name "User Registration" -Method "POST" -Endpoint "/api/auth/register" -Body $registerBody

# Test 4: Authentication - Login (FIXED: Using the same email)
Write-Host "4. AUTHENTICATION - LOGIN (FIXED)" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Magenta
$loginBody = @{
    username = "testuser$timestamp"
    password = "testpass123"
} | ConvertTo-Json

$loginResponse = Test-ApiEndpoint -Name "User Login" -Method "POST" -Endpoint "/api/auth/login" -Body $loginBody

# Extract JWT token for authenticated requests
$authToken = $null
if ($loginResponse) {
    try {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        $authToken = $loginData.data.token
        Write-Host "JWT Token extracted for authenticated requests" -ForegroundColor Green
    } catch {
        Write-Host "Could not extract JWT token" -ForegroundColor Yellow
    }
}

# Test 5: Companies API
Write-Host "5. COMPANIES API" -ForegroundColor Magenta
Write-Host "================" -ForegroundColor Magenta
Test-ApiEndpoint -Name "Get All Companies" -Method "GET" -Endpoint "/api/companies"

# Test 6: Slots API
Write-Host "6. SLOTS API" -ForegroundColor Magenta
Write-Host "============" -ForegroundColor Magenta
Test-ApiEndpoint -Name "Get All Slots" -Method "GET" -Endpoint "/api/slots"

# Test 7: Bidding API - Get all bids
Write-Host "7. BIDDING API - GET ALL BIDS" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta
Test-ApiEndpoint -Name "Get All Bids" -Method "GET" -Endpoint "/api/bidding"

# Test 8: Bidding API - Get active bids (FIXED: Check if route exists)
Write-Host "8. BIDDING API - GET ACTIVE BIDS" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Test-ApiEndpoint -Name "Get Active Bids" -Method "GET" -Endpoint "/api/bidding/active"

# Test 9: Create a Company (FIXED: Using unique name)
Write-Host "9. CREATE COMPANY (FIXED)" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
$companyBody = @{
    name = "Test Company $timestamp Ltd"
    category = "Technology"
    subcategory = "Software Development"
    tier = "PREMIUM"
    industry = "Information Technology"
    website = "https://testcompany$timestamp.com"
    description = "A test company created for API testing purposes"
    founded = 2020
    headquarters = "Nairobi, Kenya"
    employeeCount = "50-100"
    revenue = "KES 10M - 50M"
    maxBidAmount = 1000000
} | ConvertTo-Json

$companyResponse = Test-ApiEndpoint -Name "Create Company" -Method "POST" -Endpoint "/api/companies" -Body $companyBody

# Extract company ID for further tests
$companyId = $null
if ($companyResponse) {
    try {
        $companyData = $companyResponse.Content | ConvertFrom-Json
        $companyId = $companyData.data.id
        Write-Host "Company ID extracted: $companyId" -ForegroundColor Green
    } catch {
        Write-Host "Could not extract company ID" -ForegroundColor Yellow
    }
}

# Test 10: Update a Slot (FIXED: Update existing slot instead of creating new one)
Write-Host "10. UPDATE SLOT (FIXED)" -ForegroundColor Magenta
Write-Host "=======================" -ForegroundColor Magenta
$slotUpdateBody = @{
    slotType = "STANDARD"
    reservePrice = 75000
    category = "Technology"
    description = "Updated test slot via API"
} | ConvertTo-Json

$slotResponse = Test-ApiEndpoint -Name "Update Slot" -Method "PUT" -Endpoint "/api/slots/SLOT-005" -Body $slotUpdateBody

# Extract slot ID for further tests
$slotId = $null
if ($slotResponse) {
    try {
        $slotData = $slotResponse.Content | ConvertFrom-Json
        $slotId = $slotData.data.id
        Write-Host "Slot ID extracted: $slotId" -ForegroundColor Green
    } catch {
        Write-Host "Could not extract slot ID" -ForegroundColor Yellow
    }
}

# Test 11: Place a Bid (if we have slot and company IDs)
Write-Host "11. PLACE BID" -ForegroundColor Magenta
Write-Host "=============" -ForegroundColor Magenta
if ($slotId -and $companyId) {
    # Create a test user for bidding
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $testUserBody = @{
        username = "bidtestuser$timestamp"
        email = "bidtest$timestamp@example.com"
        password = "TestPassword123!"
        role = "SPONSOR"
    } | ConvertTo-Json
    
    try {
        $userResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Body $testUserBody -ContentType "application/json" -TimeoutSec 10
        $userData = $userResponse.Content | ConvertFrom-Json
        $testUserId = $userData.data.user.id
        Write-Host "Test user created with ID: $testUserId" -ForegroundColor Green
    } catch {
        Write-Host "Could not create test user: $($_.Exception.Message)" -ForegroundColor Yellow
        $testUserId = "test-user-id" # Fallback
    }
    
    # Use an available slot instead of the occupied one
    $availableSlotId = "SLOT-005"  # This slot is AVAILABLE
    
    $bidBody = @{
        slotId = $availableSlotId
        companyId = $companyId
        userId = $testUserId
        amount = 130000
        bidderInfo = @{
            contactPerson = "John Doe"
            phone = "+254700000000"
            notes = "Test bid for API validation"
        }
    } | ConvertTo-Json

    Test-ApiEndpoint -Name "Place Bid" -Method "POST" -Endpoint "/api/bidding" -Body $bidBody
} else {
    Write-Host "Skipping bid placement - missing required IDs" -ForegroundColor Yellow
}

# Test 12: File Upload System
Write-Host "12. FILE UPLOAD SYSTEM" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

# Test 12.1: List uploaded files
Test-ApiEndpoint -Name "List Uploaded Files" -Method "GET" -Endpoint "/api/uploads/files"

# Test 12.2: Upload sponsor asset (if we have a company ID)
if ($companyId) {
    # Create a simple test file content
    $testFileContent = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    $testFileBytes = [System.Convert]::FromBase64String($testFileContent)
    
    # Create multipart form data for file upload
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"assets`"; filename=`"test-logo.png`"",
        "Content-Type: image/png",
        "",
        [System.Text.Encoding]::UTF8.GetString($testFileBytes),
        "--$boundary--",
        ""
    ) -join $LF
    
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyLines)
    
    try {
        $uploadResponse = Invoke-WebRequest -Uri "$baseUrl/api/uploads/sponsors/$companyId" -Method POST -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 10
        Write-Host "SUCCESS Upload Sponsor Asset - Status: $($uploadResponse.StatusCode)" -ForegroundColor Green
        $testResults.Passed++
    } catch {
        Write-Host "ERROR Upload Sponsor Asset - Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
    }
    $testResults.Total++
} else {
    Write-Host "Skipping sponsor asset upload - missing company ID" -ForegroundColor Yellow
}

# Test 12.3: Upload AR content
$arTestContent = '{"type": "hologram", "settings": {"intensity": 0.8, "color": "#00ff00"}}'
$arTestBytes = [System.Text.Encoding]::UTF8.GetBytes($arTestContent)

$boundary = [System.Guid]::NewGuid().ToString()
$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"arAssets`"; filename=`"test-config.json`"",
    "Content-Type: application/json",
    "",
    $arTestContent,
    "--$boundary--",
    ""
) -join $LF

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyLines)

try {
    $arUploadResponse = Invoke-WebRequest -Uri "$baseUrl/api/uploads/ar-content" -Method POST -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 10
    Write-Host "SUCCESS Upload AR Content - Status: $($arUploadResponse.StatusCode)" -ForegroundColor Green
    $testResults.Passed++
} catch {
    Write-Host "ERROR Upload AR Content - Error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Failed++
}
$testResults.Total++

# Test 12.4: List files after upload
Test-ApiEndpoint -Name "List Files After Upload" -Method "GET" -Endpoint "/api/uploads/files"

# Test 13: AR Content Management
Write-Host "13. AR CONTENT MANAGEMENT" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

# Test 13.1: Get all AR content
Test-ApiEndpoint -Name "Get All AR Content" -Method "GET" -Endpoint "/api/ar-content"

# Test 13.2: Create AR content (if we have a slot ID)
if ($slotId) {
    $arContentBody = @{
        title = "Test AR Content"
        contentType = "LOGO_HOLOGRAM"
        description = "Test AR content for API validation"
        contentData = @{
            intensity = 0.8
            color = "#00ff00"
            duration = 5000
        }
        slotId = $slotId
        isActive = $true
    } | ConvertTo-Json

    try {
        $arResponse = Invoke-WebRequest -Uri "$baseUrl/api/ar-content" -Method POST -Body $arContentBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "SUCCESS Create AR Content - Status: $($arResponse.StatusCode)" -ForegroundColor Green
        $arContentData = $arResponse.Content | ConvertFrom-Json
        $arContentId = $arContentData.data.arContent.id
        Write-Host "AR Content ID: $arContentId" -ForegroundColor Cyan
        $testResults.Passed++
    } catch {
        Write-Host "ERROR Create AR Content - Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
    }
    $testResults.Total++
} else {
    Write-Host "Skipping AR content creation - missing slot ID" -ForegroundColor Yellow
}

# Test 13.3: Get AR content by ID (if we have an AR content ID)
if ($arContentId) {
    Test-ApiEndpoint -Name "Get AR Content by ID" -Method "GET" -Endpoint "/api/ar-content/$arContentId"
} else {
    Write-Host "Skipping get AR content by ID - missing AR content ID" -ForegroundColor Yellow
}

# Test 13.4: Create hologram effect (if we have AR content ID)
if ($arContentId) {
    $hologramBody = @{
        effectType = "PROJECTION"
        settings = @{
            intensity = 0.9
            color = "#ff0000"
            duration = 3000
        }
        slotId = $slotId
        isActive = $true
    } | ConvertTo-Json

    try {
        $hologramResponse = Invoke-WebRequest -Uri "$baseUrl/api/ar-content/$arContentId/hologram-effects" -Method POST -Body $hologramBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "SUCCESS Create Hologram Effect - Status: $($hologramResponse.StatusCode)" -ForegroundColor Green
        $testResults.Passed++
    } catch {
        Write-Host "ERROR Create Hologram Effect - Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
    }
    $testResults.Total++
} else {
    Write-Host "Skipping hologram effect creation - missing AR content ID" -ForegroundColor Yellow
}

# Test 13.5: Get hologram effects for AR content
if ($arContentId) {
    Test-ApiEndpoint -Name "Get Hologram Effects" -Method "GET" -Endpoint "/api/ar-content/$arContentId/hologram-effects"
} else {
    Write-Host "Skipping get hologram effects - missing AR content ID" -ForegroundColor Yellow
}

# Test 13.6: Activate AR content
if ($arContentId) {
    Test-ApiEndpoint -Name "Activate AR Content" -Method "POST" -Endpoint "/api/ar-content/$arContentId/activate"
} else {
    Write-Host "Skipping activate AR content - missing AR content ID" -ForegroundColor Yellow
}

# Test 13.7: Deactivate AR content
if ($arContentId) {
    Test-ApiEndpoint -Name "Deactivate AR Content" -Method "POST" -Endpoint "/api/ar-content/$arContentId/deactivate"
} else {
    Write-Host "Skipping deactivate AR content - missing AR content ID" -ForegroundColor Yellow
}

# Test 14: Device Management
Write-Host "14. DEVICE MANAGEMENT" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

# Test 14.1: Get all devices
Test-ApiEndpoint -Name "Get All Devices" -Method "GET" -Endpoint "/api/devices"

# Test 14.2: Create a test device
$deviceBody = @{
    deviceId = "TEST-DEVICE-$(Get-Date -Format 'yyyyMMddHHmmss')"
    deviceType = "BEAMER"
    name = "Test Beamer Device"
    status = "ONLINE"
    location = @{
        latitude = -1.2921
        longitude = 36.8219
        address = "Nairobi, Kenya"
    }
    config = @{
        resolution = "1920x1080"
        brightness = 80
        contrast = 70
    }
} | ConvertTo-Json

try {
    $deviceResponse = Invoke-WebRequest -Uri "$baseUrl/api/devices" -Method POST -Body $deviceBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS Create Device - Status: $($deviceResponse.StatusCode)" -ForegroundColor Green
    $deviceData = $deviceResponse.Content | ConvertFrom-Json
    $deviceId = $deviceData.data.device.id
    Write-Host "Device ID: $deviceId" -ForegroundColor Cyan
    $testResults.Passed++
} catch {
    Write-Host "ERROR Create Device - Error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Failed++
}
$testResults.Total++

# Test 14.3: Get device by ID
if ($deviceId) {
    Test-ApiEndpoint -Name "Get Device by ID" -Method "GET" -Endpoint "/api/devices/$deviceId"
} else {
    Write-Host "Skipping get device by ID - missing device ID" -ForegroundColor Yellow
}

# Test 14.4: Update device heartbeat
if ($deviceId) {
    $heartbeatBody = @{
        status = "ONLINE"
        location = @{
            latitude = -1.2921
            longitude = 36.8219
            address = "Nairobi, Kenya"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
    } | ConvertTo-Json

    try {
        $heartbeatResponse = Invoke-WebRequest -Uri "$baseUrl/api/devices/$deviceId/heartbeat" -Method POST -Body $heartbeatBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "SUCCESS Update Device Heartbeat - Status: $($heartbeatResponse.StatusCode)" -ForegroundColor Green
        $testResults.Passed++
    } catch {
        Write-Host "ERROR Update Device Heartbeat - Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
    }
    $testResults.Total++
} else {
    Write-Host "Skipping device heartbeat - missing device ID" -ForegroundColor Yellow
}

# Test 14.5: Update device status
if ($deviceId) {
    $statusBody = @{
        status = "MAINTENANCE"
    } | ConvertTo-Json

    try {
        $statusResponse = Invoke-WebRequest -Uri "$baseUrl/api/devices/$deviceId/status" -Method POST -Body $statusBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "SUCCESS Update Device Status - Status: $($statusResponse.StatusCode)" -ForegroundColor Green
        $testResults.Passed++
    } catch {
        Write-Host "ERROR Update Device Status - Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
    }
    $testResults.Total++
} else {
    Write-Host "Skipping device status update - missing device ID" -ForegroundColor Yellow
}

# Test 14.6: Get devices by type
Test-ApiEndpoint -Name "Get Devices by Type (BEAMER)" -Method "GET" -Endpoint "/api/devices/type/BEAMER"

# Test 14.7: Get devices by status
Test-ApiEndpoint -Name "Get Devices by Status (ONLINE)" -Method "GET" -Endpoint "/api/devices/status/ONLINE"

# Test 14.8: Get device statistics
Test-ApiEndpoint -Name "Get Device Statistics" -Method "GET" -Endpoint "/api/devices/stats/overview"

# Test 15: Analytics System
Write-Host "15. ANALYTICS SYSTEM" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta

# Test 15.1: Get analytics overview
Test-ApiEndpoint -Name "Get Analytics Overview" -Method "GET" -Endpoint "/api/analytics/overview"

# Test 15.2: Get analytics events
Test-ApiEndpoint -Name "Get Analytics Events" -Method "GET" -Endpoint "/api/analytics/events"

# Test 15.3: Track analytics event
$analyticsEventBody = @{
    eventType = "SLOT_VIEW"
    slotId = "SLOT-001"
    companyId = "COMP-001"
    metadata = @{
        viewDuration = 30
        interactionType = "hover"
        deviceType = "desktop"
    }
    sessionId = "session-$(Get-Date -Format 'yyyyMMddHHmmss')"
    deviceInfo = @{
        userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        screenResolution = "1920x1080"
        language = "en-US"
    }
} | ConvertTo-Json

try {
    $analyticsResponse = Invoke-WebRequest -Uri "$baseUrl/api/analytics/events" -Method POST -Body $analyticsEventBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS Track Analytics Event - Status: $($analyticsResponse.StatusCode)" -ForegroundColor Green
    $testResults.Passed++
} catch {
    Write-Host "ERROR Track Analytics Event - Error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Failed++
}
$testResults.Total++

# Test 15.4: Track another analytics event (QR scan)
$qrScanEventBody = @{
    eventType = "QR_SCAN"
    slotId = "SLOT-002"
    companyId = "COMP-002"
    metadata = @{
        qrCode = "QR-COMP-002-SLOT-002"
        scanLocation = "Nairobi, Kenya"
        scanTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
    sessionId = "session-$(Get-Date -Format 'yyyyMMddHHmmss')"
    deviceInfo = @{
        userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"
        screenResolution = "375x812"
        language = "en-KE"
    }
} | ConvertTo-Json

try {
    $qrScanResponse = Invoke-WebRequest -Uri "$baseUrl/api/analytics/events" -Method POST -Body $qrScanEventBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS Track QR Scan Event - Status: $($qrScanResponse.StatusCode)" -ForegroundColor Green
    $testResults.Passed++
} catch {
    Write-Host "ERROR Track QR Scan Event - Error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Failed++
}
$testResults.Total++

# Test 15.5: Get slot analytics
Test-ApiEndpoint -Name "Get Slot Analytics" -Method "GET" -Endpoint "/api/analytics/slots/SLOT-001"

# Test 15.6: Get company analytics
Test-ApiEndpoint -Name "Get Company Analytics" -Method "GET" -Endpoint "/api/analytics/companies/COMP-001"

# Test 15.7: Get performance metrics
Test-ApiEndpoint -Name "Get Performance Metrics" -Method "GET" -Endpoint "/api/analytics/performance"

# Test 15.8: Get performance metrics for 7 days
Test-ApiEndpoint -Name "Get Performance Metrics (7 days)" -Method "GET" -Endpoint "/api/analytics/performance?period=7d"

# Test Results Summary
Write-Host ""
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.Total)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red

$successRate = if ($testResults.Total -gt 0) { [math]::Round(($testResults.Passed / $testResults.Total) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "API Testing Complete!" -ForegroundColor Cyan
