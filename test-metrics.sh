#!/bin/bash

# Test script to generate metrics for the Elegant-Tex application
# This script sends requests to the metrics example endpoints to generate metrics

# Configuration
API_URL="http://localhost:8080/api/v1/metrics-example"
MARKETPLACES=("Amazon" "Shopify" "Etsy" "eBay" "Walmart")
MIN_AMOUNT=10
MAX_AMOUNT=500

# Function to generate a random number between min and max
random_number() {
  local min=$1
  local max=$2
  echo $(( $RANDOM % ($max - $min + 1) + $min ))
}

# Function to generate a random marketplace
random_marketplace() {
  local index=$(( $RANDOM % ${#MARKETPLACES[@]} ))
  echo "${MARKETPLACES[$index]}"
}

# Function to generate a random amount
random_amount() {
  local amount=$(random_number $MIN_AMOUNT $MAX_AMOUNT)
  echo "$amount"
}

# Function to send a request to create an order
create_order() {
  local marketplace=$(random_marketplace)
  local amount=$(random_amount)
  
  echo "Creating order for $marketplace with amount $amount"
  
  curl -X POST "$API_URL/orders" \
    -H "Content-Type: application/json" \
    -d "{\"marketplaceName\":\"$marketplace\",\"totalAmount\":$amount}"
  
  echo -e "\n"
}

# Function to send a request to complete an order workflow
complete_order_workflow() {
  local marketplace=$(random_marketplace)
  local amount=$(random_amount)
  
  echo "Completing order workflow for $marketplace with amount $amount"
  
  curl -X POST "$API_URL/orders/complete-workflow" \
    -H "Content-Type: application/json" \
    -d "{\"marketplaceName\":\"$marketplace\",\"totalAmount\":$amount}"
  
  echo -e "\n"
}

# Main script
echo "Starting metrics test script..."
echo "Press Ctrl+C to stop"

# Generate metrics in a loop
while true; do
  # Randomly choose between creating an order or completing an order workflow
  if [ $(random_number 0 1) -eq 0 ]; then
    create_order
  else
    complete_order_workflow
  fi
  
  # Wait a random amount of time between 1 and 5 seconds
  sleep $(random_number 1 5)
done
