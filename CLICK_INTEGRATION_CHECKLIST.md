# Click Payment Integration Checklist

## 🔧 Current Configuration Status

### ✅ Technical Setup (COMPLETE)
- [x] Click payment endpoints configured
- [x] IP whitelist updated with all Click IPs
- [x] Signature generation working
- [x] Error handling implemented
- [x] Logging and debugging enabled

### ⚠️ Click Merchant Setup (NEEDS VERIFICATION)

#### Current Credentials (TEST):
```
SERVICE_ID: 82886
MERCHANT_ID: 46111
SECRET_KEY: 9TDkmspVHm7LZ
MERCHANT_USER_ID: 64082
```

## 🚨 URGENT: Tell Click Support

### 1. Register Callback URLs
**Click admin panelida quyidagi URL larni ro'yxatdan o'tkazing:**

- **Prepare URL**: `https://pretest-registration.onrender.com/api/payments/click/prepare`
- **Complete URL**: `https://pretest-registration.onrender.com/api/payments/click/complete`

### 2. Verify Merchant Credentials
**Click hodimlariga so'rang:**
- Bu test environment mi yoki production mi?
- SERVICE_ID va MERCHANT_ID mos keladimi?
- Callback URL lar ro'yxatdan o'tganmi?

### 3. Error -101 Analysis
**Click hodimlariga ayting:**
- -101 error kelayapti
- -9 (invalid request origin) ham qaytgan
- Callback URL lari tekshirilsin

## 🔍 Debugging Info for Click Support

### Request Details:
```json
{
  "prepare_endpoint": "https://pretest-registration.onrender.com/api/payments/click/prepare",
  "complete_endpoint": "https://pretest-registration.onrender.com/api/payments/click/complete",
  "domain": "pretest-uzbekistan.uz",
  "merchant_id": 46111,
  "service_id": 82886,
  "allowed_ips": "185.8.212.184,185.8.212.185,185.8.212.186,185.8.212.176-183"
}
```

### Server Configuration:
- ✅ HTTPS enabled
- ✅ JSON response format
- ✅ IP validation (can be disabled for testing)
- ✅ Signature validation
- ✅ Error logging

## 📋 Next Steps

### For Click Support:
1. **Verify callback URLs are registered**
2. **Check if SERVICE_ID 82886 is active**
3. **Confirm MERCHANT_ID 46111 belongs to your account**
4. **Test with -101 error - likely URL not registered**

### For Development:
1. **Get production credentials** if using test
2. **Update environment variables** with real credentials
3. **Test again** after Click confirms URL registration

## 🔧 Quick Fix Commands

### Temporarily disable IP validation:
```bash
# In .env file
STRICT_IP_VALIDATION=false
```

### Enable detailed logging:
Already enabled - check server logs for Click requests

### Test signature generation:
```bash
cd backend && node test-click-config.js
```

## 🎯 Most Likely Issue

**Click admin panelida callback URL lar ro'yxatdan o'tmagan!**

Bu URL larni Click admin panel ga qo'shing:
- https://pretest-registration.onrender.com/api/payments/click/prepare
- https://pretest-registration.onrender.com/api/payments/click/complete