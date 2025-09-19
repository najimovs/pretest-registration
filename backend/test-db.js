import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        console.log('🔗 Testing MongoDB connection...');
        console.log('URI (masked):', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully!');

        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Available collections:', collections.map(c => c.name));

        await mongoose.connection.close();
        console.log('🔒 Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        process.exit(1);
    }
}

testConnection();