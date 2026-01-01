#!/bin/bash
# Verify WAHA Plus is active

echo "🔍 Checking WAHA tier from logs..."
echo ""
echo "Expected: 'tier':'PLUS'"
echo "Previous: 'tier':'CORE'"
echo ""
echo "Look for this line in Coolify logs:"
echo "INFO (Bootstrap): Environment {...'tier':'PLUS'...}"
