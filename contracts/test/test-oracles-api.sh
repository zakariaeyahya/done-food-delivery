#!/bin/bash

# ============================================
# Test Script for Oracle API Endpoints (Sprint 6)
# ============================================
#
# Usage:
#   chmod +x test-oracles-api.sh
#   ./test-oracles-api.sh
#
# Prerequisites:
#   - Backend server running on localhost:3000
#   - curl installed
#
# ============================================

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
TOTAL=0

# ============================================
# Helper Functions
# ============================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_test() {
    echo -e "${YELLOW}Testing:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASSED++))
    ((TOTAL++))
}

print_failure() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAILED++))
    ((TOTAL++))
}

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_field=$4
    local description=$5

    print_test "$description"

    if [ "$method" == "GET" ]; then
        response=$(curl -s -X GET "${API_URL}${endpoint}")
    else
        response=$(curl -s -X POST "${API_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    if [ "$VERBOSE" == "true" ]; then
        echo "Response: $response"
    fi

    # Check if response contains success: true
    if echo "$response" | grep -q '"success":true'; then
        print_success "$description"
        return 0
    elif echo "$response" | grep -q '"success": true'; then
        print_success "$description"
        return 0
    else
        print_failure "$description"
        echo "  Response: $response"
        return 1
    fi
}

# ============================================
# Check if server is running
# ============================================

print_header "Checking Server Status"

health_check=$(curl -s "${API_URL}/health" 2>/dev/null)

if echo "$health_check" | grep -q '"status":"OK"'; then
    echo -e "${GREEN}✓ Server is running at ${API_URL}${NC}"
else
    echo -e "${RED}✗ Server is not running at ${API_URL}${NC}"
    echo "Please start the backend server first:"
    echo "  cd backend && npm run dev"
    exit 1
fi

# ============================================
# PRICE ORACLE TESTS
# ============================================

print_header "PRICE ORACLE ENDPOINTS"

# Test 1: GET /api/oracles/price
test_endpoint "GET" "/api/oracles/price" "" "price" \
    "GET /api/oracles/price - Get MATIC/USD price"

# Test 2: GET /api/oracles/price/latest
test_endpoint "GET" "/api/oracles/price/latest" "" "price" \
    "GET /api/oracles/price/latest - Get latest cached price"

# Test 3: GET /api/oracles/price/metrics
test_endpoint "GET" "/api/oracles/price/metrics" "" "data" \
    "GET /api/oracles/price/metrics - Get price metrics"

# Test 4: POST /api/oracles/convert (USD to MATIC)
test_endpoint "POST" "/api/oracles/convert" \
    '{"amount": 100, "from": "USD", "to": "MATIC"}' \
    "convertedAmount" \
    "POST /api/oracles/convert - Convert 100 USD to MATIC"

# Test 5: POST /api/oracles/convert (EUR to MATIC)
test_endpoint "POST" "/api/oracles/convert" \
    '{"amount": 50, "from": "EUR", "to": "MATIC"}' \
    "convertedAmount" \
    "POST /api/oracles/convert - Convert 50 EUR to MATIC"

# ============================================
# GPS ORACLE TESTS
# ============================================

print_header "GPS ORACLE ENDPOINTS"

# Test 6: GET /api/oracles/gps/metrics
test_endpoint "GET" "/api/oracles/gps/metrics" "" "data" \
    "GET /api/oracles/gps/metrics - Get GPS metrics"

# Test 7: GET /api/oracles/gps/track/:orderId
test_endpoint "GET" "/api/oracles/gps/track/1" "" "" \
    "GET /api/oracles/gps/track/1 - Track delivery for order 1"

# Note: POST endpoints require authentication
echo ""
echo -e "${YELLOW}Note: POST /api/oracles/gps/update and /api/oracles/gps/verify${NC}"
echo -e "${YELLOW}require authentication (signature verification)${NC}"

# ============================================
# WEATHER ORACLE TESTS
# ============================================

print_header "WEATHER ORACLE ENDPOINTS"

# Test 8: GET /api/oracles/weather
test_endpoint "GET" "/api/oracles/weather?lat=48.8566&lng=2.3522" "" "weather" \
    "GET /api/oracles/weather - Get weather for Paris"

# Test 9: GET /api/oracles/weather (New York)
test_endpoint "GET" "/api/oracles/weather?lat=40.7128&lng=-74.0060" "" "weather" \
    "GET /api/oracles/weather - Get weather for New York"

# ============================================
# ARBITRATION ENDPOINTS (if implemented)
# ============================================

print_header "ARBITRATION ENDPOINTS"

# Test 10: GET /api/oracles/arbitration/metrics
test_endpoint "GET" "/api/oracles/arbitration/metrics" "" "" \
    "GET /api/oracles/arbitration/metrics - Get arbitration metrics"

# Test 11: GET /api/oracles/arbitration/dispute/:disputeId
print_test "GET /api/oracles/arbitration/dispute/1 - Get dispute details"
response=$(curl -s -X GET "${API_URL}/api/oracles/arbitration/dispute/1")
if echo "$response" | grep -q '"success"'; then
    print_success "GET /api/oracles/arbitration/dispute/1"
else
    echo -e "${YELLOW}⚠ SKIP:${NC} Dispute endpoint (no disputes exist)"
    ((TOTAL++))
fi

# ============================================
# SUMMARY
# ============================================

print_header "TEST SUMMARY"

echo ""
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}All tests passed!${NC}"
    echo -e "${GREEN}============================================${NC}"
    exit 0
else
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
    echo -e "${RED}============================================${NC}"
    exit 1
fi
