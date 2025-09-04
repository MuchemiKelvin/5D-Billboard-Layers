#!/bin/bash

# BeamerShow API Testing with cURL
# Make sure the backend server is running on port 5000

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 BeamerShow API Testing with cURL${NC}"
echo "📍 Base URL: $BASE_URL"
echo ""

# Test counter
passed=0
failed=0

# Helper function to test endpoints
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}🔍 Testing: $description${NC}"
    echo "   $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "   ${GREEN}✅ SUCCESS ($http_code)${NC}"
        echo "   📊 Response: ${response_body:0:200}..."
        ((passed++))
    else
        echo -e "   ${RED}❌ FAILED ($http_code)${NC}"
        echo "   💥 Error: $response_body"
        ((failed++))
    fi
    echo ""
}

# Test API Overview
test_endpoint "GET" "" "" "API Overview"

# Test Authentication
test_endpoint "POST" "/auth/register" '{"username":"testuser","email":"test@example.com","password":"TestPassword123!","company":"Test Corp","role":"operator"}' "User Registration"

test_endpoint "POST" "/auth/login" '{"email":"test@example.com","password":"TestPassword123!"}' "User Login"

# Test Slots
test_endpoint "GET" "/slots" "" "Get All Slots"
test_endpoint "GET" "/slots/1" "" "Get Slot by ID"

# Test Sponsors
test_endpoint "GET" "/sponsors" "" "Get All Sponsors"
test_endpoint "GET" "/sponsors/1" "" "Get Sponsor by ID"

# Test Blocks
test_endpoint "GET" "/blocks" "" "Get All Blocks"
test_endpoint "GET" "/blocks/active" "" "Get Active Block"

# Test Analytics
test_endpoint "GET" "/analytics/overview" "" "Get Analytics Overview"

# Test AR
test_endpoint "GET" "/ar/models" "" "Get AR Models"
test_endpoint "GET" "/ar/triggers" "" "Get AR Triggers"

# Test Bidding
test_endpoint "GET" "/bidding/active" "" "Get Active Bids"

# Test Sync
test_endpoint "GET" "/sync/status" "" "Get Sync Status"

# Test Devices
test_endpoint "GET" "/devices" "" "Get All Devices"

# Test Beamer
test_endpoint "GET" "/beamer/status" "" "Get Beamer Status"

# Test iPad
test_endpoint "GET" "/ipad/status" "" "Get iPad Status"

# Print results
total=$((passed + failed))
echo -e "${BLUE}📊 Test Results:${NC}"
echo -e "${GREEN}✅ Passed: $passed${NC}"
echo -e "${RED}❌ Failed: $failed${NC}"
echo -e "${BLUE}📊 Total: $total${NC}"

if [ $total -gt 0 ]; then
    success_rate=$(echo "scale=1; $passed * 100 / $total" | bc)
    echo -e "${BLUE}📈 Success Rate: ${success_rate}%${NC}"
fi

echo ""
if [ $failed -gt 0 ]; then
    echo -e "${RED}💡 Some tests failed. Make sure the backend server is running on port 5000.${NC}"
else
    echo -e "${GREEN}🎉 All tests passed!${NC}"
fi
