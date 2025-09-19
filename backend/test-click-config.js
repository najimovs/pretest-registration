import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Click payment configuration
const CLICK_CONFIG = {
  SERVICE_ID: parseInt(process.env.CLICK_SERVICE_ID),
  MERCHANT_ID: parseInt(process.env.CLICK_MERCHANT_ID),
  SECRET_KEY: process.env.CLICK_SECRET_KEY,
  MERCHANT_USER_ID: parseInt(process.env.CLICK_MERCHANT_USER_ID)
};

console.log('🔧 Click Configuration Test:');
console.log('========================================');
console.log('SERVICE_ID:', CLICK_CONFIG.SERVICE_ID);
console.log('MERCHANT_ID:', CLICK_CONFIG.MERCHANT_ID);
console.log('SECRET_KEY:', CLICK_CONFIG.SECRET_KEY ? `${CLICK_CONFIG.SECRET_KEY.substring(0, 5)}***` : 'NOT SET');
console.log('MERCHANT_USER_ID:', CLICK_CONFIG.MERCHANT_USER_ID);
console.log('========================================');

// Check if all required configs exist
const missingConfigs = [];
if (!CLICK_CONFIG.SERVICE_ID) missingConfigs.push('CLICK_SERVICE_ID');
if (!CLICK_CONFIG.MERCHANT_ID) missingConfigs.push('CLICK_MERCHANT_ID');
if (!CLICK_CONFIG.SECRET_KEY) missingConfigs.push('CLICK_SECRET_KEY');
if (!CLICK_CONFIG.MERCHANT_USER_ID) missingConfigs.push('CLICK_MERCHANT_USER_ID');

if (missingConfigs.length > 0) {
    console.log('❌ Missing configurations:', missingConfigs.join(', '));
} else {
    console.log('✅ All Click configurations are present');
}

// Test signature creation
function createClickSignature(params, isPrepare = true) {
  let signString;
  if (isPrepare) {
    signString = `${params.click_trans_id}${params.service_id}${CLICK_CONFIG.SECRET_KEY}${params.merchant_trans_id}${params.amount}${params.action}${params.sign_time}`;
  } else {
    signString = `${params.click_trans_id}${params.service_id}${CLICK_CONFIG.SECRET_KEY}${params.merchant_trans_id}${params.merchant_prepare_id}${params.amount}${params.action}${params.sign_time}`;
  }
  return crypto.createHash('md5').update(signString).digest('hex');
}

// Test signature generation
const testParams = {
    click_trans_id: '12345',
    service_id: CLICK_CONFIG.SERVICE_ID,
    merchant_trans_id: 'test_123',
    amount: '100',
    action: '0',
    sign_time: '2024-01-01 12:00:00'
};

console.log('\n🔐 Signature Test:');
console.log('Test params:', testParams);
const signature = createClickSignature(testParams, true);
console.log('Generated signature:', signature);

// Test URLs
console.log('\n🌐 Payment URLs:');
console.log('Click Button URL:');
console.log(`https://my.click.uz/services/pay?service_id=${CLICK_CONFIG.SERVICE_ID}&merchant_id=${CLICK_CONFIG.MERCHANT_ID}&amount=100&transaction_param=test_123&merchant_user_id=${CLICK_CONFIG.MERCHANT_USER_ID}`);

// Test IP validation
const allowedIPs = process.env.CLICK_ALLOWED_IPS
    ? process.env.CLICK_ALLOWED_IPS.split(',').map(ip => ip.trim())
    : ['185.8.212.184', '185.8.212.185', '185.8.212.186'];

console.log('\n🌍 IP Validation:');
console.log('Allowed IPs:', allowedIPs);
console.log('STRICT_IP_VALIDATION:', process.env.STRICT_IP_VALIDATION);

// Render deployment URL check
console.log('\n🚀 Deployment URLs:');
console.log('Production backend URL: https://pretest-registration.onrender.com');
console.log('Click prepare endpoint: https://pretest-registration.onrender.com/api/payments/click/prepare');
console.log('Click complete endpoint: https://pretest-registration.onrender.com/api/payments/click/complete');

console.log('\n📋 Next Steps:');
console.log('1. Verify merchant credentials with Click support');
console.log('2. Ensure Render URL is registered with Click');
console.log('3. Test with real Click transaction');
console.log('4. Check server logs for incoming Click requests');