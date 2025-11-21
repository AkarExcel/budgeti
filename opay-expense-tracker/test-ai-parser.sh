#!/bin/bash

# Test script for AI Voice Parser Edge Function
# Run this after deploying the ai-voice-parser function

SUPABASE_URL="https://fpjvwyaysvcklojntggf.supabase.co"
FUNCTION_URL="${SUPABASE_URL}/functions/v1/ai-voice-parser"

echo "========================================"
echo "AI Voice Parser - Test Suite"
echo "========================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local transcript="$2"
    local expected_type="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    echo -e "${YELLOW}Test $TESTS_RUN: $test_name${NC}"
    echo "Input: \"$transcript\""
    
    response=$(curl -s -X POST "$FUNCTION_URL" \
        -H "Content-Type: application/json" \
        -d "{\"transcript\": \"$transcript\"}")
    
    echo "Response: $response"
    
    # Check if response contains expected type
    if echo "$response" | grep -q "\"type\":\"$expected_type\""; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# Test 1: Simple Expense
run_test "Simple expense" \
    "spent 20 on lunch" \
    "expense"

# Test 2: Complex Expense
run_test "Complex expense with merchant" \
    "paid 45 dollars for groceries at Walmart yesterday" \
    "expense"

# Test 3: Simple Income
run_test "Simple income" \
    "earned 500 from freelance" \
    "income"

# Test 4: Complex Income
run_test "Complex income with source" \
    "received 2000 salary from Acme Corp today" \
    "income"

# Test 5: Transport Expense
run_test "Transport expense" \
    "25 for uber ride home" \
    "expense"

# Test 6: Coffee Purchase
run_test "Coffee purchase" \
    "bought coffee for about 5 bucks at Starbucks" \
    "expense"

# Test 7: Bonus Income
run_test "Bonus payment" \
    "bonus payment 1000 dollars" \
    "income"

# Test 8: Ambiguous Input
run_test "Ambiguous input" \
    "got 100 dollars" \
    "income"

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
